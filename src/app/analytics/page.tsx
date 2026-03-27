"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  dailyViews: Record<string, number>;
  topReferrers: [string, number][];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    fetch(`/api/analytics?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-[1.5rem] px-8 py-7 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="text-sm soft-text">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-[1.5rem] px-8 py-7 text-center">
          <p className="text-sm soft-text">Failed to load analytics.</p>
        </div>
      </div>
    );
  }

  const dates = Object.keys(stats.dailyViews).sort();
  const maxViews = Math.max(...Object.values(stats.dailyViews), 1);

  return (
    <div className="page-shell min-h-screen">
      <header className="border-b border-black/8 bg-white/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <a href="/dashboard" className="flex items-center gap-3 text-stone-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              PC
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">PageCraft</span>
              <span className="block text-sm soft-text">Analytics</span>
            </span>
          </a>
          <a href="/dashboard" className="text-sm text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline">
            Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "7d", label: "Last 7 days" },
            { id: "30d", label: "Last 30 days" },
            { id: "all", label: "All time" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                period === p.id
                  ? "bg-stone-950 text-white"
                  : "border border-black/12 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-panel-strong rounded-[1.5rem] p-6">
            <div className="text-sm soft-text">Total views</div>
            <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-stone-950">{stats.totalViews.toLocaleString()}</div>
          </div>
          <div className="glass-panel-strong rounded-[1.5rem] p-6">
            <div className="text-sm soft-text">Unique visitors</div>
            <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-stone-950">{stats.uniqueVisitors.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel-strong rounded-[1.5rem] p-6">
            <h2 className="text-lg font-semibold text-stone-950">Daily views</h2>
            {dates.length > 0 ? (
              <div className="mt-5 space-y-3">
                {dates.map((date) => {
                  const views = stats.dailyViews[date];
                  const percentage = (views / maxViews) * 100;
                  return (
                    <div key={date} className="flex items-center gap-4">
                      <div className="w-24 text-xs text-stone-500">{date}</div>
                      <div className="h-7 flex-1 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-stone-900 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-stone-900">{views}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm soft-text">No data yet</p>
            )}
          </section>

          <section className="glass-panel-strong rounded-[1.5rem] p-6">
            <h2 className="text-lg font-semibold text-stone-950">Top referrers</h2>
            {stats.topReferrers.length > 0 ? (
              <div className="mt-4 space-y-2">
                {stats.topReferrers.map(([referrer, count]) => (
                  <div key={referrer} className="flex items-center justify-between rounded-xl border border-black/8 bg-white/70 px-3 py-2">
                    <span className="max-w-[70%] truncate text-sm text-stone-700">{referrer}</span>
                    <span className="text-sm font-medium text-stone-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm soft-text">No referrer data</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
