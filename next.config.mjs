/** @type {import('next').NextConfig} */

// Security headers applied to every response.
// CSP is in report-only mode so violations are logged without blocking traffic
// during validation. Switch Content-Security-Policy-Report-Only →
// Content-Security-Policy once confirmed it doesn't break anything.
const securityHeaders = [
  // Prevent the site from being embedded in iframes (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },

  // Stop browsers from MIME-sniffing responses away from the declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Send the origin+path on same-origin requests, only the origin cross-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Disable browser features the app doesn't use. Extend camera/microphone
  // allowlist if a future feature requires them (e.g., in-browser photo capture).
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // CSP (report-only). Supabase REST/Realtime WS are the only cross-origin
  // connections. Fonts are self-hosted via next/font (no fonts.gstatic.com
  // needed at runtime). 'unsafe-inline' is required by Next.js for hydration
  // scripts and Tailwind's runtime style injection.
  //
  // To enforce (blocking), replace the key with "Content-Security-Policy".
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Apply to every route, including /admin, /api/*, and static assets.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
