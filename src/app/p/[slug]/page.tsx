import { getPublicPageContent } from "@/lib/notion";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";

interface PageProps {
  params: {
    slug: string;
  };
}

// 从 slug 提取 pageId（支持带标题的 slug）
function extractPageId(slug: string): string {
  // 格式: pageId 或 pageId-title
  const parts = slug.split("-");
  
  // 检查第一部分是否是 32 字符的 pageId
  const potentialId = parts[0];
  if (potentialId.length === 32) {
    return potentialId;
  }
  
  // 否则整个 slug 可能是 pageId（带连字符的）
  return slug.replace(/-/g, "");
}

export default async function PublicPage({ params }: PageProps) {
  const pageId = extractPageId(params.slug);

  try {
    const content = await getPublicPageContent(pageId);

    return <MinimalTemplate content={content} />;
  } catch (error) {
    // 区分不同类型的错误
    let errorMessage = "This page may have been removed or is not public.";
    let errorTitle = "Page not found";

    if (error instanceof Error) {
      if (error.message.includes("NOTION_TOKEN")) {
        errorTitle = "Configuration Error";
        errorMessage = "Server configuration issue. Please contact the administrator.";
      } else if (error.message.includes("Could not find")) {
        errorTitle = "Page Not Found";
        errorMessage = "The Notion page could not be found. Make sure:\n• The page ID is correct\n• The page is shared with the PageCraft integration";
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{errorTitle}</h1>
          <p className="text-gray-600 whitespace-pre-line mb-6">{errorMessage}</p>
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

// 动态渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;
