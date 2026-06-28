import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Weather summary card shown on the Home screen.
export default function WeatherWidget() {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Feather name="cloud" size={22} color={colors.textSecondary} />
        <View style={styles.tempRow}>
          <Text style={styles.temp}>18°</Text>
          <Text style={styles.cond}> Nublado</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.note}>
        Mañana fresca, tarde estable.{"\n"}Ideal para capas ligeras.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 16,
  },
  left: { alignItems: "flex-start", gap: 6 },
  tempRow: { flexDirection: "row", alignItems: "baseline" },
  temp: { fontFamily: fonts.bodySemibold, fontSize: 28, color: colors.textPrimary },
  cond: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  note: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
