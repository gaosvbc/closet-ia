import { ScrollView, View, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Selectable chip row. Horizontal-scrolling when `scroll`, wrapping otherwise.
// Selected chip is wine-filled; idle chips are ivory with a border.
export default function Chips({
  options,
  value,
  onChange,
  scroll = false,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  scroll?: boolean;
}) {
  const items = options.map((opt) => {
    const selected = opt === value;
    return (
      <Pressable
        key={opt}
        onPress={() => onChange(opt)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={[styles.chip, selected ? styles.chipActive : styles.chipIdle]}
      >
        <Text
          style={[
            styles.text,
            { color: selected ? colors.white : colors.textPrimary },
          ]}
        >
          {opt}
        </Text>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {items}
      </ScrollView>
    );
  }
  return <View style={styles.wrapRow}>{items}</View>;
}

const styles = StyleSheet.create({
  scrollRow: { gap: 8, paddingVertical: 2 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  text: { fontFamily: fonts.bodyMedium, fontSize: 14 },
});
