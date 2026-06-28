import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Full-screen dark scanning UI. Shows the live camera when permission is
// granted, otherwise a wine-red placeholder (per spec) so the screen always
// renders. `onClose` returns to the previous screen.
export default function CameraModal({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const granted = permission?.granted ?? false;

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={styles.circleBtn}
        >
          <Feather name="x" size={18} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Escanear prenda</Text>
        <Pressable
          onPress={() => setTorch((t) => !t)}
          accessibilityRole="button"
          accessibilityLabel="Linterna"
          style={[styles.circleBtn, torch && styles.circleBtnActive]}
        >
          <Feather name="zap" size={18} color={colors.white} />
        </Pressable>
      </View>

      {/* Scan frame */}
      <View style={styles.frameWrap}>
        <View style={styles.frame}>
          <View style={styles.preview}>
            {granted ? (
              <CameraView style={StyleSheet.absoluteFill} enableTorch={torch} />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <View style={styles.instructionPill}>
          <Text style={styles.instruction}>
            Centra la prenda sobre fondo liso
          </Text>
        </View>
      </View>

      {/* Capture button */}
      <View style={[styles.captureWrap, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.captureRing}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capturar"
            style={({ pressed }) => [styles.captureBtn, pressed && { opacity: 0.7 }]}
          />
        </View>
      </View>
    </View>
  );
}

const FRAME_W = 240;
const FRAME_H = 320;
const C = 24; // corner length

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

  captureWrap: { alignItems: "center" },
  captureRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.white },
});
