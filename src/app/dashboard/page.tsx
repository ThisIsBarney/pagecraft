"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          // 未登录，显示登录表单
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, action: "login" }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full mx-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to PageCraft</h1>
          <p className="text-gray-600 mb-6">Sign in to manage your sites</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (optional)
              </label>
              <input
                name="name"
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In / Sign Up
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦾</span>
            <span className="font-bold text-xl">PageCraft</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.subscriptionStatus === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {user.subscriptionStatus === 'active' ? 'Pro' : 'Free'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/create"
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl mb-2">➕</div>
                  <div className="font-medium">Create New Site</div>
                  <div className="text-sm text-gray-500">From Notion page</div>
                </a>
                <a
                  href="/domains"
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="font-medium">Connect Domain</div>
                  <div className="text-sm text-gray-500">Use your own domain</div>
                </a>
              </div>
            </div>

            {/* My Sites */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">My Sites</h2>
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📭</div>
                <p>No sites yet. Create your first site!</p>
                <a
                  href="/create"
                  className="inline-block mt-4 text-blue-600 hover:underline"
                >
                  Create Site →
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold mb-4">Subscription</h3>
              {user.subscriptionStatus === 'active' ? (
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <span>✓</span>
                    <span className="font-medium">Pro Plan Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Unlimited sites, custom domains, and more.
                  </p>
                  <button className="w-full py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <span>⭐</span>
                    <span className="font-medium">Free Plan</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    1 site, subdomain only. Upgrade for more features.
                  </p>
                  <a
                    href="/domains"
                    className="block w-full py-2 bg-blue-600 text-white rounded-lg text-sm text-center hover:bg-blue-700 transition-colors"
                  >
                    Upgrade to Pro
                  </a>
                </div>
              )}
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/examples" className="text-blue-600 hover:underline">
                    Template Gallery
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
