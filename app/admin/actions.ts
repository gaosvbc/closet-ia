"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, tokenForPassword } from "@/lib/admin";

// Server actions for the admin gate. The password is compared on the server
// only; on success we set an httpOnly session cookie.

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const token = tokenForPassword(password);

  if (!token) {
    redirect("/admin?error=1");
  }

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
