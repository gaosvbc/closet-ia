import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  type CameraType,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

type Mode = "photo" | "video";

// Full-screen dark scanner with front/back flip, photo/video mode switch,
// recording indicator + timer, and a gallery shortcut. Falls back to a wine
// placeholder when camera permission isn't granted so it always renders.
export default function CameraModal({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>("back");
  const [mode, setMode] = useState<Mode>("photo");
  const [torch, setTorch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  // Recording timer.
  useEffect(() => {
    if (!isRecording) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const granted = permission?.granted ?? false;

  const toggleFacing = () => setFacing((f) => (f === "back" ? "front" : "back"));

  async function takePicture() {
    try {
      await cameraRef.current?.takePictureAsync();
    } catch {
      // no-op in mock / no permission
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      cameraRef.current?.stopRecording();
      return;
    }
    setIsRecording(true);
    try {
      await cameraRef.current?.recordAsync();
    } catch {
      setIsRecording(false);
    }
  }

  function onCapturePress() {
    if (mode === "photo") void takePicture();
    else void toggleRecording();
  }

  async function openGallery() {
    try {
      await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    } catch {
      // no-op
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onClose} style={styles.circleBtn} accessibilityLabel="Cerrar">
          <Feather name="x" size={18} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Escanear prenda</Text>
        <Pressable
          onPress={() => setTorch((t) => !t)}
          style={[styles.circleBtn, torch && styles.circleBtnActive]}
          accessibilityLabel="Flash"
        >
          <Feather name="zap" size={18} color={colors.white} />
        </Pressable>
      </View>

      {/* Mode switcher */}
      <View style={styles.modeRow}>
        <View style={styles.modeSwitch}>
          {(["photo", "video"] as Mode[]).map((m) => {
            const sel = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => !isRecording && setMode(m)}
                style={[styles.modeBtn, sel && styles.modeBtnActive]}
              >
                <Text style={[styles.modeText, sel && styles.modeTextActive]}>
                  {m === "photo" ? "FOTO" : "VIDEO"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Recording indicator */}
      {isRecording && (
        <View style={[styles.recRow, { top: insets.top + 96 }]}>
          <View style={styles.recDot} />
          <Text style={styles.recText}>REC {mm}:{ss}</Text>
        </View>
      )}

      {/* Scan frame */}
      <View style={styles.frameWrap}>
        <View style={styles.frame}>
          <View style={styles.preview}>
            {granted ? (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={torch}
                mode={mode === "video" ? "video" : "picture"}
              />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <View style={styles.instructionPill}>
          <Text style={styles.instruction}>Centra la prenda sobre fondo liso</Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 28 }]}>
        <Pressable onPress={openGallery} style={styles.sideBtn} accessibilityLabel="Galería">
          <Feather name="image" size={22} color={colors.white} />
        </Pressable>

        <Pressable onPress={onCapturePress} accessibilityLabel="Capturar" style={styles.captureRing}>
          <View
            style={[
              styles.capture,
              mode === "video" && styles.captureVideo,
              isRecording && styles.captureRecording,
            ]}
          />
        </Pressable>

        <Pressable onPress={toggleFacing} style={styles.sideBtn} accessibilityLabel="Voltear cámara">
          <Ionicons name="camera-reverse-outline" size={26} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const FRAME_W = 240;
const FRAME_H = 320;
const C = 24;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cameraBg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleBtnActive: { backgroundColor: "rgba(255,255,255,0.35)" },
  title: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.white },

  modeRow: { alignItems: "center", marginTop: 8 },
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 50,
    padding: 3,
  },
  modeBtn: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 50 },
  modeBtnActive: { backgroundColor: colors.white },
  modeText: { fontFamily: fonts.bodySemibold, fontSize: 12, letterSpacing: 1, color: colors.white },
  modeTextActive: { color: colors.cameraBg },

  recRow: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  recText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.white },

  frameWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
  frame: { width: FRAME_W, height: FRAME_H },
  preview: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  placeholder: { flex: 1, backgroundColor: colors.accent },
  corner: { position: "absolute", width: C, height: C, borderColor: colors.white },
  tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  instructionPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  instruction: { fontFamily: fonts.body, fontSize: 13, color: colors.white },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 36,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  capture: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.white },
  captureVideo: { backgroundColor: colors.accent },
  captureRecording: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.accent },
});
