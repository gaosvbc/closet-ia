import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// "Tu look de hoy" card — the hero of the Home screen. The clothing grid is a
// stylised arrangement of coloured blocks matching the design mock.
export default function OutfitCard({
  onWear,
  onShuffle,
}: {
  onWear?: () => void;
  onShuffle?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.eyebrow}>TU LOOK DE HOY</Text>
        <View style={styles.badge}>
          <Feather name="calendar" size={11} color={colors.accent} />
          <Text style={styles.badgeText}>Reunión · 10:00</Text>
        </View>
      </View>

      {/* Clothing grid */}
      <View style={styles.grid}>
        <View style={[styles.gridSlot, styles.tall]}>
          <View style={[styles.block, { backgroundColor: colors.accent, height: "100%" }]} />
        </View>
        <View style={styles.gridRight}>
          <View style={styles.gridRow}>
            <View style={[styles.gridSlot, styles.small]}>
              <View style={[styles.block, { backgroundColor: colors.beige }]} />
            </View>
            <View style={[styles.gridSlot, styles.small]}>
              <View style={[styles.block, styles.pill, { backgroundColor: colors.textPrimary }]} />
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.gridSlot, styles.small]}>
              <View style={[styles.block, { backgroundColor: "#2A2A2A" }]} />
            </View>
            <View style={[styles.gridSlot, styles.small]}>
              <View style={[styles.block, styles.pill, { backgroundColor: colors.ink }]} />
            </View>
          </View>
        </View>
      </View>

      {/* AI note */}
      <View style={styles.aiRow}>
        <View style={styles.aiBadge}>
          <Feather name="star" size={11} color={colors.accent} />
          <Text style={styles.aiBadgeText}>IA</Text>
        </View>
        <Text style={styles.aiNote}>
          Capas sobrias en paleta neutra para tu reunión de las 10:00 y la mañana
          fresca de 18°.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={onWear}
          accessibilityRole="button"
          style={({ pressed }) => [styles.wearBtn, pressed && { opacity: 0.85 }]}
        >
          <Feather name="check" size={16} color={colors.white} />
          <Text style={styles.wearText}>Me lo pongo hoy</Text>
        </Pressable>
        <Pressable
          onPress={onShuffle}
          accessibilityRole="button"
          accessibilityLabel="Otro look"
          style={({ pressed }) => [styles.shuffleBtn, pressed && { opacity: 0.7 }]}
        >
          <Feather name="shuffle" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.accent },

  grid: { flexDirection: "row", height: 180, gap: 8 },
  gridSlot: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 6,
  },
  tall: { flex: 1 },
  gridRight: { flex: 1, gap: 8 },
  gridRow: { flex: 1, flexDirection: "row", gap: 8 },
  small: { flex: 1 },
  block: { flex: 1, borderRadius: 10, width: "100%" },
  pill: { borderRadius: 40 },

  aiRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.accent },
  aiNote: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  actionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wearBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 50,
    height: 48,
  },
  wearText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.white },
  shuffleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
