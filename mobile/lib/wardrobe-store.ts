import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ClothingItem } from "@/types";

// Locally persisted items added via the camera scan flow. Mock mode has no
// backend to save real wardrobe items to, so this keeps newly scanned items
// around across app launches (merged with the bundled demo data in the
// wardrobe screen) until a real Supabase-backed catalogue exists.
const ADDED_ITEMS_KEY = "added_clothing_items";

export async function getAddedItems(): Promise<ClothingItem[]> {
  try {
    const raw = await AsyncStorage.getItem(ADDED_ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClothingItem[];
  } catch {
    return [];
  }
}

export async function addItem(item: ClothingItem): Promise<void> {
  try {
    const existing = await getAddedItems();
    const next = [item, ...existing];
    await AsyncStorage.setItem(ADDED_ITEMS_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal: worst case the item doesn't persist across launches.
  }
}
