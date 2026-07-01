"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, tokenForPassword } from "@/lib/admin";
import {
  clearLoginAttempts,
  isLoginBlocked,
  recordFailedLogin,
} from "@/lib/rate-limit";

// Server actions for the admin gate. The password is compared on the server
// only; on success we set an httpOnly session cookie.

function getAdminClientIp(): string {
  const h = headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function login(formData: FormData): Promise<void> {
  const ip = getAdminClientIp();

  // Block IPs that have exceeded the failed-login threshold (5 failures → 15 min).
  const lockout = isLoginBlocked(ip);
  if (lockout.blocked) {
    redirect(`/admin?error=2&retry=${lockout.retryAfterSecs}`);
  }

  const password = String(formData.get("password") ?? "");
  const token = tokenForPassword(password);

  if (!token) {
    // Artificial delay on every failed attempt to slow automated attacks.
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = recordFailedLogin(ip);
    // eslint-disable-next-line no-console
    console.warn(
      `[admin] Failed login from ${ip} (attempt ${result.failureCount}/5)`
    );

    if (result.blocked) {
      redirect(`/admin?error=2&retry=${result.retryAfterSecs}`);
    }
    redirect("/admin?error=1");
  }

  // Successful login: clear the failure counter so the IP isn't penalised
  // on the next session.
  clearLoginAttempts(ip);

  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  redirect("/admin");
}

export async function logout(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin");
}
