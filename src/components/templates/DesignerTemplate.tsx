import { PageContent } from "@/lib/notion";
import { BlocksRenderer } from "@/components/BlockRenderer";

interface DesignerTemplateProps {
  content: PageContent;
  author?: string;
}

export function DesignerTemplate({ content, author }: DesignerTemplateProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-medium tracking-wider uppercase text-white/60">
            {author || "Portfolio"}
          </span>
          <a 
            href="/" 
            className="text-xs text-white/40 hover:text-white/80 transition-colors tracking-wider uppercase"
          >
            PageCraft
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium">
              {content.title}
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-8 bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
            Creative
            <br />
            Designer
          </h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            Crafting digital experiences that blend aesthetics with functionality.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pb-32">
        <article className="prose prose-invert prose-lg max-w-none">
          {content.blocks && <BlocksRenderer blocks={content.blocks} />}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-sm text-white/40">
            © {new Date().getFullYear()} {author || "Designer"}
          </span>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors text-sm">Twitter</a>
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors text-sm">Dribbble</a>
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors text-sm">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
