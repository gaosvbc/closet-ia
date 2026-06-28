import { View, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Wrapping chip group. `multi` toggles between single and multi select.
// Selected chip = wine fill + white text; idle = ivory + border.
export default function ChipGroup({
  options,
  selected,
  onToggle,
  columns,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: number;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const isSel = selected.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSel }}
            style={[
              styles.chip,
              columns ? { width: `${100 / columns - 2}%` } : undefined,
              isSel ? styles.sel : styles.idle,
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: isSel ? colors.white : colors.textPrimary },
                columns ? { textAlign: "center" } : undefined,
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
  },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  sel: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontFamily: fonts.bodyMedium, fontSize: 14 },
});
