import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { getWeatherForCurrentLocation, getCachedWeather, type WeatherData } from "@/lib/weather/getWeather";

type Status = "loading" | "ready" | "error";

// Weather summary card shown on the Home screen. Tries a live fetch first,
// falls back to the last successfully cached reading, and only shows the
// error state if neither is available.
export default function WeatherWidget() {
  const [status, setStatus] = useState<Status>("loading");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getWeatherForCurrentLocation();
      setWeather(data);
      setStatus("ready");
    } catch {
      const cached = await getCachedWeather();
      if (cached) {
        setWeather(cached);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "loading") {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (status === "error" || !weather) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Feather name="cloud-off" size={20} color={colors.textSecondary} />
        <Text style={styles.errorText}>No pudimos obtener el clima</Text>
        <Pressable onPress={load} style={styles.retryBtn} accessibilityRole="button">
          <Feather name="refresh-cw" size={14} color={colors.accent} />
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Feather
          name={weather.conditionIcon as keyof typeof Feather.glyphMap}
          size={22}
          color={colors.textSecondary}
        />
        <View style={styles.tempRow}>
          <Text style={styles.temp}>{weather.tempCelsius}°</Text>
          <Text style={styles.cond}> {weather.condition}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.note}>{weather.styleAdvice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 16,
  },
  centered: { justifyContent: "center", minHeight: 64, gap: 8 },
  left: { alignItems: "flex-start", gap: 6 },
  tempRow: { flexDirection: "row", alignItems: "baseline" },
  temp: { fontFamily: fonts.bodySemibold, fontSize: 28, color: colors.textPrimary },
  cond: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  note: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  retryText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent },
});
