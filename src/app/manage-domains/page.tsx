"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Domain {
  domain: string;
  pageId: string;
  template: string;
  url: string;
  verified: boolean;
}

interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus: string;
}

export default function ManageDomainsPage() {
  const [, setUser] = useState<User | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newTemplate, setNewTemplate] = useState("minimal");
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 获取当前用户
    fetch("/api/auth")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.user) {
          setUser(data.user);
          
          // 检查是否是 Pro 用户
          if (data.user.subscriptionStatus !== 'active') {
            // 不是 Pro 用户，重定向到升级页面
            router.push('/domains');
            return;
          }
          
          // 获取用户的域名
          const domainsRes = await fetch(`/api/user-domains?email=${encodeURIComponent(data.user.email)}`);
          if (domainsRes.ok) {
            const domainsData = await domainsRes.json();
            setDomains(domainsData.domains || []);
          }
        } else {
          // 未登录，重定向到 dashboard
          router.push('/dashboard');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push('/dashboard');
      });
  }, [router]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: newDomain,
          pageId: newPageId,
          template: newTemplate,
        }),
      });

      if (res.ok) {
        setDomains([...domains, {
          domain: newDomain,
          pageId: newPageId,
          template: newTemplate,
          url: `https://${newDomain}`,
          verified: true,
        }]);
        setNewDomain("");
        setNewPageId("");
        alert("Domain added successfully! Please configure your DNS.");
      } else {
        alert("Failed to add domain");
      }
    } catch {
      alert("Network error");
    } finally {
      setAdding(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦾</span>
            <span className="font-bold text-xl">Manage Domains</span>
          </div>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Add New Domain */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Domain</h2>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notion Page ID
                </label>
                <input
                  type="text"
                  value={newPageId}
                  onChange={(e) => setNewPageId(e.target.value)}
                  placeholder="1a2b3c4d..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="minimal">Minimal</option>
                  <option value="designer">Designer</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding..." : "Add Domain"}
            </button>
          </form>
        </div>

        {/* DNS Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">DNS Configuration</h3>
          <p className="text-blue-800 mb-4">
            For each domain you add, configure this CNAME record in your DNS provider:
          </p>
          <div className="bg-white rounded-lg p-4 font-mono text-sm">
            <div>Type: CNAME</div>
            <div>Name: @</div>
            <div>Value: pagecraft-eight.vercel.app</div>
          </div>
        </div>

        {/* Domain List */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Your Domains</h2>
          {domains.length > 0 ? (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div key={domain.domain} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <div className="font-medium text-lg">{domain.domain}</div>
                    <div className="text-sm text-gray-500">
                      Template: {domain.template} | Page: {domain.pageId.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={domain.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Visit →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🌐</div>
              <p>No domains yet. Add your first domain above!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
