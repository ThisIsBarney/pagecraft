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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  // 准备图表数据
  const dates = Object.keys(stats.dailyViews).sort();
  const maxViews = Math.max(...Object.values(stats.dailyViews), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦾</span>
            <span className="font-bold text-xl">Analytics</span>
          </div>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "7d", label: "Last 7 days" },
            { id: "30d", label: "Last 30 days" },
            { id: "all", label: "All time" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-sm text-gray-500 mb-1">Total Views</div>
            <div className="text-4xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-sm text-gray-500 mb-1">Unique Visitors</div>
            <div className="text-4xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
          </div>
        </div>

        {/* Daily Views Chart */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Daily Views</h2>
          {dates.length > 0 ? (
            <div className="space-y-3">
              {dates.map((date) => {
                const views = stats.dailyViews[date];
                const percentage = (views / maxViews) * 100;
                return (
                  <div key={date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">{date}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right font-medium">{views}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data yet</p>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6">Top Referrers</h2>
          {stats.topReferrers.length > 0 ? (
            <div className="space-y-3">
              {stats.topReferrers.map(([referrer, count]) => (
                <div key={referrer} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700 truncate max-w-md">{referrer}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No referrer data</p>
          )}
        </div>
      </main>
    </div>
  );
}
