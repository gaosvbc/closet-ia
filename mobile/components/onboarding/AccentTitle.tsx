import { Text, StyleSheet, type TextStyle } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Title pattern: normal Cormorant text with the key word(s) in italic wine red.
// e.g. <AccentTitle normal="¿Qué " accent="usas?" />
export default function AccentTitle({
  normal,
  accent,
  size = 36,
  style,
}: {
  normal: string;
  accent: string;
  size?: number;
  style?: TextStyle;
}) {
  return (
    <Text style={[styles.base, { fontSize: size, lineHeight: size * 1.1 }, style]}>
      {normal}
      <Text style={styles.accent}>{accent}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { fontFamily: fonts.display, color: colors.textPrimary },
  accent: { fontFamily: fonts.displayItalic, color: colors.accent },
});
