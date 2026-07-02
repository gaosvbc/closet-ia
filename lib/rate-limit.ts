// In-memory sliding-window rate limiter. State persists within a warm
// Node.js process; across cold starts or multiple instances the windows reset,
// making this best-effort. Sufficient for a single-server or lightly-scaled
// deployment. Replace with @upstash/ratelimit + Vercel KV for multi-instance.

interface RateWindow {
  count: number;
  windowStart: number;
}

const windows = new Map<string, RateWindow>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function pruneOldWindows(windowSecs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoffMs = now - windowSecs * 2 * 1000;
  for (const [key, w] of windows) {
    if (w.windowStart < cutoffMs) windows.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSecs: number;
}

/**
 * Fixed-window rate limit check. Call once per request with a composite key
 * (e.g. `"${ip}:analyze-clothing"`). Returns immediately — no I/O.
 */
export function checkRateLimit(
  key: string,
  windowSecs: number,
  maxRequests: number
): RateLimitResult {
  const now = Date.now();
  pruneOldWindows(windowSecs);

  const existing = windows.get(key);
  const windowMs = windowSecs * 1000;

  if (!existing || now - existing.windowStart >= windowMs) {
    windows.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSecs: 0 };
  }

  existing.count += 1;
  if (existing.count > maxRequests) {
    const retryAfterSecs = Math.ceil(
      (existing.windowStart + windowMs - now) / 1000
    );
    return { allowed: false, remaining: 0, retryAfterSecs };
  }

  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    retryAfterSecs: 0,
  };
}

/** Extract the best-available client IP from Next.js request headers. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Admin login brute-force tracking (separate from the generic rate limiter).
// Tracks only *failed* logins; successful logins clear the counter.
// ---------------------------------------------------------------------------

interface LoginWindow {
  failures: number;
  windowStart: number;
}

const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCKOUT_SECS = 15 * 60; // 15 minutes

const loginAttempts = new Map<string, LoginWindow>();

export interface LoginCheckResult {
  blocked: boolean;
  failureCount: number;
  retryAfterSecs: number;
}

/** Return whether an IP is currently locked out from the admin login. */
export function isLoginBlocked(ip: string): LoginCheckResult {
  const entry = loginAttempts.get(ip);
  if (!entry) return { blocked: false, failureCount: 0, retryAfterSecs: 0 };

  const ageMs = Date.now() - entry.windowStart;
  if (ageMs >= LOGIN_LOCKOUT_SECS * 1000) {
    loginAttempts.delete(ip);
    return { blocked: false, failureCount: 0, retryAfterSecs: 0 };
  }

  if (entry.failures >= LOGIN_MAX_FAILURES) {
    const retryAfterSecs = Math.ceil(
      (entry.windowStart + LOGIN_LOCKOUT_SECS * 1000 - Date.now()) / 1000
    );
    return { blocked: true, failureCount: entry.failures, retryAfterSecs };
  }

  return { blocked: false, failureCount: entry.failures, retryAfterSecs: 0 };
}

/** Record a failed login attempt for an IP. Returns the updated state. */
export function recordFailedLogin(ip: string): LoginCheckResult {
  const now = Date.now();
  const existing = loginAttempts.get(ip);

  if (!existing || now - existing.windowStart >= LOGIN_LOCKOUT_SECS * 1000) {
    loginAttempts.set(ip, { failures: 1, windowStart: now });
    return { blocked: false, failureCount: 1, retryAfterSecs: 0 };
  }

  existing.failures += 1;
  const blocked = existing.failures >= LOGIN_MAX_FAILURES;
  const retryAfterSecs = blocked
    ? Math.ceil((existing.windowStart + LOGIN_LOCKOUT_SECS * 1000 - now) / 1000)
    : 0;
  return { blocked, failureCount: existing.failures, retryAfterSecs };
}

/** Clear the failed login counter for an IP on successful authentication. */
export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
