import { Pressable, Text, StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Large selectable card used in screens 01 and 02. Selected = 2px wine border
// + light wine tint. Pass an icon node (Feather / MaterialCommunityIcons).
export default function SelectCard({
  label,
  icon,
  selected,
  onPress,
  style,
  layout = "vertical",
}: {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  layout?: "vertical" | "row";
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.card,
        layout === "row" ? styles.row : styles.vertical,
        selected ? styles.selected : styles.idle,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  vertical: { alignItems: "center", gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: {
    backgroundColor: colors.accentTintCard,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  icon: { height: 32, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textPrimary },
});
