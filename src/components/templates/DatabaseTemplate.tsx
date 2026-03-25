import { PageContent } from "@/lib/notion";

interface DatabaseTemplateProps {
  content: PageContent;
  author?: string;
}

export function DatabaseTemplate({ content, author }: DatabaseTemplateProps) {
  const { title, databaseInfo, databaseEntries = [] } = content;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">{author || "Collection"}</span>
            <a href="/" className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-600">
              Made with PageCraft
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{title}</h1>
          {databaseInfo?.description && (
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {databaseInfo.description}
            </p>
          )}
          <div className="mt-4 text-xs sm:text-sm text-gray-500">
            {databaseEntries.length} items
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {databaseEntries.map((entry) => (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Cover Image - 减小高度 */}
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
                // 有图标但没有封面 - 小图标样式
                <div className="h-12 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center px-4">
                  <span className="text-xl mr-2">{entry.icon}</span>
                </div>
              ) : null}

              {/* Content */}
              <div className="p-4 sm:p-5 flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                  {entry.icon && !entry.cover ? (
                    <span className="mr-2">{entry.icon}</span>
                  ) : null}
                  {entry.title}
                </h3>

                {/* Properties */}
                <div className="space-y-1.5">
                  {Object.entries(entry.properties)
                    .filter(([key, value]) => {
                      // 过滤掉空值和标题字段
                      if (!value || value === "Untitled") return false;
                      if (key.toLowerCase() === "name") return false;
                      return true;
                    })
                    .slice(0, 4) // 最多显示4个属性
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span className="text-gray-400 shrink-0 text-xs uppercase tracking-wide">{key}</span>
                        <span className="text-gray-700 truncate">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Empty State */}
        {databaseEntries.length === 0 && (
          <div className="text-center py-14 sm:py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600">
              This database is empty. Add some entries in Notion to see them here.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-400">
          © {new Date().getFullYear()} {author || "PageCraft User"}
        </div>
      </footer>
    </div>
  );
}
