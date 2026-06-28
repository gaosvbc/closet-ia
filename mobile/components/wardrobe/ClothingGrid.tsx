import { FlatList, StyleSheet, View } from "react-native";
import ClothingCard from "./ClothingCard";
import { colors } from "@/constants/colors";
import type { ClothingItem } from "@/types";

// 3-column wardrobe grid built on FlatList for performance.
export default function ClothingGrid({
  items,
  onPressItem,
  ListHeaderComponent,
}: {
  items: ClothingItem[];
  onPressItem?: (item: ClothingItem) => void;
  ListHeaderComponent?: React.ComponentProps<
    typeof FlatList
  >["ListHeaderComponent"];
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={3}
      renderItem={({ item }) => (
        <ClothingCard item={item} onPress={onPressItem} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 24, backgroundColor: colors.bg },
  column: { justifyContent: "space-between" },
});
