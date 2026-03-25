import { PageContent } from "@/lib/notion";
import { BlocksRenderer } from "@/components/BlockRenderer";

interface CreatorTemplateProps {
  content: PageContent;
  author?: string;
}

export function CreatorTemplate({ content, author }: CreatorTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white text-slate-900">
      <header className="border-b border-amber-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Creator Studio</span>
          <span className="text-xs text-slate-500">{author || "Independent Creator"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-sm sm:p-10">
          <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-rose-200/50 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-500">Featured Story</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">{content.title}</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Publish essays, product notes, and launch updates with a layout crafted for modern creators.
            </p>
          </div>
        </section>

        <article className="prose prose-slate mt-10 max-w-none rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-10">
          {content.blocks && <BlocksRenderer blocks={content.blocks} />}
        </article>
      </main>

      <footer className="border-t border-amber-100 bg-white/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} {author || "Creator"}</span>
          <a href="/" className="font-medium text-rose-500 hover:text-rose-600">
            Powered by PageCraft
          </a>
        </div>
      </footer>
    </div>
  );
}
