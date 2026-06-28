import { View, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

// Thin onboarding progress bar. `step`/`total` drive the wine fill width.
export default function ProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const pct = Math.max(0, Math.min(1, step / total)) * 100;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, backgroundColor: colors.border, borderRadius: 2 },
  fill: { height: 3, backgroundColor: colors.accent, borderRadius: 2 },
});
