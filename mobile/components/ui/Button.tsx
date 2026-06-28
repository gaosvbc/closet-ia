import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

type Variant = "primary" | "outline" | "light" | "outlineLight";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Pill-shaped button. `primary` is the wine CTA; `light`/`outlineLight` are for
// use on the dark wine onboarding background.
export default function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  fullWidth = true,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && { opacity: 0.85 },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Feather name={icon} size={18} color={palette.text} />
          )}
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<
  Variant,
  { bg: string; text: string; border: string }
> = {
  primary: { bg: colors.accent, text: colors.white, border: colors.accent },
  outline: { bg: "transparent", text: colors.textPrimary, border: colors.textPrimary },
  light: { bg: colors.white, text: colors.accent, border: colors.white },
  outlineLight: { bg: "transparent", text: colors.white, border: colors.white },
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  fullWidth: { alignSelf: "stretch" },
  disabled: { opacity: 0.5 },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 15 },
});
