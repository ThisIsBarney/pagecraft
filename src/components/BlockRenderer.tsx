import { Block, RichText } from "@/lib/notion";
import { getNotionImageUrl } from "@/lib/notion-image";

interface BlockRendererProps {
  block: Block;
}

function renderUnsupportedBlock(type: string) {
  return (
    <div className="my-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
      Unsupported block: <span className="font-mono">{type}</span>
    </div>
  );
}

function getBlockFileUrl(
  fileBlock: { external?: { url?: string }; file?: { url?: string } } | undefined
) {
  return fileBlock?.external?.url || fileBlock?.file?.url || null;
}

function renderBlockCaption(caption: RichText[] | undefined) {
  if (!caption || caption.length === 0) {
    return null;
  }

  return <figcaption className="mt-2 text-center text-sm text-gray-500">{renderRichText(caption)}</figcaption>;
}

function toPlainText(richTexts: RichText[] | undefined) {
  if (!richTexts || richTexts.length === 0) {
    return "";
  }

  return richTexts
    .map((text) => text.text?.content || "")
    .join("")
    .trimEnd();
}

function toPublicPagePath(pageId: string | undefined) {
  if (!pageId) {
    return null;
  }

  const normalized = pageId.replace(/-/g, "");
  return normalized ? `/p/${normalized}` : null;
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
  const { type } = block;

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
        <li className="mb-2 ml-6 list-disc leading-7 text-gray-800 marker:text-gray-500">
          {renderRichText(block.bulleted_list_item?.rich_text || [])}
          {block.children && (
            <ul className="mt-2 border-l border-gray-200 pl-4">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </ul>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mb-2 ml-6 list-decimal leading-7 text-gray-800 marker:text-gray-500">
          {renderRichText(block.numbered_list_item?.rich_text || [])}
          {block.children && (
            <ol className="mt-2 border-l border-gray-200 pl-4">
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
        <blockquote className="my-5 rounded-r-lg border-l-4 border-slate-300 bg-slate-50/80 px-4 py-3 text-gray-700 italic leading-7">
          {renderRichText(block.quote?.rich_text || [])}
        </blockquote>
      );

    case "callout":
      return (
        <div className="my-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="mt-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
          <div className="text-gray-800">
            {renderRichText(block.callout?.rich_text || [])}
          </div>
        </div>
      );

    case "code":
      const codeContent = toPlainText(block.code?.rich_text);

      return (
        <pre className="my-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-sm">
          <code className="text-sm leading-6 font-mono whitespace-pre-wrap">
            {codeContent || " "}
          </code>
        </pre>
      );

    case "toggle":
      return (
        <details className="my-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <summary className="cursor-pointer font-medium text-gray-900">
            {renderRichText(block.toggle?.rich_text || [])}
          </summary>
          {block.children?.length > 0 && (
            <div className="mt-3 space-y-2 pl-2">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </div>
          )}
        </details>
      );

    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <tbody>
              {(block.children || []).map((row: Block) => {
                if (row.type !== "table_row") {
                  return null;
                }

                return (
                  <tr key={row.id} className="border-b border-gray-100 last:border-b-0">
                    {(row.table_row?.cells || []).map((cell: RichText[], index: number) => (
                      <td key={`${row.id}-${index}`} className="px-3 py-2 align-top text-gray-800">
                        {cell.length > 0 ? renderRichText(cell) : <span>&nbsp;</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case "synced_block":
      return (
        <div className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Synced block</div>
          {block.children?.length > 0 ? (
            <div className="mt-2 space-y-2">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm text-slate-600">
              {block.synced_block?.synced_from?.block_id
                ? "This synced content references another block."
                : "No synced content available."}
            </div>
          )}
        </div>
      );

    case "bookmark":
      return (
        <a
          href={block.bookmark?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Bookmark</div>
          <div className="mt-1 break-all text-sm text-blue-600">{block.bookmark?.url || "Untitled bookmark"}</div>
          {block.bookmark?.caption?.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">{renderRichText(block.bookmark.caption)}</div>
          )}
        </a>
      );

    case "video": {
      const videoUrl = getBlockFileUrl(block.video);
      if (!videoUrl) {
        return renderUnsupportedBlock(type);
      }

      const isHostedVideo = Boolean(block.video?.file?.url);
      return (
        <figure className="my-6">
          {isHostedVideo ? (
            <video controls className="w-full rounded-lg" src={videoUrl} />
          ) : (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-200 bg-gray-50 p-4 text-blue-600 hover:underline"
            >
              Open video
            </a>
          )}
          {renderBlockCaption(block.video?.caption)}
        </figure>
      );
    }

    case "file": {
      const fileUrl = getBlockFileUrl(block.file);
      if (!fileUrl) {
        return renderUnsupportedBlock(type);
      }

      return (
        <figure className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Download file
          </a>
          {renderBlockCaption(block.file?.caption)}
        </figure>
      );
    }

    case "pdf": {
      const pdfUrl = getBlockFileUrl(block.pdf);
      if (!pdfUrl) {
        return renderUnsupportedBlock(type);
      }

      return (
        <figure className="my-6 space-y-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Open PDF
          </a>
          <iframe
            src={pdfUrl}
            title={block.pdf?.caption?.[0]?.text?.content || "PDF preview"}
            className="h-[460px] w-full rounded-lg border border-gray-200"
          />
          {renderBlockCaption(block.pdf?.caption)}
        </figure>
      );
    }

    case "image":
      const imageUrl = getNotionImageUrl(block);

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
      const linkedPagePath = toPublicPagePath(pageId);
      return (
        <a
          href={linkedPagePath || "#"}
          className="my-4 block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <span className="text-blue-600">Linked page</span>
          {pageId && <span className="ml-2 text-sm text-gray-400">({pageId})</span>}
        </a>
      );

    case "child_page":
      const childPagePath = toPublicPagePath(block.id);
      return (
        <a
          href={childPagePath || "#"}
          className="my-4 block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">{block.child_page?.title || "Sub page"}</span>
        </a>
      );

    case "unsupported":
      return renderUnsupportedBlock(type);

    default:
      return renderUnsupportedBlock(type);
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
