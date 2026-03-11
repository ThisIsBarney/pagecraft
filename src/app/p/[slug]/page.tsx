import { getPublicPageContent } from "@/lib/notion";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { DatabaseTemplate } from "@/components/templates/DatabaseTemplate";

interface PageProps {
  params: {
    slug: string;
  };
}

// 从 slug 提取 pageId
function extractPageId(slug: string): string {
  const parts = slug.split("-");
  const potentialId = parts[0];
  if (potentialId.length === 32) {
    return potentialId;
  }
  return slug.replace(/-/g, "");
}

export default async function PublicPage({ params }: PageProps) {
  const pageId = extractPageId(params.slug);

  try {
    const content = await getPublicPageContent(pageId);

    // 根据类型选择模板
    if (content.type === "database") {
      return <DatabaseTemplate content={content} />;
    }

    return <MinimalTemplate content={content} />;
  } catch (error) {
    let errorMessage = "This page may have been removed or is not public.";
    let errorTitle = "Page not found";
    let debugInfo = "";

    if (error instanceof Error) {
      debugInfo = error.message;
      
      if (error.message.includes("NOTION_TOKEN")) {
        errorTitle = "Configuration Error";
        errorMessage = "Server configuration issue. Please contact the administrator.";
      } else if (error.message.includes("Could not find")) {
        errorTitle = "Page Not Found";
        errorMessage = "The Notion page or database could not be found.";
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{errorTitle}</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          
          {/* 调试信息 */}
          {debugInfo && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-xs text-gray-500 mb-2">Debug info:</p>
              <p className="text-sm text-gray-700 font-mono break-all">{debugInfo}</p>
            </div>
          )}
          
          <div className="mb-6 text-sm text-gray-500">
            <p className="mb-2">Troubleshooting:</p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Page ID: {pageId}</li>
              <li>Make sure the page/database is shared with PageCraft integration</li>
              <li>Check that the integration has permission to access this content</li>
            </ul>
          </div>
          
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
