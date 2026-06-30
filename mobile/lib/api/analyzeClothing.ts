import * as FileSystem from "expo-file-system";
import { API_URL, isApiConfigured } from "@/lib/config";
import type { ClothingAnalysis } from "@/types";

export interface AnalyzeClothingResult {
  ok: boolean;
  analysis: ClothingAnalysis | null;
  /** User-facing message when analysis failed — never blocks saving. */
  error: string | null;
}

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 20_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

const FALLBACK_MESSAGE =
  "We couldn't analyze this item automatically. Please fill in the details manually.";

/**
 * Analyzes a captured clothing photo via the AtelIA backend. Never throws —
 * any failure (network, server, timeout) resolves to `ok: false` with a
 * friendly message so the caller can fall back to an empty, editable form
 * without ever blocking the user from saving the item.
 */
export async function analyzeClothing(
  imageUri: string,
  userId: string
): Promise<AnalyzeClothingResult> {
  if (!isApiConfigured) {
    return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
  }

  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/api/analyze-clothing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mediaType: "image/jpeg",
            userId,
          }),
        },
        REQUEST_TIMEOUT_MS
      );

      if (response.status === 429 || response.status >= 500) {
        if (attempt < MAX_RETRIES) {
          await sleep(BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
      }

      if (!response.ok) {
        return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
      }

      const json = (await response.json()) as { ok: boolean; analysis?: ClothingAnalysis };
      if (!json.ok || !json.analysis) {
        return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
      }

      return { ok: true, analysis: json.analysis, error: null };
    } catch {
      if (attempt < MAX_RETRIES) {
        await sleep(BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
    }
  }

  return { ok: false, analysis: null, error: FALLBACK_MESSAGE };
}
