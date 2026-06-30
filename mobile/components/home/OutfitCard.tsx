import { View, Text, StyleSheet, Pressable, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import type { ClothingItem, ClothingShape } from "@/types";

function shapeStyle(shape: ClothingShape): ViewStyle {
  switch (shape) {
    case "pill":
      return { borderRadius: 40 };
    case "pentagon":
      return { borderRadius: 10, borderTopLeftRadius: 26, borderTopRightRadius: 26 };
    default:
      return { borderRadius: 10 };
  }
}

interface OutfitCardProps {
  items: ClothingItem[];
  styleNote: string;
  eventLabel?: string;
  wornToday: boolean;
  onWear?: () => void;
  onShuffle?: () => void;
}

// "Tu look de hoy" card — the hero of the Home screen. Renders the real
// suggested items as abstract coloured blocks, matching the same
// shape/colour language used in the wardrobe grid (ClothingCard.tsx).
export default function OutfitCard({
  items,
  styleNote,
  eventLabel,
  wornToday,
  onWear,
  onShuffle,
}: OutfitCardProps) {
  const [hero, ...rest] = items;
  const gridItems = rest.slice(0, 4);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.eyebrow}>TU LOOK DE HOY</Text>
        {eventLabel ? (
          <View style={styles.badge}>
            <Feather name="calendar" size={11} color={colors.accent} />
            <Text style={styles.badgeText}>{eventLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Clothing grid */}
      <View style={styles.grid}>
        <View style={[styles.gridSlot, styles.tall]}>
          {hero && (
            <View
              style={[styles.block, shapeStyle(hero.shape), { backgroundColor: hero.color, height: "100%" }]}
            />
          )}
        </View>
        <View style={styles.gridRight}>
          <View style={styles.gridRow}>
            {[gridItems[0], gridItems[1]].map((item, i) => (
              <View key={item?.id ?? `slot-top-${i}`} style={[styles.gridSlot, styles.small]}>
                {item && (
                  <View style={[styles.block, shapeStyle(item.shape), { backgroundColor: item.color }]} />
                )}
              </View>
            ))}
          </View>
          <View style={styles.gridRow}>
            {[gridItems[2], gridItems[3]].map((item, i) => (
              <View key={item?.id ?? `slot-bottom-${i}`} style={[styles.gridSlot, styles.small]}>
                {item && (
                  <View style={[styles.block, shapeStyle(item.shape), { backgroundColor: item.color }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* AI note */}
      <View style={styles.aiRow}>
        <View style={styles.aiBadge}>
          <Feather name="star" size={11} color={colors.accent} />
          <Text style={styles.aiBadgeText}>IA</Text>
        </View>
        <Text style={styles.aiNote}>{styleNote}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={onWear}
          disabled={wornToday}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.wearBtn,
            wornToday && styles.wearBtnDone,
            pressed && !wornToday && { opacity: 0.85 },
          ]}
        >
          <Feather name="check" size={16} color={wornToday ? colors.accent : colors.white} />
          <Text style={[styles.wearText, wornToday && styles.wearTextDone]}>
            {wornToday ? "Ya te lo pusiste hoy" : "Me lo pongo hoy"}
          </Text>
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
  block: { flex: 1, width: "100%" },

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
  wearBtnDone: {
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  wearText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.white },
  wearTextDone: { color: colors.accent },
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
