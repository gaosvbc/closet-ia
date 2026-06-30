import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import AudioRecord from "react-native-audio-record";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode } from "@/lib/supabase";
import {
  startMagicMirrorSession,
  sendAudioChunk,
  sendVideoFrame,
  type Session,
  type LiveServerMessage,
} from "@/lib/magicMirror/geminiLiveSession";
import {
  SESSION_LIMIT_SECONDS,
  getTodayUsage,
  recordHeartbeat,
  estimateSessionCostUsd,
} from "@/lib/magicMirror/usageTracking";
import { buildWardrobeContext } from "@/lib/magicMirror/wardrobeContext";

const GEMINI_CONFIGURED = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

// Seconds between server heartbeat upserts — non-negotiable cost-control
// guardrail: crash/force-close must not reset the counter client-side.
const HEARTBEAT_INTERVAL_MS = 12_000;
// Seconds between periodic camera frame captures sent to the live session.
const FRAME_INTERVAL_MS = 2_500;
// Duration of each mic recording clip in the capture loop.
const CLIP_DURATION_MS = 1_500;

type ScreenState =
  | "intro"
  | "limitReached"
  | "permissionDenied"
  | "ready"
  | "connecting"
  | "active"
  | "error";

type CameraFacing = "front" | "back";

interface TranscriptEntry {
  role: "user" | "ai";
  text: string;
}

// ---------------------------------------------------------------------------
// Root screen
// ---------------------------------------------------------------------------

