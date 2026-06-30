import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { userProfile as mockProfile } from "@/lib/mock-data";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode, supabase } from "@/lib/supabase";
import GoogleCalendarConnect from "@/components/profile/GoogleCalendarConnect";

const MENU: { icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { icon: "bar-chart-2", label: "Mis estadísticas" },
  { icon: "star", label: "Preferencias de estilo" },
  { icon: "calendar", label: "Planificar mi semana" },
  { icon: "bell", label: "Notificaciones" },
  { icon: "help-circle", label: "Ayuda y soporte" },
];

type PlanTier = "essential" | "pro" | "elite";

interface ProfileView {
  fullName: string;
  styleTag: string;
  stats: { prendas: number; looks: number; favoritos: number };
  planTier: PlanTier;
  googleCalendarConnected: boolean;
}

export default function PerfilScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileView>({
    fullName: mockProfile.fullName,
    styleTag: mockProfile.styleTag,
    stats: mockProfile.stats,
    planTier: "essential",
    googleCalendarConnected: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (isMockMode || !supabase || !user) return;
      let cancelled = false;

      (async () => {
        const [profileRes, itemsRes, looksRes, favRes] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("full_name, occupation, plan_tier, google_calendar_connected")
            .eq("id", user.id)
            .single(),
          supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("looks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase
            .from("clothing_items")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("favorited", true),
        ]);
        if (cancelled) return;

        setProfile({
          fullName: profileRes.data?.full_name || user.email || "Tu perfil",
          styleTag: profileRes.data?.occupation ? `Ocupación · ${profileRes.data.occupation}` : "",
          stats: {
            prendas: itemsRes.count ?? 0,
            looks: looksRes.count ?? 0,
            favoritos: favRes.count ?? 0,
          },
          planTier: (profileRes.data?.plan_tier as PlanTier) || "essential",
          googleCalendarConnected: Boolean(profileRes.data?.google_calendar_connected),
        });
      })();

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  async function handleCalendarConnectedChange(connected: boolean) {
    setProfile((prev) => ({ ...prev, googleCalendarConnected: connected }));
    if (!isMockMode && supabase && user) {
      await supabase
        .from("user_profiles")
        .update({ google_calendar_connected: connected })
        .eq("id", user.id);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/register");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{profile.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile.fullName}</Text>
          {!!profile.styleTag && <Text style={styles.styleTag}>{profile.styleTag}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Stat value={profile.stats.prendas} label="Prendas" />
          <View style={styles.statDivider} />
          <Stat value={profile.stats.looks} label="Looks" />
          <View style={styles.statDivider} />
          <Stat value={profile.stats.favoritos} label="Favoritos" />
        </View>

        {/* Google Calendar connect — Pro/Elite only */}
        {(profile.planTier === "pro" || profile.planTier === "elite") && (
          <GoogleCalendarConnect
            connected={profile.googleCalendarConnected}
            onConnectedChange={handleCalendarConnectedChange}
          />
        )}

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

        <Pressable onPress={handleSignOut} style={styles.signOut} accessibilityRole="button">
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
