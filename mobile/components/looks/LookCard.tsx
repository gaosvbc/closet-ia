import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import type { Look } from "@/types";

// A saved look: title, wine-red date/occasion, four colour swatches, and a
// heart toggle. Memoised for the looks FlatList.
function LookCardBase({
  look,
  onToggleFavorite,
}: {
  look: Look;
  onToggleFavorite?: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{look.title}</Text>
          <Text style={styles.date}>{look.date}</Text>
        </View>
        <Pressable
          onPress={() => onToggleFavorite?.(look.id)}
          accessibilityRole="button"
          accessibilityLabel={
            look.favorited ? "Quitar de favoritos" : "Añadir a favoritos"
          }
          hitSlop={8}
        >
          {look.favorited ? (
            <AntDesign name="heart" size={18} color={colors.accent} />
          ) : (
            <Feather name="heart" size={20} color={colors.border} />
          )}
        </Pressable>
      </View>

      <View style={styles.swatches}>
        {look.items.map((color, i) => (
          <View key={i} style={styles.swatchSlot}>
            <View style={[styles.swatch, { backgroundColor: color }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerText: { gap: 3 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textPrimary },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.accent },
  swatches: { flexDirection: "row", gap: 10 },
  swatchSlot: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  swatch: { width: 34, height: 34, borderRadius: 8 },
});

export default React.memo(LookCardBase);
