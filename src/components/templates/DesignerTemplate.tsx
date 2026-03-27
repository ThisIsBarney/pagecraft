import { PageContent } from "@/lib/notion";
import { BlocksRenderer } from "@/components/BlockRenderer";

interface DesignerTemplateProps {
  content: PageContent;
  author?: string;
}

export function DesignerTemplate({ content, author }: DesignerTemplateProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#0b1020_45%,#06080f_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06080f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            {author || "Portfolio"}
          </span>
          <a
            href="/"
            className="text-[11px] uppercase tracking-[0.16em] text-white/45 transition hover:text-white/80"
          >
            PageCraft
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10">
          <div className="text-xs uppercase tracking-[0.16em] text-white/50">Design document</div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-6xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
            High-contrast portfolio style focused on rhythm, whitespace, and presentation clarity.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#0f172a]/65 px-6 py-7 backdrop-blur sm:px-10 sm:py-10">
          <article className="max-w-none">
            {content.blocks && <BlocksRenderer blocks={content.blocks} tone="dark" />}
          </article>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#06080f]/75 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-sm">
          <span>© {new Date().getFullYear()} {author || "Designer"}</span>
          <div className="flex items-center gap-4">
            <span>Portfolio mode</span>
            <span>Built with PageCraft</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
