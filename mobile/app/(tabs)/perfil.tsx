import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { userProfile } from "@/lib/mock-data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

const MENU: { icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { icon: "bar-chart-2", label: "Mis estadísticas" },
  { icon: "star", label: "Preferencias de estilo" },
  { icon: "calendar", label: "Planificar mi semana" },
  { icon: "bell", label: "Notificaciones" },
  { icon: "help-circle", label: "Ayuda y soporte" },
];

export default function PerfilScreen() {
  const router = useRouter();

  async function signOut() {
    // Reset the onboarding flag so the app returns to the welcome flow.
    await AsyncStorage.removeItem("onboarding_complete");
    router.replace("/onboarding/welcome");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>V</Text>
          </View>
          <Text style={styles.name}>{userProfile.fullName}</Text>
          <Text style={styles.styleTag}>{userProfile.styleTag}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Stat value={userProfile.stats.prendas} label="Prendas" />
          <View style={styles.statDivider} />
          <Stat value={userProfile.stats.looks} label="Looks" />
          <View style={styles.statDivider} />
          <Stat value={userProfile.stats.favoritos} label="Favoritos" />
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map((item, i) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              style={[styles.menuItem, i < MENU.length - 1 && styles.menuItemBorder]}
            >
              <Feather name={item.icon} size={20} color={colors.accent} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={signOut} style={styles.signOut} accessibilityRole="button">
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 24 },
  profileHeader: { alignItems: "center", gap: 8, paddingTop: 8 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontFamily: fonts.display, fontSize: 28, color: colors.white },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.textPrimary },
  styleTag: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },

  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontFamily: fonts.bodySemibold, fontSize: 22, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  statDivider: { width: 1, height: 36, backgroundColor: colors.border },

  menu: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, height: 56 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textPrimary },

  signOut: { alignItems: "center", paddingVertical: 8 },
  signOutText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
});
