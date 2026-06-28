import { View, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

// Pagination dots for the onboarding slides (on the wine background).
export default function Dots({ active, count = 3 }: { active: number; count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, { opacity: i === active ? 1 : 0.4 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
});
