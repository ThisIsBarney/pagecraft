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
  const [savedPagesError, setSavedPagesError] = useState("");
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null);
  const [templateDrafts, setTemplateDrafts] = useState<Record<string, string>>({});
  const [slugDrafts, setSlugDrafts] = useState<Record<string, string>>({});
  const [navOrderDrafts, setNavOrderDrafts] = useState<Record<string, string>>({});
  const [hiddenFromNavDrafts, setHiddenFromNavDrafts] = useState<Record<string, boolean>>({});
  const [homeDraftPageId, setHomeDraftPageId] = useState<string | null>(null);
  const [savingTemplatePageId, setSavingTemplatePageId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fetchSavedPages = async () => {
    setSavedPagesError("");

    try {
      const pagesRes = await fetch("/api/user-pages");
      if (!pagesRes.ok) {
        setSavedPagesError("Unable to load saved pages right now.");
        return;
      }

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
    } catch (err) {
      console.error("Failed to fetch saved pages:", err);
      setSavedPagesError("Unable to load saved pages right now.");
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
    setAuthError("");
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement | null)?.value || "";

    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    if (authMode === "register" && password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setAuthSubmitting(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: authMode,
          email,
          password,
          name: authMode === "register" ? name : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.error || "Authentication failed.");
        return;
      }

      setUser(data.user);
      window.location.reload();
    } finally {
      setAuthSubmitting(false);
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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch("/api/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPasswordError(payload?.error || "Failed to update password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage("Password updated.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-[1.5rem] px-8 py-7 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="text-sm soft-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel-strong w-full max-w-md rounded-[1.75rem] p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-stone-950">
            {authMode === "login" ? "Sign in to PageCraft" : "Create your PageCraft account"}
          </h1>
          <p className="mt-2 text-sm soft-text">Manage pages, domains, and publishing settings.</p>

          {authError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                placeholder="you@example.com"
              />
            </div>
            {authMode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Name (optional)</label>
                <input
                  name="name"
                  type="text"
                  className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
              <input
                name="password"
                type="password"
                minLength={8}
                required
                className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                placeholder="At least 8 characters"
              />
            </div>
            {authMode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Confirm password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  placeholder="Re-enter password"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {authSubmitting
                ? authMode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : authMode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-5 border-t border-black/8 pt-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode((current) => (current === "login" ? "register" : "login"));
                setAuthError("");
              }}
              className="text-sm font-medium text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline"
            >
              {authMode === "login" ? "No account yet? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
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
    <div className="page-shell min-h-screen">
      <header className="border-b border-black/8 bg-white/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <a href="/" className="flex items-center gap-3 text-stone-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              PC
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">PageCraft</span>
              <span className="block text-sm soft-text">Dashboard</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-600 sm:inline">{user.email}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isPro ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-stone-300 bg-white text-stone-700"
              }`}
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <section className="glass-panel-strong rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">Quick actions</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <a
                  href="/create"
                  className="rounded-2xl border border-black/8 bg-white/80 p-5 transition hover:border-stone-400 hover:bg-white"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Create</div>
                  <div className="mt-2 font-medium text-stone-950">Create new site</div>
                  <div className="mt-1 text-sm soft-text">Publish from a Notion page.</div>
                </a>
                <a
                  href={isPro ? "/manage-domains" : "/domains"}
                  className="rounded-2xl border border-black/8 bg-white/80 p-5 transition hover:border-stone-400 hover:bg-white"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Domain</div>
                  <div className="mt-2 font-medium text-stone-950">{isPro ? "Manage domains" : "Upgrade for domains"}</div>
                  <div className="mt-1 text-sm soft-text">{isPro ? "Add and edit custom domains." : "Use your own domain name."}</div>
                </a>
              </div>
            </section>

            <section className="glass-panel-strong rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">My sites</h2>
              {sites.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {sites.map((site) => (
                    <div key={site.domain} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/85 p-4">
                      <div>
                        <div className="font-medium text-stone-950">{site.domain}</div>
                        <div className="mt-1 text-sm soft-text">Template: {site.template}</div>
                      </div>
                      <a
                        href={site.url}
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
                  <p className="text-sm soft-text">No sites yet. Start with your first page.</p>
                  <a href="/create" className="mt-4 inline-block text-sm font-medium text-stone-900 underline">
                    Create a site
                  </a>
                </div>
              )}
            </section>

            <section className="glass-panel-strong rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">My pages</h2>
              {savedPagesError ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-medium">{savedPagesError}</p>
                  <p className="mt-1 text-amber-800">Please try again in a moment.</p>
                  <button
                    type="button"
                    onClick={fetchSavedPages}
                    className="mt-3 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
                  >
                    Retry
                  </button>
                </div>
              ) : savedPages.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {orderedSavedPages.map((savedPage) => {
                    const pageSlug = slugDrafts[savedPage.id] || savedPage.slug || savedPage.notionPageId;
                    const currentTemplate = templateDrafts[savedPage.id] || savedPage.template || "minimal";
                    const previewUrl = `/p/${pageSlug}?template=${currentTemplate}`;
                    const notionUrl = `https://www.notion.so/${savedPage.notionPageId}`;

                    return (
                      <div
                        key={savedPage.id}
                        className="rounded-2xl border border-black/8 bg-white/85 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-stone-950">{savedPage.title || "Untitled"}</div>
                            <div className="mt-1 text-sm soft-text">Template: {savedPage.template || "minimal"}</div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <input
                                aria-label={`Slug for ${savedPage.title || "Untitled"}`}
                                value={slugDrafts[savedPage.id] || savedPage.slug || savedPage.notionPageId}
                                onChange={(event) =>
                                  setSlugDrafts((current) => ({
                                    ...current,
                                    [savedPage.id]: event.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-700 sm:w-56"
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
                                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-700"
                              >
                                <option value="minimal">Minimal</option>
                                <option value="designer">Designer</option>
                                <option value="developer">Developer</option>
                                <option value="creator">Creator</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => savePageTemplate(savedPage)}
                                className="rounded-full border border-black/12 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
                                disabled={savingTemplatePageId === savedPage.id}
                              >
                                {savingTemplatePageId === savedPage.id ? "Saving..." : "Save"}
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-600">
                              <label className="flex items-center gap-2">
                                <span>Order</span>
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
                                  className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-stone-700"
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
                                <span>Hide from nav</span>
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

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => copyPublishUrl(savedPage.id, pageSlug, currentTemplate)}
                              className="rounded-full border border-black/12 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
                            >
                              {copiedPageId === savedPage.id ? "Copied" : "Copy URL"}
                            </button>
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-stone-950 px-4 py-2 text-sm text-white transition hover:bg-black"
                            >
                              Preview
                            </a>
                            <a
                              href={notionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full border border-black/12 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
                            >
                              Edit in Notion
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm soft-text">No saved pages yet. Publish from Create to manage them here.</p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass-panel-strong rounded-[1.75rem] p-6">
              <h3 className="text-base font-semibold text-stone-950">Subscription</h3>
              {isPro ? (
                <div className="mt-3">
                  <div className="text-sm font-medium text-emerald-700">Pro plan active</div>
                  <p className="mt-2 text-sm soft-text">Unlimited sites, custom domains, and priority support.</p>
                  <button className="mt-4 w-full rounded-full border border-black/12 bg-white py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                    Manage subscription
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="text-sm font-medium text-stone-800">Free plan</div>
                  <p className="mt-2 text-sm soft-text">One site and subdomain. Upgrade to unlock custom domains.</p>
                  <a
                    href="/domains"
                    className="mt-4 block w-full rounded-full bg-stone-950 py-2 text-center text-sm font-medium text-white transition hover:bg-stone-800"
                  >
                    Upgrade to Pro
                  </a>
                </div>
              )}
            </section>

            <section className="glass-panel-strong rounded-[1.75rem] p-6">
              <h3 className="text-base font-semibold text-stone-950">Resources</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="/examples" className="text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline">
                    Template gallery
                  </a>
                </li>
                <li>
                  <a href="#" className="text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline">
                    Support
                  </a>
                </li>
              </ul>
            </section>

            <section className="glass-panel-strong rounded-[1.75rem] p-6">
              <h3 className="text-base font-semibold text-stone-950">Security</h3>
              <p className="mt-2 text-xs soft-text">Update your account password.</p>
              {passwordError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {passwordError}
                </div>
              )}
              {passwordMessage && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {passwordMessage}
                </div>
              )}
              <form onSubmit={handlePasswordUpdate} className="mt-3 space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Current password"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-900"
                  required
                  minLength={8}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-900"
                  required
                  minLength={8}
                />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-900"
                  required
                  minLength={8}
                />
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full rounded-full border border-black/12 bg-white py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {passwordSaving ? "Updating..." : "Update password"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
