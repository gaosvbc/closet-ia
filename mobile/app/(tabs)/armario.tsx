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
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode, supabase } from "@/lib/supabase";
import { dbRowToClothingItem, type ClothingItemRow } from "@/lib/ai-mapping";

export default function ArmarioScreen() {
  const [active, setActive] = useState<string>("Todo");
  const [addedItems, setAddedItems] = useState<ClothingItem[]>([]);
  const { user } = useAuth();

  // Re-read items every time this tab gains focus: real Supabase rows
  // scoped to the authenticated user when configured, otherwise the locally
  // scanned items merged with the bundled demo data (mock mode).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      if (!isMockMode && supabase && user) {
        void supabase
          .from("clothing_items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            if (cancelled) return;
            setAddedItems(((data ?? []) as ClothingItemRow[]).map(dbRowToClothingItem));
          });
      } else {
        void getAddedItems().then((items) => {
          if (!cancelled) setAddedItems(items);
        });
      }

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const allItems = useMemo(
    () => (!isMockMode && user ? addedItems : [...addedItems, ...clothingItems]),
    [addedItems, user]
  );

  const items = useMemo(() => {
    if (active === "Todo") return allItems;
    return allItems.filter((i) => i.category === active);
  }, [active, allItems]);

  const Header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.eyebrow}>
            {!isMockMode && user ? allItems.length : userProfile.stats.prendas} PRENDAS
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
