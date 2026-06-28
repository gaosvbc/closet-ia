import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

interface Action {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
}

// Three horizontal quick-action cards under the outfit card.
export default function QuickActions({
  onScan,
  onPlanWeek,
  onStats,
}: {
  onScan?: () => void;
  onPlanWeek?: () => void;
  onStats?: () => void;
}) {
  const actions: Action[] = [
    { icon: "camera", label: "Escanear prenda", onPress: onScan },
    { icon: "calendar", label: "Planificar semana", onPress: onPlanWeek },
    { icon: "bar-chart-2", label: "Mis estadísticas", onPress: onStats },
  ];

  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          onPress={a.onPress}
          accessibilityRole="button"
          accessibilityLabel={a.label}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
        >
          <Feather name={a.icon} size={22} color={colors.accent} />
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    minHeight: 96,
  },
  label: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
