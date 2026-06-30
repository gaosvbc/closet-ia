import type { ClothingItem } from "@/types";
import type { WeatherData } from "@/lib/weather/getWeather";
import type { CalendarEvent } from "@/lib/calendar/googleCalendar";

export interface OutfitSuggestionInput {
  wardrobe: ClothingItem[];
  weather: WeatherData;
  todayEvents: CalendarEvent[];
  bodyProfile: { bodyType: string; fitPreference: string };
  recentlyWornItemIds: string[]; // last 14 days
}

export interface OutfitSuggestion {
  items: ClothingItem[];
  styleNote: string;
  repeatCheckPassed: boolean;
}

// The schema has no explicit top/bottom/dress field within "Prendas" — only
// a free-text `type`/`name`. This keyword heuristic is a best-effort,
// lossy stand-in until a dedicated garment-slot field exists on
// clothing_items. Flagged as a known limitation in the PR notes.
type GarmentSlot = "top" | "bottom" | "dress" | "outerwear" | "other";

const TOP_KEYWORDS = /camis|blusa|playera|polo|sueter|suéter|top|jersey|cárdigan|cardigan|chaleco/i;
const BOTTOM_KEYWORDS = /pantal[oó]n|jean|falda|short|bermuda|legging/i;
const DRESS_KEYWORDS = /vestido|mono|jumpsuit|overol/i;
const OUTERWEAR_KEYWORDS = /abrigo|chaqueta|chamarra|saco|blazer|gabardina/i;

function classifyGarment(item: ClothingItem): GarmentSlot {
  const text = `${item.type ?? ""} ${item.name}`.toLowerCase();
  if (DRESS_KEYWORDS.test(text)) return "dress";
  if (OUTERWEAR_KEYWORDS.test(text)) return "outerwear";
  if (TOP_KEYWORDS.test(text)) return "top";
  if (BOTTOM_KEYWORDS.test(text)) return "bottom";
  return "other";
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

// Soft filter: applies `predicate`, but falls back to the unfiltered pool
// when filtering would leave too few candidates to assemble an outfit.
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
  const weatherNote = weather.styleAdvice;
  return `Un look ${formalityLabel} para tu ${eventContext}. ${weatherNote}`;
}

function pickOne<T>(items: T[]): T | undefined {
  return items.length > 0 ? items[0] : undefined;
}

// Rule-based, no AI call. Filters the wardrobe by weather and event
// formality, soft-excludes recently worn items, and assembles one
// complete outfit from the surviving candidates.
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

  const dresses = prendas.filter((item) => classifyGarment(item) === "dress");
  const tops = prendas.filter((item) => classifyGarment(item) === "top");
  const bottoms = prendas.filter((item) => classifyGarment(item) === "bottom");

  const selected: ClothingItem[] = [];

  const dress = pickOne(dresses);
  if (dress) {
    selected.push(dress);
  } else {
    const top = pickOne(tops) ?? pickOne(prendas.filter((item) => classifyGarment(item) === "other"));
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
