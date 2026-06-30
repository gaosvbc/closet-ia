import Anthropic from "@anthropic-ai/sdk";

// =============================================================================
// Claude Vision clothing analysis — single provider, tiered by subscription
// plan via prompt engineering (not model selection).
//
// SECURITY: this module reads ANTHROPIC_API_KEY and must only ever be
// imported from server-side code (API routes, server components). Never
// import this from a Client Component.
// =============================================================================

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

const MODEL = "claude-haiku-4-5-20251001";

export type PlanTier = "essential" | "pro" | "elite";

export type GarmentSlot =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "footwear"
  | "accessory"
  | "bag"
  | "na";

export interface ClothingAnalysisBasic {
  type: string;
  color: string;
  category: "Prendas" | "Zapatos" | "Accesorios" | "Bolsos";
  garmentSlot: GarmentSlot;
}

export interface ClothingAnalysisDetailed extends ClothingAnalysisBasic {
  material: string;
  pattern: string;
  season: "spring" | "summer" | "fall" | "winter" | "year-round";
  formality: "casual" | "business-casual" | "formal" | "athletic";
}

export interface ClothingAnalysisFull extends ClothingAnalysisDetailed {
  idealTempRangeCelsius: { min: number; max: number };
  occasions: string[];
  styleDescriptors: string[];
  pairingSuggestions: string;
}

export type ClothingAnalysis =
  | ClothingAnalysisBasic
  | ClothingAnalysisDetailed
  | ClothingAnalysisFull;

const GARMENT_SLOT_GUIDE = `Garment slot guidance (only applies when category is "Prendas"):
- "top" = shirts, blouses, t-shirts, sweaters, tank tops
- "bottom" = pants, skirts, shorts, jeans
- "dress" = dresses, jumpsuits, rompers (a single complete lower+upper piece)
- "outerwear" = jackets, coats, blazers
For items where category is "Zapatos", "Accesorios", or "Bolsos", set garmentSlot to "na" (not applicable — these have their own category already).`;

const PROMPTS: Record<PlanTier, string> = {
  essential: `Analyze this clothing item photo. Return ONLY valid JSON with no markdown formatting:
{
  "type": "specific garment name",
  "color": "primary color",
  "category": "Prendas|Zapatos|Accesorios|Bolsos",
  "garmentSlot": "top|bottom|dress|outerwear|footwear|accessory|bag|na"
}
Category guide: Prendas = clothing worn on the body (tops, bottoms, dresses, outerwear); Zapatos = footwear; Accesorios = jewelry, belts, hats, scarves, sunglasses; Bolsos = bags, purses, backpacks.
${GARMENT_SLOT_GUIDE}`,
  pro: `Analyze this clothing item photo in detail. Return ONLY valid JSON with no markdown formatting:
{
  "type": "specific garment name",
  "color": "primary color",
  "category": "Prendas|Zapatos|Accesorios|Bolsos",
  "garmentSlot": "top|bottom|dress|outerwear|footwear|accessory|bag|na",
  "material": "fabric/material guess",
  "pattern": "solid|striped|floral|plaid|other",
  "season": "spring|summer|fall|winter|year-round",
  "formality": "casual|business-casual|formal|athletic"
}
Category guide: Prendas = clothing worn on the body (tops, bottoms, dresses, outerwear); Zapatos = footwear; Accesorios = jewelry, belts, hats, scarves, sunglasses; Bolsos = bags, purses, backpacks.
${GARMENT_SLOT_GUIDE}`,
  elite: `Analyze this clothing item photo comprehensively, as an expert fashion stylist would. Return ONLY valid JSON with no markdown formatting:
{
  "type": "specific garment name",
  "color": "primary color",
  "category": "Prendas|Zapatos|Accesorios|Bolsos",
  "garmentSlot": "top|bottom|dress|outerwear|footwear|accessory|bag|na",
  "material": "fabric/material guess",
  "pattern": "solid|striped|floral|plaid|other",
  "season": "spring|summer|fall|winter|year-round",
  "formality": "casual|business-casual|formal|athletic",
  "idealTempRangeCelsius": { "min": number, "max": number },
  "occasions": ["array", "of", "occasion", "tags"],
  "styleDescriptors": ["array", "of", "style", "words"],
  "pairingSuggestions": "brief text on what this pairs well with"
}
Category guide: Prendas = clothing worn on the body (tops, bottoms, dresses, outerwear); Zapatos = footwear; Accesorios = jewelry, belts, hats, scarves, sunglasses; Bolsos = bags, purses, backpacks.
${GARMENT_SLOT_GUIDE}`,
};

export interface AnalyzeResult {
  analysis: ClothingAnalysis;
  usage: { inputTokens: number; outputTokens: number };
}

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** True for errors worth retrying: rate limits and transient server/connection errors. */
function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    return error.status === 429 || (error.status !== undefined && error.status >= 500);
  }
  return error instanceof Anthropic.APIConnectionError;
}

export async function analyzeClothingItem(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png",
  planTier: PlanTier
): Promise<AnalyzeResult> {
  const client = getClient();

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: PROMPTS[planTier],
              },
            ],
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude Vision");
      }

      const cleaned = textBlock.text.replace(/```json|```/g, "").trim();

      let analysis: ClothingAnalysis;
      try {
        analysis = JSON.parse(cleaned) as ClothingAnalysis;
      } catch {
        // eslint-disable-next-line no-console
        console.error("[clothing-analysis] failed to parse Claude response:", cleaned);
        throw new Error("Could not parse analysis response");
      }

      return {
        analysis,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES && isRetryable(error)) {
        await sleep(BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
