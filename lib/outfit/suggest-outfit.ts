import type { WeatherData } from "@/lib/weather/get-weather";

// Web parity of mobile/lib/outfit/suggestOutfit.ts. No web "Hoy" page
// exists yet to call this — included to satisfy the spec's explicit file
// path and to keep the algorithm in sync if a web experience is built
// later. See PR notes.
//
// Minimal local type mirroring mobile/types/index.ts's ClothingItem (the
// fields this algorithm reads). The web project has no clothing_items UI
// type of its own yet.
export interface ClothingItem {
  id: string;
  name: string;
  category: "Prendas" | "Zapatos" | "Accesorios" | "Bolsos";
  type?: string;
  garmentSlot?: "top" | "bottom" | "dress" | "outerwear" | "footwear" | "accessory" | "bag" | "na";
  season?: string;
  formality?: string;
  idealTempRangeCelsius?: { min: number; max: number };
}

export interface CalendarEvent {
  title: string;
  startTime: string;
  isAllDay: boolean;
}

export interface OutfitSuggestionInput {
  wardrobe: ClothingItem[];
  weather: WeatherData;
  todayEvents: CalendarEvent[];
  bodyProfile: { bodyType: string; fitPreference: string };
  recentlyWornItemIds: string[];
}

export interface OutfitSuggestion {
  items: ClothingItem[];
  styleNote: string;
  repeatCheckPassed: boolean;
}

type PrendaSlot = "top" | "bottom" | "dress" | "outerwear" | "other";

function prendaSlot(item: ClothingItem): PrendaSlot {
  switch (item.garmentSlot) {
    case "top":
    case "bottom":
    case "dress":
    case "outerwear":
      return item.garmentSlot;
    default:
      return "other";
  }
}

function matchesWeather(item: ClothingItem, tempCelsius: number): boolean {
  if (item.idealTempRangeCelsius) {
    return tempCelsius >= item.idealTempRangeCelsius.min && tempCelsius <= item.idealTempRangeCelsius.max;
  }
  if (!item.season || item.season === "year-round") return true;
  if (tempCelsius < 10) return item.season === "winter";
  if (tempCelsius < 18) return item.season === "fall" || item.season === "winter";
  if (tempCelsius < 25) return item.season === "spring" || item.season === "fall";
  return item.season === "summer" || item.season === "spring";
}

const FORMAL_EVENT_KEYWORDS = /reuni[oó]n|meeting|trabajo|oficina|presentaci[oó]n|cliente/i;

function desiredFormality(todayEvents: CalendarEvent[]): "formal" | "casual" {
  const hasFormalEvent = todayEvents.some((event) => FORMAL_EVENT_KEYWORDS.test(event.title));
  return hasFormalEvent ? "formal" : "casual";
}

function matchesFormality(item: ClothingItem, desired: "formal" | "casual"): boolean {
  if (!item.formality) return true;
  if (desired === "formal") return item.formality === "business-casual" || item.formality === "formal";
  return item.formality === "casual" || item.formality === "athletic";
}

function softFilter<T>(items: T[], predicate: (item: T) => boolean, minRemaining = 1): T[] {
  const filtered = items.filter(predicate);
  return filtered.length >= minRemaining ? filtered : items;
}

function buildStyleNote(
  formality: "formal" | "casual",
  todayEvents: CalendarEvent[],
  weather: WeatherData
): string {
  const formalityLabel = formality === "formal" ? "formal" : "casual";
  const eventContext = todayEvents.length > 0 ? todayEvents[0].title : "el día";
  return `Un look ${formalityLabel} para tu ${eventContext}. ${weather.styleAdvice}`;
}

function pickOne<T>(items: T[]): T | undefined {
  return items.length > 0 ? items[0] : undefined;
}

export function suggestOutfit(input: OutfitSuggestionInput): OutfitSuggestion {
  const { wardrobe, weather, todayEvents, recentlyWornItemIds } = input;
  const formality = desiredFormality(todayEvents);

  const weatherMatched = softFilter(wardrobe, (item) => matchesWeather(item, weather.tempCelsius));
  const formalityMatched = softFilter(weatherMatched, (item) => matchesFormality(item, formality));
  const notRecentlyWorn = softFilter(formalityMatched, (item) => !recentlyWornItemIds.includes(item.id));

  const prendas = notRecentlyWorn.filter((item) => item.category === "Prendas");
  const zapatos = notRecentlyWorn.filter((item) => item.category === "Zapatos");
  const accesorios = notRecentlyWorn.filter((item) => item.category === "Accesorios");
  const bolsos = notRecentlyWorn.filter((item) => item.category === "Bolsos");

  const dresses = prendas.filter((item) => prendaSlot(item) === "dress");
  const tops = prendas.filter((item) => prendaSlot(item) === "top");
  const bottoms = prendas.filter((item) => prendaSlot(item) === "bottom");

  const selected: ClothingItem[] = [];

  const dress = pickOne(dresses);
  if (dress) {
    selected.push(dress);
  } else {
    const top = pickOne(tops) ?? pickOne(prendas.filter((item) => prendaSlot(item) === "other"));
    const bottom = pickOne(bottoms);
    if (top) selected.push(top);
    if (bottom && bottom.id !== top?.id) selected.push(bottom);
  }

  const shoe = pickOne(zapatos);
  if (shoe) selected.push(shoe);

  const extra = pickOne(accesorios) ?? pickOne(bolsos);
  if (extra) selected.push(extra);

  const repeatCheckPassed = selected.every((item) => !recentlyWornItemIds.includes(item.id));

  return {
    items: selected,
    styleNote: buildStyleNote(formality, todayEvents, weather),
    repeatCheckPassed,
  };
}
