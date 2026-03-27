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
  const [user, setUser] = useState<User | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newTemplate, setNewTemplate] = useState("minimal");
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.user) {
          setUser(data.user);

          if (data.user.subscriptionStatus !== "active") {
            router.push("/domains");
            return;
          }

          const domainsRes = await fetch(`/api/user-domains?email=${encodeURIComponent(data.user.email)}`);
          if (domainsRes.ok) {
            const domainsData = await domainsRes.json();
            setDomains(domainsData.domains || []);
          }
        } else {
          router.push("/dashboard");
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push("/dashboard");
      });
  }, [router]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    if (!user?.email) {
      alert("Unable to resolve your account email. Please sign in again.");
      setAdding(false);
      return;
    }

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: newDomain,
          pageId: newPageId,
          template: newTemplate,
          userEmail: user.email,
        }),
      });

      if (res.ok) {
        setDomains([
          ...domains,
          {
            domain: newDomain,
            pageId: newPageId,
            template: newTemplate,
            url: `https://${newDomain}`,
            verified: true,
          },
        ]);
        setNewDomain("");
        setNewPageId("");
        alert("Domain added. Please configure DNS.");
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
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-[1.5rem] px-8 py-7 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="text-sm soft-text">Loading domains...</p>
        </div>
      </div>
    );
  }

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
              <span className="block text-sm soft-text">Manage domains</span>
            </span>
          </a>
          <a href="/dashboard" className="text-sm text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline">
            Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-6">
          <section className="glass-panel-strong rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">Add new domain</h2>
            <form onSubmit={handleAddDomain} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Domain</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Notion page ID</label>
                  <input
                    type="text"
                    value={newPageId}
                    onChange={(e) => setNewPageId(e.target.value)}
                    placeholder="1a2b3c4d..."
                    className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 font-mono text-sm text-stone-900 outline-none transition focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Template</label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="designer">Designer</option>
                    <option value="developer">Developer</option>
                    <option value="creator">Creator</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={adding}
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add domain"}
              </button>
            </form>
          </section>

          <section className="glass-panel-strong rounded-[1.75rem] p-6">
            <h3 className="text-base font-semibold text-stone-950">DNS configuration</h3>
            <p className="mt-2 text-sm soft-text">Configure the following record for each connected domain:</p>
            <div className="mt-3 rounded-xl border border-black/8 bg-white/80 p-4 font-mono text-sm text-stone-700">
              <div>Type: CNAME</div>
              <div>Name: @</div>
              <div>Value: pagecraft-eight.vercel.app</div>
            </div>
          </section>

          <section className="glass-panel-strong rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">Your domains</h2>
            {domains.length > 0 ? (
              <div className="mt-4 space-y-3">
                {domains.map((domain) => (
                  <div key={domain.domain} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/85 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-950">{domain.domain}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            domain.verified
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {domain.verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm soft-text">
                        Template: {domain.template} | Page: {domain.pageId.slice(0, 8)}...
                      </div>
                    </div>
                    <a
                      href={domain.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
                    >
                      Open site
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white/70 px-5 py-10 text-center">
                <p className="text-sm soft-text">No domains yet. Add your first domain above.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
