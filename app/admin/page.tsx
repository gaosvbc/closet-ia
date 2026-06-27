import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldAlert, Database } from "lucide-react";
import {
  getAdminStats,
  isAdminConfigured,
  isAuthenticated,
} from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase";
import { login, logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin — Visual Closet Tracker",
  robots: { index: false, follow: false },
};

// Force dynamic rendering: this page reads cookies and live data.
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // 1) ADMIN_PASSWORD not set → clear setup message, never crash.
  if (!isAdminConfigured()) {
    return (
      <Shell>
        <SetupCard
          icon={<ShieldAlert strokeWidth={1.25} className="h-6 w-6 text-ink" />}
          title="Admin is not configured yet"
          body="Set an ADMIN_PASSWORD environment variable to protect and unlock this dashboard."
        >
          <CodeBlock>{`# .env.local\nADMIN_PASSWORD=choose-a-strong-password`}</CodeBlock>
          <p className="mt-4 text-sm text-muted">
            Restart the dev server after adding it. See{" "}
            <span className="text-ink">SUPABASE_SETUP.md</span> for the full
            walkthrough.
          </p>
        </SetupCard>
      </Shell>
    );
  }

  // 2) Configured but not logged in → password gate.
  if (!isAuthenticated()) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl">Admin access</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the admin password to continue.
          </p>
          <form action={login} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="field-input"
              />
            </div>
            {searchParams?.error && (
              <p className="text-sm text-ink">
                Incorrect password. Please try again.
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full">
              Sign in
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  // 3) Authenticated. Show data if Supabase is connected, else setup state.
  const stats = await getAdminStats();

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="mt-2 text-3xl">Validation metrics</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="btn btn-outline px-4 py-2 text-sm">
            <LogOut strokeWidth={1.5} className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      {!isSupabaseConfigured() || !stats ? (
        <div className="mt-10">
          <SetupCard
            icon={<Database strokeWidth={1.25} className="h-6 w-6 text-ink" />}
            title="Connect Supabase to see live data"
            body="The dashboard is ready. Add your Supabase credentials and run the migration to start collecting and viewing real metrics."
          >
            <CodeBlock>{`# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...`}</CodeBlock>
            <p className="mt-4 text-sm text-muted">
              Until then, every form submission is logged to the server console
              in fallback mode. Full steps are in{" "}
              <span className="text-ink">SUPABASE_SETUP.md</span>.
            </p>
          </SetupCard>
        </div>
      ) : (
        <Dashboard stats={stats} />
      )}
    </Shell>
  );
}

function Dashboard({
  stats,
}: {
  stats: NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
}) {
  const totalPlanVotes = stats.planBreakdown.reduce((s, p) => s + p.count, 0);
  const paidVotes = stats.planBreakdown
    .filter((p) => p.plan !== "free")
    .reduce((s, p) => s + p.count, 0);
  const maxDay = Math.max(1, ...stats.signupsByDay.map((d) => d.count));

  return (
    <div className="mt-10 space-y-10">
      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total waitlist signups" value={stats.totalLeads} />
        <Stat
          label="Onboarding completion"
          value={`${Math.round(stats.onboarding.completionRate * 100)}%`}
          sub={`${stats.onboarding.completes} of ${stats.onboarding.starts} started`}
        />
        <Stat
          label="Paid plan votes"
          value={
            totalPlanVotes > 0
              ? `${Math.round((paidVotes / totalPlanVotes) * 100)}%`
              : "—"
          }
          sub={`${paidVotes} of ${totalPlanVotes} chose Essential/Pro`}
        />
      </div>

      {/* Signups by day */}
      <Panel title="Waitlist signups — last 14 days">
        <div className="flex items-end gap-1.5" style={{ height: 96 }}>
          {stats.signupsByDay.map((d) => (
            <div
              key={d.date}
              className="flex flex-1 flex-col items-center justify-end"
              title={`${d.date}: ${d.count}`}
            >
              <div
                className="w-full bg-ink"
                style={{
                  height: `${Math.max(2, (d.count / maxDay) * 80)}px`,
                }}
              />
              <span className="mt-1 text-[9px] text-muted">
                {d.date.slice(8, 10)}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Body profile distributions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Body type distribution">
          <DistList rows={stats.bodyTypeDistribution} empty="No body profiles yet." />
        </Panel>
        <Panel title="Fit preference distribution">
          <DistList
            rows={stats.fitPreferenceDistribution}
            empty="No fit preferences yet."
          />
        </Panel>
      </div>

      <Stat
        label="Body measurements provided"
        value={`${Math.round(stats.onboarding.bodyMeasurementRate * 100)}%`}
        sub="of body profiles include height with consent"
      />

      {/* Feature votes */}
      <Panel title="Feature votes — ranked by popularity">
        <DistList rows={stats.featureVotes} empty="No feature votes yet." />
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan breakdown */}
        <Panel title="Plan preference breakdown">
          <ul className="space-y-3">
            {stats.planBreakdown.map((p) => {
              const pct =
                totalPlanVotes > 0
                  ? Math.round((p.count / totalPlanVotes) * 100)
                  : 0;
              return (
                <li key={p.plan}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-ink">{p.plan}</span>
                    <span className="text-muted">
                      {p.count} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-sm bg-line">
                    <div
                      className="h-1.5 rounded-sm bg-ink"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Billing preference */}
        <Panel title="Billing preference">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Monthly" value={stats.billingBreakdown.monthly} />
            <Stat label="Annual" value={stats.billingBreakdown.annual} />
          </div>
        </Panel>
      </div>

      {/* Survey */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Survey — time deciding">
          <Stat
            label="Average minutes deciding"
            value={
              stats.survey.averageMinutesDeciding != null
                ? stats.survey.averageMinutesDeciding.toFixed(1)
                : "—"
            }
          />
        </Panel>
        <Panel title="Survey — wardrobe size">
          <DistList
            rows={stats.survey.wardrobeSizeDistribution}
            empty="No survey responses yet."
          />
        </Panel>
      </div>

      {/* Recent leads */}
      <Panel title="Recent leads">
        {stats.recentLeads.length === 0 ? (
          <Empty>No leads yet.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {stats.recentLeads.map((lead, i) => (
              <li
                key={`${lead.email}-${i}`}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-ink">{lead.email}</span>
                <span className="flex items-center gap-3 text-muted">
                  {lead.source && (
                    <span className="rounded border border-line px-2 py-0.5 text-xs capitalize">
                      {lead.source}
                    </span>
                  )}
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function DistList({
  rows,
  empty,
}: {
  rows: { label: string; count: number }[];
  empty: string;
}) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex items-center justify-between py-3 text-sm"
        >
          <span className="text-ink">{r.label}</span>
          <span className="font-medium text-ink">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- small presentational helpers ---------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-content px-6 py-16 md:px-10">
        <Link href="/" className="font-heading text-lg">
          Visual Closet Tracker
        </Link>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="card p-6">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 font-heading text-3xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <h2 className="text-lg">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-sm text-muted">{children}</p>;
}

function SetupCard({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card mx-auto max-w-xl p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded border border-line">
        {icon}
      </div>
      <h2 className="mt-5 text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded border border-line bg-[#FAFAFA] p-4 text-xs leading-relaxed text-ink">
      <code>{children}</code>
    </pre>
  );
}
