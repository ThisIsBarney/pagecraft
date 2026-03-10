import { getPublicPageContent } from "@/lib/notion";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function PublicPage({ params }: PageProps) {
  // slug 格式: pageId-authorName
  const [pageId] = params.slug.split("-");
  
  try {
    const content = await getPublicPageContent(pageId);
    
    return <MinimalTemplate content={content} />;
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-600">This page may have been removed or is not public.</p>
        </div>
      </div>
    );
  }
}

// 静态生成配置（MVP 阶段先用动态渲染）
export const dynamic = "force-dynamic";
