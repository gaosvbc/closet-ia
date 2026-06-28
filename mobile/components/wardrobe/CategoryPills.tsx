import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Horizontal pills (chips, not tabs). The active pill is wine-filled.
export default function CategoryPills({
  categories,
  active,
  onChange,
}: {
  categories: readonly string[];
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((cat) => {
        const selected = cat === active;
        return (
          <Pressable
            key={cat}
            onPress={() => onChange(cat)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.pill, selected ? styles.pillActive : styles.pillIdle]}
          >
            <Text
              style={[
                styles.text,
                { color: selected ? colors.white : colors.textPrimary },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  pill: {
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillIdle: { backgroundColor: colors.white, borderColor: colors.border },
  text: { fontFamily: fonts.bodyMedium, fontSize: 14 },
});
