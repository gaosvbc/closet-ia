import { supabase, isMockMode } from "@/lib/supabase";
import { clothingItems as mockItems } from "@/lib/mock-data";

// Returns a compact text summary of the user's wardrobe (names + categories
// only — not images, not raw JSON) to inject into the Gemini Live system
// instruction. Example: "Blazer vino (Prendas), Jeans azules (Prendas)…"
// This gives the AI enough context to say "Veo que tienes un blazer vino"
// without spending budget on image tokens.
export async function buildWardrobeContext(userId: string): Promise<string> {
  if (isMockMode || !supabase) {
    const items = mockItems.map((i) => ({ name: i.name, category: i.category as string }));
    return formatItems(items);
  }

  const { data } = await supabase
    .from("clothing_items")
    .select("name, type, category")
    .eq("user_id", userId)
    .limit(200);

  const items = (data ?? []).map((row) => ({
    name: (row.name as string | null) || (row.type as string | null) || "prenda",
    category: (row.category as string | null) || "Prendas",
  }));
  return formatItems(items);
}

function formatItems(items: { name: string; category: string }[]): string {
  if (items.length === 0) return "El usuario aún no ha catalogado prendas en su armario.";
  return items.map((i) => `${i.name} (${i.category})`).join(", ");
}