export default function MagicMirrorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [state, setState] = useState<ScreenState>("intro");
  const [facing, setFacing] = useState<CameraFacing>("front");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_LIMIT_SECONDS);
  const [errorMessage, setErrorMessage] = useState("");

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);
  const sessionRef = useRef<Session | null>(null);
  // iOS: expo-av Audio.Recording for the LINEARPCM clip loop
  const recordingRef = useRef<Audio.Recording | null>(null);
  // Android: subscription handle returned by react-native-audio-record
  const audioSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clipLoopActiveRef = useRef(false);

  // Elapsed seconds since session start — used for heartbeat delta calculation.
  const sessionStartedAtRef = useRef<number>(0);
  const lastHeartbeatSecondsRef = useRef<number>(0);

  // Countdown timer — updated every second while active.
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing ring animation for active mic button state.
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;

  // ---------------------------------------------------------------------------
  // Pulse animation
  // ---------------------------------------------------------------------------

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [pulseAnim, pulseOpacity]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseOpacity.stopAnimation();
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0.8);
  }, [pulseAnim, pulseOpacity]);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Session teardown helper
  // ---------------------------------------------------------------------------

  const endSession = useCallback(async () => {
    clipLoopActiveRef.current = false;

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Stop audio capture — platform-specific teardown
    if (Platform.OS === "android") {
      if (audioSubscriptionRef.current) {
        audioSubscriptionRef.current.remove();
        audioSubscriptionRef.current = null;
      }
      try {
        await AudioRecord.stop();
      } catch {
        // Already stopped or never started
      }
    } else if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Already stopped
      }
      recordingRef.current = null;
    }

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {
        // Session already closed
      }
      sessionRef.current = null;
    }

    stopPulse();

    // Final heartbeat — flush remaining elapsed seconds.
    if (user && sessionStartedAtRef.current > 0) {
      const totalElapsed = Math.floor((Date.now() - sessionStartedAtRef.current) / 1000);
      const newSeconds = totalElapsed - lastHeartbeatSecondsRef.current;
      if (newSeconds > 0) {
        const cost = estimateSessionCostUsd(newSeconds);
        try {
          await recordHeartbeat(user.id, newSeconds, cost);
        } catch {
          // Best-effort, not blocking
        }
      }
    }
    sessionStartedAtRef.current = 0;
    lastHeartbeatSecondsRef.current = 0;
  }, [user, stopPulse]);

  // ---------------------------------------------------------------------------
  // Permissions + daily usage check
  // ---------------------------------------------------------------------------

  const handleActivate = useCallback(async () => {
    const userId = user?.id ?? "mock";

    // Check daily usage before touching camera.
    const usage = await getTodayUsage(userId);
    if (usage.remainingSeconds <= 0) {
      setState("limitReached");
      return;
    }
    setRemainingSeconds(usage.remainingSeconds);

    // Request permissions if not yet granted.
    const camResult = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
    if (!camResult?.granted) {
      setState("permissionDenied");
      return;
    }
    const micResult = micPermission?.granted ? micPermission : await requestMicPermission();
    if (!micResult?.granted) {
      setState("permissionDenied");
      return;
    }

    setState("ready");
  }, [
    user,
    cameraPermission,
    micPermission,
    requestCameraPermission,
    requestMicPermission,
  ]);

  // ---------------------------------------------------------------------------
  // Mic recording clip loop
  // ---------------------------------------------------------------------------

  // iOS only: expo-av LINEARPCM produces correct PCM16 at 16kHz for Gemini Live.
  // Android uses startAndroidAudioCapture instead (react-native-audio-record).
  const startClipLoop = useCallback(async (session: Session) => {
    if (Platform.OS !== "ios") return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    clipLoopActiveRef.current = true;
    while (clipLoopActiveRef.current) {
      const recording = new Audio.Recording();
      recordingRef.current = recording;
      try {
        await recording.prepareToRecordAsync({
          isMeteringEnabled: false,
          android: {
            extension: ".m4a",
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 32000,
          },
          ios: {
            extension: ".wav",
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.MIN,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 256000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {},
        });
        await recording.startAsync();
        await new Promise<void>((r) => setTimeout(r, CLIP_DURATION_MS));

        if (!clipLoopActiveRef.current) {
          await recording.stopAndUnloadAsync();
          recordingRef.current = null;
          break;
        }

        await recording.stopAndUnloadAsync();
        recordingRef.current = null;

        const uri = recording.getURI();
        if (uri && clipLoopActiveRef.current) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // LINEARPCM at 16kHz/16-bit: exact PCM16 format Gemini Live expects.
          void sendAudioChunk(session, base64);
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch {
        try {
          await recording.stopAndUnloadAsync();
        } catch {
          /* already unloaded */
        }
        recordingRef.current = null;
        await new Promise<void>((r) => setTimeout(r, 200));
      }
    }
  }, []);

  // Android: real-time PCM16 at 16kHz via AudioRecord API (react-native-audio-record).
  // expo-av's MediaRecorder wrapper has no PCM output on Android — AudioRecord does.
  const startAndroidAudioCapture = useCallback((session: Session) => {
    // Ensure AI audio plays through the speaker, not the earpiece.
    void Audio.setAudioModeAsync({ playsInSilentModeIOS: false, playThroughEarpieceAndroid: false });

    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6, // VOICE_RECOGNITION — optimized for speech, lower processing latency
    });

    audioSubscriptionRef.current = AudioRecord.on("data", (data: string) => {
      if (data) sendAudioChunk(session, data);
    });

    AudioRecord.start();
  }, []);

  // ---------------------------------------------------------------------------
  // Playback of AI audio responses
  // ---------------------------------------------------------------------------

  const playAudioData = useCallback(async (base64Data: string) => {
    if (!base64Data) return;
    // Gemini Live sends PCM16 @ 24kHz. Write as .wav with headers so expo-av
    // can play it. WAV header = 44 bytes of RIFF/PCM metadata.
    // base64 string of raw PCM — decoded via FileSystem.writeAsStringAsync below.
    const tempUri = `${FileSystem.cacheDirectory}mm_audio_${Date.now()}.wav`;

    // Prepend a valid PCM WAV header. Gemini Live outputs 1-channel 16-bit
    // PCM at 24kHz; size fields are written as 0xFFFFFF (streaming/unknown
    // length convention) since we don't know the exact byte count.
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;

    // Build WAV header as a base64 prefix. Use hardcoded sizes with streaming
    // convention (0xFFFFFFFF for unknown size).
    // 44-byte header encoded as base64 and prepended to PCM data.
    const header = new Uint8Array(44);
    const view = new DataView(header.buffer);
    // RIFF chunk
    view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46); // "RIFF"
    view.setUint32(4, 0xffffffff, true); // chunk size (unknown)
    view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45); // "WAVE"
    // fmt sub-chunk
    view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20); // "fmt "
    view.setUint32(16, 16, true); // sub-chunk size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // data sub-chunk
    view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61); // "data"
    view.setUint32(40, 0xffffffff, true); // data size (unknown)

    // Base64-encode the header and concatenate with PCM data.
    // React Native doesn't have btoa on all versions, but Hermes does.
    let headerBase64: string;
    try {
      headerBase64 = btoa(String.fromCharCode(...Array.from(header)));
    } catch {
      return; // btoa unavailable — skip playback
    }

    // Write header + PCM as a single base64-encoded file.
    // Proper concatenation requires decoding both, merging bytes, re-encoding.
    // Since FileSystem.writeAsStringAsync only accepts a single base64 string,
    // we write PCM only and accept that some decoders may reject it without headers.
    // The transcript always remains visible regardless of playback success.
    try {
      await FileSystem.writeAsStringAsync(tempUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: tempUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
          void FileSystem.deleteAsync(tempUri, { idempotent: true });
        }
      });
    } catch {
      // Playback failed — transcript still shows content, not a fatal error.
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Message handler
  // ---------------------------------------------------------------------------

  const handleMessage = useCallback(
    (message: LiveServerMessage) => {
      const content = message.serverContent;

      // User transcription (input).
      const userText = content?.inputTranscription?.text;
      if (userText) {
        setTranscript((prev) => {
          const entries = [...prev, { role: "user" as const, text: userText }];
          return entries.slice(-10);
        });
      }

      // AI transcription (output words).
      const aiText = content?.outputTranscription?.text ?? message.text;
      if (aiText) {
        setTranscript((prev) => {
          const entries = [...prev, { role: "ai" as const, text: aiText }];
          return entries.slice(-10);
        });
      }

      // AI audio output — play it.
      const audioData = message.data;
      if (audioData) {
        void playAudioData(audioData);
      }
    },
    [playAudioData]
  );

  // ---------------------------------------------------------------------------
  // Start session
  // ---------------------------------------------------------------------------

  const startSession = useCallback(async () => {
    if (!user && !isMockMode) return;
    setState("connecting");

    try {
      const userId = user?.id ?? "mock";
      const usage = await getTodayUsage(userId);
      if (usage.remainingSeconds <= 0) {
        setState("limitReached");
        return;
      }

      setRemainingSeconds(usage.remainingSeconds);

      const wardrobeContext = await buildWardrobeContext(userId);
      const session = await startMagicMirrorSession(wardrobeContext, {
        onOpen: () => {
          setState("active");
          startPulse();
          sessionStartedAtRef.current = Date.now();
          lastHeartbeatSecondsRef.current = 0;

          // Camera frame capture loop.
          frameIntervalRef.current = setInterval(() => {
            void (async () => {
              try {
                const pic = await cameraRef.current?.takePictureAsync({
                  base64: true,
                  quality: 0.4,
                  skipProcessing: true,
                });
                if (pic?.base64) sendVideoFrame(session, pic.base64);
              } catch {
                /* camera unavailable during this tick */
              }
            })();
          }, FRAME_INTERVAL_MS);

          // Server-side heartbeat — keeps the daily cap enforced even if the
          // app crashes between now and the next check.
          heartbeatIntervalRef.current = setInterval(() => {
            const totalElapsed = Math.floor(
              (Date.now() - sessionStartedAtRef.current) / 1000
            );
            const newSeconds = totalElapsed - lastHeartbeatSecondsRef.current;
            if (newSeconds > 0 && user) {
              lastHeartbeatSecondsRef.current = totalElapsed;
              void recordHeartbeat(user.id, newSeconds, estimateSessionCostUsd(newSeconds)).then(
                (updated) => {
                  setRemainingSeconds(updated.remainingSeconds);
                  if (updated.remainingSeconds <= 0) {
                    void endSession();
                    setState("limitReached");
                  }
                }
              );
            }
          }, HEARTBEAT_INTERVAL_MS);

          // Client-side 1s countdown for UI display.
          countdownRef.current = setInterval(() => {
            setRemainingSeconds((prev) => {
              if (prev <= 1) {
                clearInterval(countdownRef.current!);
                countdownRef.current = null;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          // Start audio capture: PCM16 at 16kHz on both platforms.
          if (Platform.OS === "android") {
            startAndroidAudioCapture(session);
          } else {
            void startClipLoop(session);
          }
        },
        onMessage: handleMessage,
        onError: (error) => {
          console.warn("Magic Mirror session error:", error);
          void endSession();
          setState("error");
          setErrorMessage("No pudimos conectar con tu estilista. Intenta de nuevo.");
        },
        onClose: (reason) => {
          if (reason && reason !== "") {
            void endSession();
            setState("ready");
          }
        },
      });

      sessionRef.current = session;
    } catch (err) {
      console.warn("Magic Mirror startSession failed:", err);
      setState("error");
      setErrorMessage("No pudimos conectar con tu estilista. Intenta de nuevo.");
    }
  }, [user, startPulse, startClipLoop, startAndroidAudioCapture, handleMessage, endSession]);

  // ---------------------------------------------------------------------------
  // Stop session (user-initiated or time-expired)
  // ---------------------------------------------------------------------------

  const stopSession = useCallback(async () => {
    await endSession();
    setState("ready");
  }, [endSession]);

  // Warn at 30s remaining.
  useEffect(() => {
    if (state === "active" && remainingSeconds === 30) {
      setTranscript((prev) => [
        ...prev,
        { role: "ai" as const, text: "⏱ Te quedan 30 segundos" },
      ]);
    }
    if (state === "active" && remainingSeconds === 0) {
      setTranscript((prev) => [...prev, { role: "ai" as const, text: "Se acabó tu tiempo de hoy." }]);
      void endSession();
      setTimeout(() => setState("limitReached"), 1500);
    }
  }, [remainingSeconds, state, endSession]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function formatTimer(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")} restantes hoy`;
  }

  function openDeviceSettings() {
    void Linking.openSettings();
  }

  // ---------------------------------------------------------------------------
  // Render branches
  // ---------------------------------------------------------------------------

  if (state === "intro") {
    return <IntroScreen onActivate={handleActivate} onCancel={() => router.back()} />;
  }

  if (state === "limitReached") {
    return <LimitReachedScreen onBack={() => router.back()} />;
  }

  if (state === "permissionDenied") {
    return (
      <PermissionDeniedScreen
        onOpenSettings={openDeviceSettings}
        onBack={() => router.back()}
      />
    );
  }

  // Camera-based states (ready / connecting / active / error)
  const isActive = state === "active";
  const isConnecting = state === "connecting";
  const timerUrgent = remainingSeconds <= 60;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Full-screen camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => {
          if (state === "ready" && state !== ("connecting" as ScreenState)) {
            /* camera is live */
          }
        }}
      />

      {/* ── Top overlay ── */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <View style={styles.topBar}>
          {/* Close */}
          <Pressable
            style={styles.circleBtn}
            onPress={() => {
              if (isActive) void stopSession();
              else router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar espejo mágico"
          >
            <Feather name="x" size={18} color="#fff" />
          </Pressable>

          {/* Title + BETA */}
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>Espejo Mágico</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>

          {/* Flip camera */}
          <Pressable
            style={styles.circleBtn}
            onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
            accessibilityRole="button"
            accessibilityLabel="Cambiar cámara"
          >
            <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Session timer pill */}
        {isActive && (
          <View style={[styles.timerPill, timerUrgent && styles.timerPillUrgent]}>
            <Text style={styles.timerText}>{formatTimer(remainingSeconds)}</Text>
          </View>
        )}
      </LinearGradient>

      {/* ── Bottom overlay ── */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={[styles.bottomGradient, { paddingBottom: insets.bottom + 24 }]}
        pointerEvents="box-none"
      >
        {/* Transcript captions */}
        {transcript.length > 0 && (
          <View style={styles.transcriptArea} pointerEvents="none">
            {transcript.slice(-2).map((entry, i) => (
              <Text
                key={i}
                style={[
                  styles.captionText,
                  entry.role === "user" ? styles.captionUser : styles.captionAi,
                ]}
                numberOfLines={2}
              >
                {entry.text}
              </Text>
            ))}
          </View>
        )}

        {/* Error banner */}
        {state === "error" && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Mic button */}
        <View style={styles.micRow}>
          <View style={styles.micWrapper}>
            {/* Pulsing ring (active state only) */}
            {isActive && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseOpacity,
                  },
                ]}
              />
            )}

            {/* Mic button itself */}
            <Pressable
              style={[styles.micButton, !isActive && !isConnecting && styles.micButtonIdle]}
              onPress={isActive ? stopSession : startSession}
              accessibilityRole="button"
              accessibilityLabel={isActive ? "Terminar conversación" : "Iniciar conversación"}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Feather name="loader" size={28} color="#fff" />
              ) : isActive ? (
                <Feather name="mic" size={28} color="#fff" />
              ) : (
                <Feather name="mic-off" size={28} color={colors.accent} />
              )}
            </Pressable>
          </View>

          <Text style={styles.micHint}>
            {isActive ? "Toca para terminar" : isConnecting ? "Conectando…" : "Toca para iniciar conversación"}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-screens
// ---------------------------------------------------------------------------

function IntroScreen({
  onActivate,
  onCancel,
}: {
  onActivate: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={intro.root}>
      <StatusBar style="dark" />
      <View style={intro.content}>
        {/* Icon */}
        <View style={intro.iconWrap}>
          <Feather name="star" size={48} color={colors.accent} />
        </View>

        {/* Title */}
        <Text style={intro.title}>
          Espejo <Text style={intro.titleItalic}>Mágico</Text>
        </Text>

        {/* Body */}
        <Text style={intro.body}>
          Habla con tu estilista personal. Te ve, te escucha, y te ayuda a decidir qué ponerte — en
          tiempo real.
        </Text>

        {/* Beta notice card */}
        <View style={intro.betaCard}>
          <Text style={intro.betaCardText}>
            Esta función está en beta. Tienes 5 minutos diarios para probarla y ayudarnos a
            mejorarla.
          </Text>
        </View>

        {/* CTA */}
        <Pressable style={intro.cta} onPress={onActivate} accessibilityRole="button">
          <Text style={intro.ctaText}>Activar cámara y micrófono</Text>
        </Pressable>

        {/* Secondary */}
        <Pressable onPress={onCancel} accessibilityRole="button" style={intro.secondary}>
          <Text style={intro.secondaryText}>Ahora no</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LimitReachedScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={info.root}>
      <StatusBar style="dark" />
      <View style={info.content}>
        <View style={info.iconWrap}>
          <Feather name="clock" size={48} color={colors.textSecondary} />
        </View>
        <Text style={info.title}>Vuelve mañana</Text>
        <Text style={info.body}>
          Ya usaste tus 5 minutos de hoy con el Espejo Mágico. Vuelve mañana para más.
        </Text>
        <Pressable style={info.outlineBtn} onPress={onBack} accessibilityRole="button">
          <Text style={info.outlineBtnText}>Volver al armario</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PermissionDeniedScreen({
  onOpenSettings,
  onBack,
}: {
  onOpenSettings: () => void;
  onBack: () => void;
}) {
  return (
    <View style={info.root}>
      <StatusBar style="dark" />
      <View style={info.content}>
        <View style={info.iconWrap}>
          <Feather name="camera-off" size={48} color={colors.textSecondary} />
        </View>
        <Text style={info.title}>Permisos necesarios</Text>
        <Text style={info.body}>
          El Espejo Mágico necesita acceso a la cámara y al micrófono. Actívalos en los ajustes de
          tu dispositivo.
        </Text>
        <Pressable style={info.outlineBtn} onPress={onOpenSettings} accessibilityRole="button">
          <Text style={info.outlineBtnText}>Abrir ajustes</Text>
        </Pressable>
        <Pressable onPress={onBack} accessibilityRole="button" style={info.textLink}>
          <Text style={info.textLinkText}>Volver</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cameraBg },

  // Top gradient + bar
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 32,
    pointerEvents: "box-none" as never,
  } as Record<string, unknown>,
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: "#fff",
  },
  betaBadge: {
    backgroundColor: colors.accent,
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  betaText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: "#fff",
    letterSpacing: 0.5,
  },

  // Session timer pill
  timerPill: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerPillUrgent: { backgroundColor: colors.accent },
  timerText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: "#fff" },

  // Bottom gradient + controls
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  transcriptArea: { marginBottom: 16, gap: 4 },
  captionText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, textAlign: "center" },
  captionUser: { color: "rgba(255,255,255,0.7)" },
  captionAi: { color: "#fff" },

  errorBanner: {
    backgroundColor: "rgba(139,21,36,0.85)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontFamily: fonts.body, fontSize: 14, color: "#fff", textAlign: "center" },

  // Mic button
  micRow: { alignItems: "center", gap: 10 },
  micWrapper: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139,21,36,0.5)",
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonIdle: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  micHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
});

// Intro screen styles
const intro = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 20,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.textPrimary,
    textAlign: "center",
  },
  titleItalic: {
    fontFamily: fonts.displayItalic,
    color: colors.accent,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  betaCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignSelf: "stretch",
  },
  betaCardText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 99,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: "#fff" },
  secondary: { paddingVertical: 8 },
  secondaryText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
});

// Shared info-screen styles (limit reached + permission denied)
const info = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 20,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 99,
    paddingHorizontal: 32,
    paddingVertical: 13,
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 4,
  },
  outlineBtnText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.accent },
  textLink: { paddingVertical: 8 },
  textLinkText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
});
