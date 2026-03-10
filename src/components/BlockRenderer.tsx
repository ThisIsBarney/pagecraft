import Image from "next/image";
import { Block, RichText } from "@/lib/notion";

interface BlockRendererProps {
  block: Block;
}

// 渲染富文本
function renderRichText(richTexts: RichText[]) {
  return richTexts.map((text, i) => {
    const { annotations, text: textContent } = text;
    let content = textContent?.content || "";

    if (annotations?.code) {
      return (
        <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
          {content}
        </code>
      );
    }

    if (textContent?.link) {
      content = (
        <a
          href={textContent.link.url}
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      ) as unknown as string;
    }

    return (
      <span
        key={i}
        className={`
          ${annotations?.bold ? "font-bold" : ""}
          ${annotations?.italic ? "italic" : ""}
          ${annotations?.strikethrough ? "line-through" : ""}
          ${annotations?.underline ? "underline" : ""}
        `}
      >
        {content}
      </span>
    );
  });
}

// 单个块渲染
export function BlockRenderer({ block }: BlockRendererProps) {
  const { type, id } = block;

  switch (type) {
    case "paragraph":
      return (
        <p className="mb-4 leading-relaxed text-gray-800">
          {block.paragraph?.rich_text?.length
            ? renderRichText(block.paragraph.rich_text)
            : "\u00A0"}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-4xl font-bold mb-6 mt-8 text-gray-900">
          {renderRichText(block.heading_1?.rich_text || [])}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-2xl font-semibold mb-4 mt-6 text-gray-900">
          {renderRichText(block.heading_2?.rich_text || [])}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-xl font-medium mb-3 mt-5 text-gray-900">
          {renderRichText(block.heading_3?.rich_text || [])}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="ml-6 mb-2 list-disc text-gray-800">
          {renderRichText(block.bulleted_list_item?.rich_text || [])}
          {block.children && (
            <ul className="mt-2">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </ul>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="ml-6 mb-2 list-decimal text-gray-800">
          {renderRichText(block.numbered_list_item?.rich_text || [])}
          {block.children && (
            <ol className="mt-2">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </ol>
          )}
        </li>
      );

    case "to_do":
      return (
        <div className="flex items-start gap-2 mb-2">
          <input
            type="checkbox"
            checked={block.to_do?.checked}
            readOnly
            className="mt-1.5 w-4 h-4"
          />
          <span className={block.to_do?.checked ? "line-through text-gray-500" : "text-gray-800"}>
            {renderRichText(block.to_do?.rich_text || [])}
          </span>
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50">
          {renderRichText(block.quote?.rich_text || [])}
        </blockquote>
      );

    case "callout":
      return (
        <div className="flex gap-3 p-4 my-4 bg-gray-100 rounded-lg">
          <span className="text-xl">{block.callout?.icon?.emoji || "💡"}</span>
          <div className="text-gray-800">
            {renderRichText(block.callout?.rich_text || [])}
          </div>
        </div>
      );

    case "code":
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
          <code className="text-sm font-mono">
            {block.code?.rich_text?.[0]?.text?.content || ""}
          </code>
        </pre>
      );

    case "image":
      const imageUrl =
        block.image?.type === "external"
          ? block.image.external?.url
          : block.image?.file?.url;

      if (!imageUrl) return null;

      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={block.image?.caption?.[0]?.text?.content || "Image"}
            className="w-full rounded-lg"
          />
          {block.image?.caption?.length > 0 && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {renderRichText(block.image.caption)}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return <hr className="my-8 border-gray-200" />;

    case "link_to_page":
      const pageId = block.link_to_page?.page_id;
      return (
        <div className="my-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <span className="text-blue-600">→ 链接页面</span>
          {pageId && <span className="text-gray-400 text-sm ml-2">({pageId})</span>}
        </div>
      );

    case "child_page":
      return (
        <div className="my-4 p-4 border border-gray-200 rounded-lg">
          <span className="font-medium">📄 {block.child_page?.title || "子页面"}</span>
        </div>
      );

    case "unsupported":
      return (
        <div className="my-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded">
          [不支持的块类型]
        </div>
      );

    default:
      return (
        <div className="my-2 text-gray-400 text-sm">
          [{type}]
        </div>
      );
  }
}

// 列表容器处理
interface BlocksRendererProps {
  blocks: Block[];
}

export function BlocksRenderer({ blocks }: BlocksRendererProps) {
  const result: React.ReactNode[] = [];
  let currentList: Block[] = [];
  let listType: "bulleted" | "numbered" | null = null;

  const flushList = () => {
    if (currentList.length === 0) return;

    const ListTag = listType === "numbered" ? "ol" : "ul";
    result.push(
      <ListTag key={`list-${result.length}`} className="mb-4">
        {currentList.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </ListTag>
    );
    currentList = [];
    listType = null;
  };

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      if (listType && listType !== "bulleted") flushList();
      listType = "bulleted";
      currentList.push(block);
    } else if (block.type === "numbered_list_item") {
      if (listType && listType !== "numbered") flushList();
      listType = "numbered";
      currentList.push(block);
    } else {
      flushList();
      result.push(<BlockRenderer key={block.id} block={block} />);
    }
  }
  flushList();

  return <>{result}</>;
}
