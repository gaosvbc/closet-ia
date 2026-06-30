import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import WeatherWidget from "@/components/home/WeatherWidget";
import OutfitCard from "@/components/home/OutfitCard";
import QuickActions from "@/components/home/QuickActions";
import { userProfile as mockProfile, clothingItems as mockClothingItems } from "@/lib/mock-data";
import { getAddedItems } from "@/lib/wardrobe-store";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode, supabase } from "@/lib/supabase";
import { dbRowToClothingItem, type ClothingItemRow } from "@/lib/ai-mapping";
import { getWeatherForCurrentLocation, getCachedWeather, type WeatherData } from "@/lib/weather/getWeather";
import { getValidAccessToken } from "@/lib/calendar/googleAuth";
import { getTodayEvents, type CalendarEvent } from "@/lib/calendar/googleCalendar";
import { suggestOutfit, type OutfitSuggestion } from "@/lib/outfit/suggestOutfit";
import type { ClothingItem } from "@/types";

const MIN_WARDROBE_SIZE = 5;
const RECENT_WEAR_WINDOW_DAYS = 14;

type ScreenStatus = "loading" | "ready" | "empty";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" })
    .format(new Date())
    .toUpperCase();
}

function isoDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [recentlyWornItemIds, setRecentlyWornItemIds] = useState<string[]>([]);
  const [bodyProfile, setBodyProfile] = useState({
    bodyType: mockProfile.bodyProfile.bodyType,
    fitPreference: mockProfile.bodyProfile.fitPreference,
  });
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [wornToday, setWornToday] = useState(false);

  const displayName =
    !isMockMode && user
      ? String(user.user_metadata?.full_name ?? user.email ?? "").split(" ")[0] || "tú"
      : mockProfile.name;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        setStatus("loading");

        const weatherPromise = getWeatherForCurrentLocation().catch(() => getCachedWeather());

        let wardrobeItems: ClothingItem[] = [];
        let events: CalendarEvent[] = [];
        let recentIds: string[] = [];
        let profile = {
          bodyType: mockProfile.bodyProfile.bodyType,
          fitPreference: mockProfile.bodyProfile.fitPreference,
        };
        let wasWornToday = false;

        if (!isMockMode && supabase && user) {
          const [itemsRes, profileRes, wornRes] = await Promise.all([
            supabase
              .from("clothing_items")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("user_profiles")
              .select("body_type, fit_preference, plan_tier, google_calendar_connected")
              .eq("id", user.id)
              .single(),
            supabase
              .from("worn_outfits")
              .select("item_ids, worn_date")
              .eq("user_id", user.id)
              .gte("worn_date", isoDateDaysAgo(RECENT_WEAR_WINDOW_DAYS)),
          ]);

          wardrobeItems = ((itemsRes.data ?? []) as ClothingItemRow[]).map(dbRowToClothingItem);
          profile = {
            bodyType: profileRes.data?.body_type || profile.bodyType,
            fitPreference: profileRes.data?.fit_preference || profile.fitPreference,
          };

          const wornRows = (wornRes.data ?? []) as { item_ids: string[]; worn_date: string }[];
          recentIds = wornRows.flatMap((row) => row.item_ids ?? []);
          wasWornToday = wornRows.some((row) => row.worn_date === todayISODate());

          const planTier = profileRes.data?.plan_tier;
          const calendarConnected = Boolean(profileRes.data?.google_calendar_connected);
          if ((planTier === "pro" || planTier === "elite") && calendarConnected) {
            try {
              const accessToken = await getValidAccessToken();
              if (accessToken) {
                events = await getTodayEvents(accessToken);
              }
            } catch {
              // Calendar fetch failure simply omits the badge — never blocks the suggestion.
              events = [];
            }
          }
        } else {
          const added = await getAddedItems();
          wardrobeItems = [...added, ...mockClothingItems];
          // Mock mode has no worn-history persistence layer, so the
          // repeat-check always passes against an empty recent list.
          recentIds = [];
        }

        if (cancelled) return;

        const resolvedWeather = (await weatherPromise) ?? null;

        setWardrobe(wardrobeItems);
        setWeather(resolvedWeather);
        setTodayEvents(events);
        setRecentlyWornItemIds(recentIds);
        setBodyProfile(profile);
        setWornToday(wasWornToday);

        if (wardrobeItems.length < MIN_WARDROBE_SIZE) {
          setSuggestion(null);
          setStatus("empty");
          return;
        }

        if (resolvedWeather) {
          setSuggestion(
            suggestOutfit({
              wardrobe: wardrobeItems,
              weather: resolvedWeather,
              todayEvents: events,
              bodyProfile: profile,
              recentlyWornItemIds: recentIds,
            })
          );
        }
        setStatus("ready");
      })();

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  async function handleWear() {
    if (!suggestion || wornToday) return;
    setWornToday(true);
    if (!isMockMode && supabase && user) {
      await supabase.from("worn_outfits").insert({
        user_id: user.id,
        item_ids: suggestion.items.map((item) => item.id),
      });
    }
  }

  function handleShuffle() {
    if (!weather || wardrobe.length < MIN_WARDROBE_SIZE) return;
    setSuggestion(
      suggestOutfit({
        wardrobe: shuffle(wardrobe),
        weather,
        todayEvents,
        bodyProfile,
        recentlyWornItemIds,
      })
    );
  }

  const eventLabel =
    todayEvents.length > 0 ? `${todayEvents[0].title} · ${todayEvents[0].startTime}` : undefined;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.date}>{todayLabel()}</Text>
            <Text style={styles.greeting}>
              Hola, <Text style={styles.greetingName}>{displayName}</Text>
            </Text>
            {todayEvents.length > 0 && (
              <View style={styles.eventRow}>
                <View style={styles.eventDot} />
                <Text style={styles.eventText}>
                  Tienes {todayEvents.length} evento{todayEvents.length > 1 ? "s" : ""} hoy ·{" "}
                  {todayEvents[0].title} {todayEvents[0].startTime}
                </Text>
              </View>
            )}
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

        {status === "loading" && (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}

        {status === "empty" && (
          <View style={styles.emptyCard}>
            <Feather name="shopping-bag" size={22} color={colors.accent} />
            <Text style={styles.emptyText}>
              Añade al menos {MIN_WARDROBE_SIZE} prendas para recibir tu primera sugerencia.
            </Text>
          </View>
        )}

        {status === "ready" && suggestion && (
          <OutfitCard
            items={suggestion.items}
            styleNote={suggestion.styleNote}
            eventLabel={eventLabel}
            wornToday={wornToday}
            onWear={handleWear}
            onShuffle={handleShuffle}
          />
        )}

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
  loadingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
