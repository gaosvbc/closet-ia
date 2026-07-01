import { GoogleGenAI, Modality } from "@google/genai";
import type { Session, LiveServerMessage } from "@google/genai";

// Confirmed from @google/genai dist source (node/index.js live.connect example):
// non-Vertex path uses 'gemini-live-2.5-flash-preview'; Vertex uses
// 'gemini-2.0-flash-live-preview-04-09'. We use Google AI Studio, not Vertex.
const LIVE_MODEL = "gemini-live-2.5-flash-preview";

function buildSystemInstruction(wardrobeContext: string): string {
  return `Eres AtelIA, un estilista personal experto y cálido.
Ves a la persona a través de la cámara y conversas con ella sobre su outfit y estilo.
Conoces su armario catalogado: ${wardrobeContext}
Da consejos breves, cálidos y específicos. Habla en español.
Nunca menciones que eres una IA de Google ni des detalles técnicos — eres "el Espejo Mágico de AtelIA".`;
}

export interface MagicMirrorCallbacks {
  onOpen?: () => void;
  onMessage: (message: LiveServerMessage) => void;
  onError: (error: ErrorEvent) => void;
  onClose: (reason: string) => void;
}

export async function startMagicMirrorSession(
  wardrobeContext: string,
  callbacks: MagicMirrorCallbacks
): Promise<Session> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  return ai.live.connect({
    model: LIVE_MODEL,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: buildSystemInstruction(wardrobeContext),
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: () => callbacks.onOpen?.(),
      onmessage: (e: LiveServerMessage) => callbacks.onMessage(e),
      onerror: (e: ErrorEvent) => callbacks.onError(e),
      onclose: (e: CloseEvent) => callbacks.onClose(e.reason ?? ""),
    },
  });
}

export function sendAudioChunk(session: Session, base64Pcm16: string): void {
  session.sendRealtimeInput({ audio: { data: base64Pcm16, mimeType: "audio/pcm;rate=16000" } });
}

export function sendVideoFrame(session: Session, base64Jpeg: string): void {
  session.sendRealtimeInput({ video: { data: base64Jpeg, mimeType: "image/jpeg" } });
}

export type { Session, LiveServerMessage };
