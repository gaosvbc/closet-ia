import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Small helpers to keep API routes consistent and to guarantee we never leak
// raw internal errors to the client.

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data });
}

export function badRequest(message = "Invalid submission") {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export function unauthorized(message = "Authentication required") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function serverError(message = "Something went wrong. Please try again.") {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

/** Turn a Zod error into a single friendly, user-safe message. */
export function firstZodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Please check your details and try again.";
}

/** Safely parse a JSON request body, returning null on any failure. */
export async function readJson<T = unknown>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
