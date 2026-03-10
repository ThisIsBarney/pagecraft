import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦾</span>
            <span className="font-bold text-xl">PageCraft</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/examples" className="hover:text-gray-900">Examples</Link>
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn your Notion into a
            <span className="text-blue-600"> beautiful website</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            No coding required. Just connect your Notion page, pick a template, 
            and get a stunning portfolio site in seconds.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/create"
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your Site →
            </Link>
            <Link
              href="/examples"
              className="bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              See Examples
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Instant Setup</h3>
            <p className="text-gray-600">Connect Notion, pick a template, done. No complex configuration.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="font-semibold text-lg mb-2">Beautiful Templates</h3>
            <p className="text-gray-600">Professionally designed templates that make your content shine.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="font-semibold text-lg mb-2">Auto Sync</h3>
            <p className="text-gray-600">Edit in Notion, changes appear on your site automatically.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          © 2024 PageCraft. Made with 🦾 by Marshall & Little Claw.
        </div>
      </footer>
    </div>
  );
}
