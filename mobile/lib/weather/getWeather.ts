import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

// OpenWeather free tier. The API key is intentionally bundled client-side
// (EXPO_PUBLIC_*) rather than proxied through a server route — it's a
// low-risk, rate-limited free-tier key with no user data behind it, unlike
// the Supabase/Claude keys used elsewhere in the app. See README/PR notes.
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

// Default city when location permission is denied or unavailable. US-first
// market default — NYC per explicit instruction, pending product
// confirmation on whether this should vary by detected locale/region.
const DEFAULT_COORDS = { lat: 40.7128, lon: -74.006 };

const LAST_WEATHER_CACHE_KEY = "atelia_last_weather";

export interface WeatherData {
  tempCelsius: number;
  condition: string;
  conditionIcon: string;
  styleAdvice: string;
}

interface ConditionMapping {
  es: string;
  icon: string;
}

// Maps OpenWeather's `main` field (https://openweathermap.org/weather-conditions)
// to Spanish UI text + a Feather icon name.
const CONDITION_MAP: Record<string, ConditionMapping> = {
  Clear: { es: "Soleado", icon: "sun" },
  Clouds: { es: "Nublado", icon: "cloud" },
  Rain: { es: "Lluvia", icon: "cloud-rain" },
  Drizzle: { es: "Llovizna", icon: "cloud-drizzle" },
  Thunderstorm: { es: "Tormenta", icon: "cloud-lightning" },
  Snow: { es: "Nieve", icon: "cloud-snow" },
  Mist: { es: "Neblina", icon: "cloud-drizzle" },
  Smoke: { es: "Humo", icon: "wind" },
  Haze: { es: "Bruma", icon: "wind" },
  Dust: { es: "Polvo", icon: "wind" },
  Fog: { es: "Niebla", icon: "cloud-drizzle" },
  Sand: { es: "Arena", icon: "wind" },
  Ash: { es: "Ceniza", icon: "wind" },
  Squall: { es: "Ráfagas", icon: "wind" },
  Tornado: { es: "Tornado", icon: "wind" },
};

function mapCondition(main: string): ConditionMapping {
  return CONDITION_MAP[main] ?? { es: "Templado", icon: "cloud" };
}

function buildStyleAdvice(tempCelsius: number, main: string): string {
  if (main === "Rain" || main === "Drizzle" || main === "Thunderstorm") {
    return "Lleva algo impermeable.";
  }
  if (tempCelsius < 15) {
    return "Ideal para capas ligeras.";
  }
  if (tempCelsius > 25) {
    return "Día caluroso, prioriza telas frescas.";
  }
  return "Clima estable, vístete a tu gusto.";
}

export async function getCurrentCoords(): Promise<{ lat: number; lon: number }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return DEFAULT_COORDS;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: position.coords.latitude, lon: position.coords.longitude };
  } catch {
    return DEFAULT_COORDS;
  }
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("OpenWeather API key not configured");
  }

  const url = `${OPENWEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenWeather request failed: ${response.status}`);
  }

  const data = await response.json();
  const tempCelsius = Math.round(data.main?.temp ?? 0);
  const main: string = data.weather?.[0]?.main ?? "Clear";
  const { es, icon } = mapCondition(main);

  const weather: WeatherData = {
    tempCelsius,
    condition: es,
    conditionIcon: icon,
    styleAdvice: buildStyleAdvice(tempCelsius, main),
  };

  try {
    await AsyncStorage.setItem(LAST_WEATHER_CACHE_KEY, JSON.stringify(weather));
  } catch {
    // best-effort cache, never block on it
  }

  return weather;
}

export async function getCachedWeather(): Promise<WeatherData | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_WEATHER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeatherData) : null;
  } catch {
    return null;
  }
}

export async function getWeatherForCurrentLocation(): Promise<WeatherData> {
  const { lat, lon } = await getCurrentCoords();
  return getWeather(lat, lon);
}
