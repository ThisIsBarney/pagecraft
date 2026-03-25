"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus: string;
}

interface Site {
  domain: string;
  pageId: string;
  template: string;
  url: string;
}

interface PageStructureSettings {
  navOrder?: number;
  hideFromNavigation?: boolean;
  isHome?: boolean;
}

interface SavedPage {
  id: string;
  title: string;
  slug: string;
  template: string;
  notionPageId: string;
  settings?: PageStructureSettings;
}

export default function DashboardPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null);
  const [templateDrafts, setTemplateDrafts] = useState<Record<string, string>>({});
  const [slugDrafts, setSlugDrafts] = useState<Record<string, string>>({});
  const [navOrderDrafts, setNavOrderDrafts] = useState<Record<string, string>>({});
  const [hiddenFromNavDrafts, setHiddenFromNavDrafts] = useState<Record<string, boolean>>({});
  const [homeDraftPageId, setHomeDraftPageId] = useState<string | null>(null);
  const [savingTemplatePageId, setSavingTemplatePageId] = useState<string | null>(null);

  const fetchSavedPages = async () => {
    try {
      const pagesRes = await fetch("/api/user-pages");
      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        const pages = pagesData.pages || [];
        setSavedPages(pages);
        setTemplateDrafts((current) => {
          const nextDrafts = { ...current };
          for (const page of pages as SavedPage[]) {
            if (!nextDrafts[page.id]) {
              nextDrafts[page.id] = page.template || "minimal";
            }
          }
          return nextDrafts;
        });
        setSlugDrafts((current) => {
          const nextDrafts = { ...current };
          for (const page of pages as SavedPage[]) {
            if (!nextDrafts[page.id]) {
              nextDrafts[page.id] = page.slug || page.notionPageId;
            }
          }
          return nextDrafts;
        });
        setNavOrderDrafts((current) => {
          const nextDrafts = { ...current };
          for (const page of pages as SavedPage[]) {
            if (nextDrafts[page.id] === undefined) {
              const navOrder = page.settings?.navOrder;
              nextDrafts[page.id] = typeof navOrder === "number" ? String(navOrder) : "0";
            }
          }
          return nextDrafts;
        });
        setHiddenFromNavDrafts((current) => {
          const nextDrafts = { ...current };
          for (const page of pages as SavedPage[]) {
            if (nextDrafts[page.id] === undefined) {
              nextDrafts[page.id] = Boolean(page.settings?.hideFromNavigation);
            }
          }
          return nextDrafts;
        });
        setHomeDraftPageId((current) => {
          if (current && (pages as SavedPage[]).some((page) => page.id === current)) {
            return current;
          }

          const homePage = (pages as SavedPage[]).find((page) => page.settings?.isHome);
          return homePage?.id || null;
        });
      }
    } catch (err) {
      console.error("Failed to fetch saved pages:", err);
    }
  };

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.user) {
          setUser(data.user);

          try {
            const domainsRes = await fetch(`/api/user-domains?email=${encodeURIComponent(data.user.email)}`);
            if (domainsRes.ok) {
              const domainsData = await domainsRes.json();
              setSites(domainsData.domains || []);
            }
          } catch (err) {
            console.error("Failed to fetch domains:", err);
          }

          await fetchSavedPages();
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
      body: JSON.stringify({ email, name }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);

      // 刷新页面获取域名
      window.location.reload();
    }
  };

  const copyPublishUrl = async (pageId: string, slug: string, template: string) => {
    const pageSlug = slug || pageId;
    const publishUrl = `${window.location.origin}/p/${pageSlug}?template=${template || "minimal"}`;

    try {
      await navigator.clipboard.writeText(publishUrl);
      setCopiedPageId(pageId);
      setTimeout(() => setCopiedPageId((current) => (current === pageId ? null : current)), 2000);
    } catch (error) {
      console.error("Failed to copy publish URL:", error);
    }
  };

  const savePageTemplate = async (savedPage: SavedPage) => {
    const selectedTemplate = templateDrafts[savedPage.id] || savedPage.template || "minimal";
    const selectedSlug = slugDrafts[savedPage.id] || savedPage.slug || savedPage.notionPageId;
    const navOrderValue = Number.parseInt(navOrderDrafts[savedPage.id] || "", 10);
    const navOrder = Number.isFinite(navOrderValue) ? Math.max(0, navOrderValue) : undefined;

    const settings: PageStructureSettings = {
      hideFromNavigation: Boolean(hiddenFromNavDrafts[savedPage.id]),
      isHome: homeDraftPageId === savedPage.id,
    };

    if (typeof navOrder === "number") {
      settings.navOrder = navOrder;
    }

    setSavingTemplatePageId(savedPage.id);

    try {
      const response = await fetch("/api/user-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notionPageId: savedPage.notionPageId,
          title: savedPage.title,
          slug: selectedSlug,
          template: selectedTemplate,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update page template");
      }

      await fetchSavedPages();
    } catch (error) {
      console.error("Failed to save page template:", error);
    } finally {
      setSavingTemplatePageId((current) => (current === savedPage.id ? null : current));
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

  const isPro = user.subscriptionStatus === "active";
  const orderedSavedPages = [...savedPages].sort((a, b) => {
    const left = Number.parseInt(navOrderDrafts[a.id] || "", 10);
    const right = Number.parseInt(navOrderDrafts[b.id] || "", 10);
    const leftOrder = Number.isFinite(left) ? left : Number.MAX_SAFE_INTEGER;
    const rightOrder = Number.isFinite(right) ? right : Number.MAX_SAFE_INTEGER;

    if (leftOrder === rightOrder) {
      return (a.title || "").localeCompare(b.title || "");
    }

    return leftOrder - rightOrder;
  });

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
              isPro
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {isPro ? "Pro" : "Free"}
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
                  href={isPro ? "/manage-domains" : "/domains"}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="font-medium">{isPro ? "Manage Domains" : "Connect Domain"}</div>
                  <div className="text-sm text-gray-500">{isPro ? "Add or edit your domains" : "Use your own domain"}</div>
                </a>
              </div>
            </div>

            {/* My Sites */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">My Sites</h2>
              {sites.length > 0 ? (
                <div className="space-y-4">
                  {sites.map((site) => (
                    <div key={site.domain} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <div className="font-medium">{site.domain}</div>
                        <div className="text-sm text-gray-500">Template: {site.template}</div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={site.url}
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
                  <div className="text-4xl mb-4">📭</div>
                  <p>No sites yet. Create your first site!</p>
                  <a
                    href="/create"
                    className="inline-block mt-4 text-blue-600 hover:underline"
                  >
                    Create Site →
                  </a>
                </div>
              )}
            </div>

            {/* My Pages */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">My Pages</h2>
              {savedPages.length > 0 ? (
                <div className="space-y-4">
                  {orderedSavedPages.map((savedPage) => {
                    const pageSlug = slugDrafts[savedPage.id] || savedPage.slug || savedPage.notionPageId;
                    const currentTemplate =
                      templateDrafts[savedPage.id] || savedPage.template || "minimal";
                    const previewUrl = `/p/${pageSlug}?template=${currentTemplate}`;
                    const notionUrl = `https://www.notion.so/${savedPage.notionPageId}`;

                    return (
                      <div
                        key={savedPage.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4"
                      >
                        <div>
                          <div className="font-medium">{savedPage.title || "Untitled"}</div>
                          <div className="text-sm text-gray-500">Template: {savedPage.template || "minimal"}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              aria-label={`Slug for ${savedPage.title || "Untitled"}`}
                              value={slugDrafts[savedPage.id] || savedPage.slug || savedPage.notionPageId}
                              onChange={(event) =>
                                setSlugDrafts((current) => ({
                                  ...current,
                                  [savedPage.id]: event.target.value,
                                }))
                              }
                              className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
                            />
                            <select
                              aria-label={`Template for ${savedPage.title || "Untitled"}`}
                              value={templateDrafts[savedPage.id] || savedPage.template || "minimal"}
                              onChange={(event) =>
                                setTemplateDrafts((current) => ({
                                  ...current,
                                  [savedPage.id]: event.target.value,
                                }))
                              }
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
                            >
                              <option value="minimal">Minimal</option>
                              <option value="designer">Designer</option>
                              <option value="developer">Developer</option>
                              <option value="creator">Creator</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => savePageTemplate(savedPage)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              disabled={savingTemplatePageId === savedPage.id}
                            >
                              {savingTemplatePageId === savedPage.id ? "Saving..." : "Save changes"}
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <label className="flex items-center gap-2">
                              <span>Nav order</span>
                              <input
                                type="number"
                                min={0}
                                aria-label={`Navigation order for ${savedPage.title || "Untitled"}`}
                                value={navOrderDrafts[savedPage.id] ?? "0"}
                                onChange={(event) =>
                                  setNavOrderDrafts((current) => ({
                                    ...current,
                                    [savedPage.id]: event.target.value,
                                  }))
                                }
                                className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
                              />
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                aria-label={`Hide ${savedPage.title || "Untitled"} from navigation`}
                                checked={Boolean(hiddenFromNavDrafts[savedPage.id])}
                                onChange={(event) =>
                                  setHiddenFromNavDrafts((current) => ({
                                    ...current,
                                    [savedPage.id]: event.target.checked,
                                  }))
                                }
                              />
                              <span>Hide from navigation</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="home-page-selection"
                                aria-label={`Set ${savedPage.title || "Untitled"} as home page`}
                                checked={homeDraftPageId === savedPage.id}
                                onChange={() => setHomeDraftPageId(savedPage.id)}
                              />
                              <span>Home page</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => copyPublishUrl(savedPage.id, pageSlug, currentTemplate)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            {copiedPageId === savedPage.id ? "Copied" : "Copy URL"}
                          </button>
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black"
                          >
                            Preview
                          </a>
                          <a
                            href={notionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
                          >
                            Edit in Notion
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No saved pages yet. Publish from Create to manage them here.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold mb-4">Subscription</h3>
              {isPro ? (
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
