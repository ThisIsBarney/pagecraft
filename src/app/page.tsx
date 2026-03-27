import type { Metadata } from "next";
import Link from "next/link";
import { siteMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Turn Notion Into Beautiful Websites | PageCraft",
  description:
    "Publish a polished site from Notion in minutes with templates, custom domains, analytics, and zero-code setup.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...siteMetadata.openGraph,
    title: "Turn Notion Into Beautiful Websites | PageCraft",
    description:
      "Publish a polished site from Notion in minutes with templates, custom domains, analytics, and zero-code setup.",
    url: "/",
  },
  twitter: {
    ...siteMetadata.twitter,
    title: "Turn Notion Into Beautiful Websites | PageCraft",
    description:
      "Publish a polished site from Notion in minutes with templates, custom domains, analytics, and zero-code setup.",
  },
};

const metrics = [
  { value: "3 min", label: "From Notion link to live site" },
  { value: "4", label: "Design directions ready to ship" },
  { value: "0 code", label: "Required to publish your first page" },
];

const features = [
  {
    title: "Visual restraint, not dashboard noise",
    body: "The setup is reduced to the few decisions that matter: content, mood, publish URL, and domain.",
  },
  {
    title: "Templates that change tone, not your workflow",
    body: "Editorial, designer, developer, and creator layouts all reuse the same Notion source.",
  },
  {
    title: "A calmer launch path",
    body: "Validation, publishing, analytics, and domains stay in one consistent interface instead of four mismatched screens.",
  },
];

const steps = [
  {
    index: "01",
    title: "Paste a Notion page or share URL",
    body: "PageCraft extracts the identifier, checks access, and prepares a clean publish path.",
  },
  {
    index: "02",
    title: "Choose the right visual direction",
    body: "Switch the presentation without rewriting your content or learning another CMS.",
  },
  {
    index: "03",
    title: "Publish, then refine over time",
    body: "Your page lives on a stable URL and stays easy to update from Notion.",
  },
];

const templateCards = [
  {
    name: "Minimal",
    mood: "Quiet editorial",
    previewClass: "bg-[linear-gradient(180deg,#fffdf9_0%,#eee6dc_100%)] text-stone-900",
  },
  {
    name: "Designer",
    mood: "Confident portfolio",
    previewClass:
      "bg-[radial-gradient(circle_at_top_left,#f7cabf_0%,#de8f7a_36%,#1a1817_100%)] text-white",
  },
  {
    name: "Developer",
    mood: "Structured technical",
    previewClass:
      "bg-[linear-gradient(135deg,#111827_0%,#172033_52%,#314056_100%)] text-slate-100",
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(217,119,87,0.18),transparent_65%)] blur-3xl" />
        <div className="absolute right-[10%] top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(120,154,190,0.16),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.46),transparent_64%)] blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(24,21,18,0.18)]">
            PC
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              PageCraft
            </div>
            <div className="text-sm soft-text">Notion publishing system</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
          <Link href="/examples" className="transition hover:text-stone-950">
            Templates
          </Link>
          <Link href="/dashboard" className="transition hover:text-stone-950">
            Dashboard
          </Link>
          <Link
            href="/create"
            className="rounded-full border border-stone-900/10 bg-white/80 px-4 py-2 text-stone-950 transition hover:border-stone-900/30"
          >
            Start Building
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="eyebrow">Modern minimal publishing</div>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.07em] text-stone-950 sm:text-6xl lg:text-7xl">
              Turn a raw Notion page into a site that feels designed.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 soft-text sm:text-xl">
              PageCraft keeps the workflow simple while giving your content better rhythm,
              cleaner hierarchy, and a calmer interface from first paste to publish.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-7 py-4 text-sm font-medium text-white shadow-[0_24px_60px_rgba(24,21,18,0.2)] transition hover:-translate-y-0.5 hover:bg-stone-800"
              >
                Create Your Site
              </Link>
              <Link
                href="/examples"
                className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white/85 px-7 py-4 text-sm font-medium text-stone-900 transition hover:border-stone-900/25"
              >
                View Template Gallery
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="glass-panel rounded-[1.75rem] p-5">
                  <div className="text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 soft-text">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel-strong overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                    Live System Preview
                  </div>
                  <div className="mt-1 text-sm soft-text">marshall.pagecraft.site</div>
                </div>
                <div className="rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Ready to publish
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="rounded-[1.75rem] bg-stone-950 p-6 text-white">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    Creator homepage
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
                    Marshall Wu
                  </div>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-stone-300">
                    Building opinionated small products with clean interfaces, fast iteration,
                    and writing that starts in Notion.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.5rem] border border-black/6 bg-[linear-gradient(180deg,#fffcf7_0%,#f3ece4_100%)] p-5">
                    <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      Recent pages
                    </div>
                    <div className="mt-4 space-y-3">
                      {["PageCraft redesign", "Launch notes", "Personal studio"].map((item) => (
                        <div key={item} className="flex items-center justify-between">
                          <span className="text-sm text-stone-700">{item}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] text-stone-700 shadow-sm">
                            Synced
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-black/6 bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      Weekly traffic
                    </div>
                    <div className="mt-5 flex items-end gap-2">
                      {[28, 45, 36, 58, 52, 74, 69].map((height, index) => (
                        <div key={height} className="flex-1">
                          <div
                            className={`rounded-t-full ${
                              index > 4 ? "bg-stone-950" : "bg-stone-300"
                            }`}
                            style={{ height: `${height}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm soft-text">
                      Analytics stay lightweight and readable.
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/55 px-5 py-4 text-sm soft-text">
                  One source of truth in Notion. Multiple presentation styles in PageCraft.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="glass-panel rounded-[2rem] p-6">
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                System
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 soft-text">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel rounded-[2.25rem] p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="eyebrow">Template system</div>
              <h2 className="mt-5 section-title">Four moods, one content workflow.</h2>
              <p className="mt-4 max-w-md text-base leading-7 soft-text">
                The visual system should support the content, not bury it. Each template keeps
                the same structure while changing typography, tone, and pacing.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {templateCards.map((card) => (
                <div key={card.name} className="rounded-[1.75rem] border border-black/6 bg-white/70 p-4">
                  <div className={`h-48 rounded-[1.35rem] ${card.previewClass} p-5`}>
                    <div className="text-xs uppercase tracking-[0.16em] opacity-70">{card.mood}</div>
                    <div className="mt-20 text-2xl font-semibold tracking-[-0.05em]">
                      {card.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.index} className="glass-panel rounded-[2rem] p-6">
              <div className="text-sm font-medium tracking-[0.18em] text-stone-400">
                {step.index}
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 soft-text">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel-strong rounded-[2.5rem] p-8 text-center lg:p-12">
          <div className="mx-auto max-w-2xl">
            <div className="eyebrow">Ready to iterate</div>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.06em] text-stone-950 sm:text-5xl">
              Build the first version now. Refine the style later.
            </h2>
            <p className="mt-4 text-base leading-7 soft-text">
              Start with one Notion page, publish a cleaner version of it, and keep improving
              from a UI that already feels considered.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-7 py-4 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Launch a Site
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white/85 px-7 py-4 text-sm font-medium text-stone-900 transition hover:border-stone-900/30"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
