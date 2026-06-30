import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import WeatherWidget from "@/components/home/WeatherWidget";
import OutfitCard from "@/components/home/OutfitCard";
import QuickActions from "@/components/home/QuickActions";
import { userProfile } from "@/lib/mock-data";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode } from "@/lib/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName =
    !isMockMode && user
      ? String(user.user_metadata?.full_name ?? user.email ?? "").split(" ")[0] || "tú"
      : userProfile.name;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.date}>SÁBADO, 28 DE JUNIO</Text>
            <Text style={styles.greeting}>
              Hola, <Text style={styles.greetingName}>{displayName}</Text>
            </Text>
            <View style={styles.eventRow}>
              <View style={styles.eventDot} />
              <Text style={styles.eventText}>
                Tienes 1 evento hoy · Reunión 10:00
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Feather name="bell" size={20} color={colors.textPrimary} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        <WeatherWidget />
        <OutfitCard onShuffle={() => {}} onWear={() => {}} />
        <QuickActions
          onScan={() => router.push("/camera")}
          onPlanWeek={() => {}}
          onStats={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerText: { flex: 1, gap: 4 },
  date: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  greeting: { fontFamily: fonts.bodyMedium, fontSize: 28, color: colors.textPrimary },
  greetingName: { fontFamily: fonts.displayItalic, fontSize: 32, color: colors.accent },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  eventDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  eventText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
