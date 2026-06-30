import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isMockMode } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth/errors";

export interface AuthResult {
  ok: boolean;
  /** Friendly, never-raw error message — already safe to render. */
  error: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // In mock mode there is no Supabase project to talk to, so there is never
  // a session to load — skip straight past the loading state.
  const [loading, setLoading] = useState(!isMockMode);

  useEffect(() => {
    if (isMockMode || !supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,

      async signUp(email, password, fullName) {
        if (isMockMode || !supabase) {
          return { ok: false, error: "Auth is not configured." };
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        // Session-bearing tokens are never logged here or anywhere else in
        // the auth flow — only the friendly error message is returned.
        if (error) return { ok: false, error: authErrorMessage(error) };
        return { ok: true, error: null };
      },

      async signIn(email, password) {
        if (isMockMode || !supabase) {
          return { ok: false, error: "Auth is not configured." };
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: authErrorMessage(error) };
        return { ok: true, error: null };
      },

      async signOut() {
        if (isMockMode || !supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
