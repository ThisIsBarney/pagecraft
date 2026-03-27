import { PageContent } from "@/lib/notion";

interface DatabaseTemplateProps {
  content: PageContent;
  author?: string;
}

export function DatabaseTemplate({ content, author }: DatabaseTemplateProps) {
  const { title, databaseInfo, databaseEntries = [] } = content;
  const tableColumns = Array.from(
    new Set(databaseEntries.flatMap((entry) => Object.keys(entry.properties || {})))
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <header className="bg-white/75 border-b border-gray-200 py-4 sm:py-6 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm uppercase tracking-[0.16em] text-gray-500">{author || "Collection"}</span>
            <a href="/" className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-600 uppercase tracking-[0.14em]">
              PageCraft
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-gray-900 mb-4 leading-tight">{title}</h1>
          {databaseInfo?.description && (
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-8">
              {databaseInfo.description}
            </p>
          )}
          <div className="mt-4 text-xs sm:text-sm uppercase tracking-[0.14em] text-gray-500">
            {databaseEntries.length} items
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Card View</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {databaseEntries.map((entry) => (
              <a
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/95 rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition-shadow flex flex-col"
              >
                {entry.cover ? (
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.cover}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : entry.icon ? (
                  <div className="h-12 bg-gradient-to-br from-blue-50 to-sky-50 flex items-center px-4">
                    <span className="text-sm mr-2 rounded-full border border-blue-200 bg-white px-2 py-0.5 font-medium text-blue-700">{entry.icon}</span>
                  </div>
                ) : null}

                <div className="p-4 sm:p-5 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug break-words">
                    {entry.title}
                  </h3>

                  <div className="space-y-1.5">
                    {Object.entries(entry.properties)
                      .filter(([key, value]) => {
                        if (!value || value === "Untitled") return false;
                        if (key.toLowerCase() === "name") return false;
                        return true;
                      })
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-gray-400 shrink-0 text-xs uppercase tracking-wide">{key}</span>
                          <span className="text-gray-700 break-words">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {databaseEntries.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">Table View</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <th className="border-b border-gray-200 px-4 py-3 font-medium sm:px-6">Title</th>
                    {tableColumns.map((column) => (
                      <th key={column} className="border-b border-gray-200 px-4 py-3 font-medium sm:px-6">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {databaseEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 align-top last:border-b-0">
                      <td className="px-4 py-3 font-medium text-gray-900 sm:px-6 break-words">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline"
                        >
                          {entry.title}
                        </a>
                      </td>
                      {tableColumns.map((column) => (
                        <td key={`${entry.id}-${column}`} className="px-4 py-3 text-gray-700 sm:px-6 break-words">
                          {entry.properties[column] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {databaseEntries.length === 0 && (
          <div className="text-center py-14 sm:py-20">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-gray-300 bg-gray-100" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600">
              This database is empty. Add some entries in Notion to see them here.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white/85 border-t border-gray-200 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-400">
          © {new Date().getFullYear()} {author || "PageCraft User"}
        </div>
      </footer>
    </div>
  );
}
