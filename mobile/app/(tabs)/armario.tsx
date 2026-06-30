import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import ClothingGrid from "@/components/wardrobe/ClothingGrid";
import CategoryPills from "@/components/wardrobe/CategoryPills";
import { clothingItems, categories } from "@/lib/mock-data";
import { userProfile } from "@/lib/mock-data";
import { getAddedItems } from "@/lib/wardrobe-store";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import type { ClothingItem } from "@/types";

export default function ArmarioScreen() {
  const [active, setActive] = useState<string>("Todo");
  const [addedItems, setAddedItems] = useState<ClothingItem[]>([]);

  // Re-read scanned items every time this tab gains focus, so an item saved
  // from the camera flow shows up immediately on return.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void getAddedItems().then((items) => {
        if (!cancelled) setAddedItems(items);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const allItems = useMemo(() => [...addedItems, ...clothingItems], [addedItems]);

  const items = useMemo(() => {
    if (active === "Todo") return allItems;
    return allItems.filter((i) => i.category === active);
  }, [active, allItems]);

  const Header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.eyebrow}>
            {userProfile.stats.prendas} PRENDAS
          </Text>
          <Text style={styles.title}>
            Mi <Text style={styles.titleItalic}>armario</Text>
          </Text>
        </View>
        <View style={styles.icons}>
          <Pressable accessibilityRole="button" accessibilityLabel="Buscar">
            <Feather name="search" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Filtrar">
            <Feather name="sliders" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.pills}>
        <CategoryPills
          categories={categories}
          active={active}
          onChange={setActive}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ClothingGrid items={items} ListHeaderComponent={Header} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4, gap: 12 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  title: { fontFamily: fonts.bodySemibold, fontSize: 26, color: colors.textPrimary },
  titleItalic: { fontFamily: fonts.displayItalic, fontSize: 28, color: colors.accent },
  icons: { flexDirection: "row", gap: 18, paddingTop: 6 },
  pills: { marginHorizontal: -4 },
});
