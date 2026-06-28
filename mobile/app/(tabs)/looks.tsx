import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import LookCard from "@/components/looks/LookCard";
import { looks as mockLooks } from "@/lib/mock-data";
import type { Look } from "@/types";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

type TabKey = "mis" | "favoritos";

export default function LooksScreen() {
  const [tab, setTab] = useState<TabKey>("mis");
  const [looks, setLooks] = useState<Look[]>(mockLooks);

  const visible = useMemo(
    () => (tab === "favoritos" ? looks.filter((l) => l.favorited) : looks),
    [tab, looks]
  );

  function toggleFavorite(id: string) {
    setLooks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, favorited: !l.favorited } : l))
    );
  }

  const Header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.eyebrow}>12 CONJUNTOS</Text>
          <Text style={styles.title}>
            Mis <Text style={styles.titleItalic}>looks</Text>
          </Text>
        </View>
        <Pressable
          style={styles.plus}
          accessibilityRole="button"
          accessibilityLabel="Nuevo look"
        >
          <Feather name="plus" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Mis looks" active={tab === "mis"} onPress={() => setTab("mis")} />
        <TabButton
          label="Favoritos"
          active={tab === "favoritos"}
          onPress={() => setTab("favoritos")}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LookCard look={item} onToggleFavorite={toggleFavorite} />
        )}
        ListHeaderComponent={Header}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn} accessibilityRole="tab">
      <Text style={[styles.tabText, { color: active ? colors.accent : colors.textSecondary }]}>
        {label}
      </Text>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12 },
  header: { gap: 16, marginBottom: 4 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  title: { fontFamily: fonts.bodySemibold, fontSize: 26, color: colors.textPrimary },
  titleItalic: { fontFamily: fonts.displayItalic, fontSize: 28, color: colors.accent },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: { flexDirection: "row", gap: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { paddingBottom: 10 },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 15 },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
  },
  sep: { height: 12 },
});
