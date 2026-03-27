import { PageContent } from "@/lib/notion";
import { BlocksRenderer } from "@/components/BlockRenderer";

interface MinimalTemplateProps {
  content: PageContent;
  author?: string;
}

export function MinimalTemplate({ content, author }: MinimalTemplateProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfbf8_0%,#f6f3ee_100%)] text-stone-900">
      <header className="border-b border-black/8 bg-white/70 py-4 backdrop-blur sm:py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            {author || "Portfolio"}
          </span>
          <a
            href="/"
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 transition hover:text-stone-600"
          >
            PageCraft
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        <article className="rounded-[2rem] border border-black/8 bg-white/85 px-6 py-7 shadow-[0_18px_70px_rgba(24,21,18,0.06)] backdrop-blur sm:px-10 sm:py-10">
          <div className="mb-8 border-b border-black/8 pb-7">
            <div className="text-xs uppercase tracking-[0.14em] text-stone-500">Document</div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">
              {content.title}
            </h1>
          </div>
          {content.blocks && <BlocksRenderer blocks={content.blocks} />}
        </article>
      </main>

      <footer className="mt-12 border-t border-black/8 bg-white/70 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-stone-500 sm:px-6 sm:text-sm">
          © {new Date().getFullYear()} {author || "PageCraft User"}
        </div>
      </footer>
    </div>
  );
}
