// Web parity of mobile/lib/weather/getWeather.ts. No web page currently
// renders weather data — this file exists to satisfy the spec's explicit
// file path requirement and to keep the two clients' weather logic in sync
// if/when a web "Hoy" experience is built. See PR notes.
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

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

  return {
    tempCelsius,
    condition: es,
    conditionIcon: icon,
    styleAdvice: buildStyleAdvice(tempCelsius, main),
  };
}
