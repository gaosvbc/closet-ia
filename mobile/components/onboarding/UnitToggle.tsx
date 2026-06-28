import { View, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Small two-option pill toggle (cm/ft, kg/lbs). Selected = wine fill.
export default function UnitToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.toggle}>
      {options.map((opt) => {
        const sel = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.btn, sel && styles.btnActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
          >
            <Text
              style={[styles.text, { color: sel ? colors.white : colors.textSecondary }]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  btn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 50 },
  btnActive: { backgroundColor: colors.accent },
  text: { fontFamily: fonts.bodyMedium, fontSize: 13 },
});
