import { getPublicPageContent, toNotionEditUrl } from "@/lib/notion";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { DesignerTemplate } from "@/components/templates/DesignerTemplate";
import { DeveloperTemplate } from "@/components/templates/DeveloperTemplate";
import { DatabaseTemplate } from "@/components/templates/DatabaseTemplate";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { buildNavigationItems, buildSavedPageNavigationItems } from "@/lib/navigation";
import { userPagesDb } from "@/lib/db";

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    template?: string;
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

// 获取模板组件
function getTemplate(templateName: string | undefined) {
  switch (templateName) {
    case "designer":
      return DesignerTemplate;
    case "developer":
      return DeveloperTemplate;
    case "minimal":
    default:
      return MinimalTemplate;
  }
}

export default async function PublicPage({ params, searchParams }: PageProps) {
  const pageId = extractPageId(params.slug);
  const templateName = searchParams.template;

  try {
    const content = await getPublicPageContent(pageId);
    let navigationItems = buildNavigationItems(content.blocks, pageId);
    const allSavedPages = Object.values(await userPagesDb.getAll());
    const currentSavedPage = allSavedPages.find(
      (savedPage) => savedPage.slug === params.slug || savedPage.notionPageId === pageId
    );

    if (currentSavedPage) {
      const accountPages = await userPagesDb.getByUserId(currentSavedPage.userId);
      const savedPageNavigation = buildSavedPageNavigationItems(
        accountPages.map((page) => ({
          id: page.id,
          notionPageId: page.notionPageId,
          title: page.title,
          slug: page.slug,
          template: page.template,
          settings: page.settings as {
            navOrder?: number;
            hideFromNavigation?: boolean;
            isHome?: boolean;
          },
        })),
        {
          slug: params.slug,
          pageId,
        }
      );

      if (savedPageNavigation.length > 0) {
        navigationItems = savedPageNavigation;
      }
    }
    const notionEditUrl = toNotionEditUrl(content.sourceUrl);

    const pageNavigation = (
      <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
                  item.isCurrent
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.title}
              </a>
            ))}
          </div>
          {notionEditUrl && (
            <a
              href={notionEditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
            >
              Edit in Notion ↗
            </a>
          )}
        </div>
      </nav>
    );

    // Database 类型固定使用 DatabaseTemplate
    if (content.type === "database") {
      return (
        <>
          <AnalyticsTracker pageId={pageId} />
          {pageNavigation}
          <DatabaseTemplate content={content} />
        </>
      );
    }

    // 根据模板参数选择模板
    const Template = getTemplate(templateName);
    return (
      <>
        <AnalyticsTracker pageId={pageId} />
        {pageNavigation}
        <Template content={content} />
      </>
    );
  } catch (error) {
    let errorMessage = "This page may have been removed or is not public.";
    let errorTitle = "Page not found";

    if (error instanceof Error) {
      if (error.message.includes("NOTION_TOKEN")) {
        errorTitle = "Configuration Error";
        errorMessage = "Server configuration issue. Please contact the administrator.";
      } else if (error.message.includes("Could not find")) {
        errorTitle = "Page Not Found";
        errorMessage = "The Notion page or database could not be found. Make sure:\n• The ID is correct\n• It is shared with the PageCraft integration";
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

export const dynamic = "force-dynamic";
export const revalidate = 0;
