import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // `surface` = ivory filled card; `elevated` = white card with subtle shadow.
  variant?: "surface" | "elevated";
}

export default function Card({
  children,
  style,
  variant = "surface",
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === "surface" ? styles.surface : styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    padding: 16,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
