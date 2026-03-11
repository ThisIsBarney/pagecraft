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
            <Link href="/domains" className="hover:text-gray-900">Domains</Link>
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

        {/* Templates Preview */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Style</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/examples" className="group">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="h-48 bg-white border-b flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="font-bold text-2xl mb-2">Minimal</h3>
                    <p className="text-gray-600">Clean & Professional</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600">Perfect for blogs and resumes</p>
                </div>
              </div>
            </Link>
            <Link href="/examples" className="group">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <div className="text-center p-6 text-white">
                    <h3 className="font-bold text-2xl mb-2">Designer</h3>
                    <p className="text-violet-200">Bold & Creative</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600">For portfolios and creative work</p>
                </div>
              </div>
            </Link>
            <Link href="/examples" className="group">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="h-48 bg-[#1e1e1e] flex items-center justify-center">
                  <div className="text-center p-6 text-[#d4d4d4] font-mono">
                    <h3 className="font-bold text-2xl mb-2">Developer</h3>
                    <p className="text-[#858585]">Code Editor Style</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600">Perfect for dev blogs</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="font-bold text-xl mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Get started quickly</p>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">✓ 1 page</li>
                <li className="flex items-center gap-2">✓ Basic templates</li>
                <li className="flex items-center gap-2">✓ Subdomain (pagecraft.io)</li>
                <li className="flex items-center gap-2 text-gray-400">✗ PageCraft branding</li>
              </ul>
              <Link
                href="/create"
                className="block w-full mt-8 py-3 text-center border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl p-8 text-white">
              <h3 className="font-bold text-xl mb-2">Pro</h3>
              <p className="text-blue-100 mb-6">For serious creators</p>
              <div className="text-4xl font-bold mb-6">$6<span className="text-lg font-normal">/mo</span></div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">✓ Unlimited pages</li>
                <li className="flex items-center gap-2">✓ All premium templates</li>
                <li className="flex items-center gap-2">✓ Custom domain</li>
                <li className="flex items-center gap-2">✓ Remove branding</li>
                <li className="flex items-center gap-2">✓ Analytics</li>
              </ul>
              <Link
                href="/domains"
                className="block w-full mt-8 py-3 text-center bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
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
