import React from "react";
import { View, StyleSheet, Pressable, type ViewStyle } from "react-native";
import { colors } from "@/constants/colors";
import type { ClothingItem, ClothingShape } from "@/types";

// A single wardrobe item rendered as an abstract coloured shape on a white
// card. Memoised because it lives in a 3-column FlatList.
function ClothingCardBase({
  item,
  onPress,
}: {
  item: ClothingItem;
  onPress?: (item: ClothingItem) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.inner}>
        <View style={[styles.shape, shapeStyle(item.shape), { backgroundColor: item.color }]} />
      </View>
      {item.favorited && <View style={styles.heart} />}
    </Pressable>
  );
}

function shapeStyle(shape: ClothingShape): ViewStyle {
  switch (shape) {
    case "tall-rect":
      return { width: "58%", height: "82%", borderRadius: 8 };
    case "pentagon":
      return {
        width: "66%",
        height: "76%",
        borderRadius: 8,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
      };
    case "pill":
      return { width: "68%", height: "44%", borderRadius: 40 };
    case "square":
    default:
      return { width: "64%", height: "64%", borderRadius: 10 };
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    backgroundColor: colors.white,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inner: { flex: 1, alignItems: "center", justifyContent: "center" },
  shape: {},
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});

export default React.memo(ClothingCardBase);
