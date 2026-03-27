import { Block, RichText } from "@/lib/notion";
import { getNotionImageUrl } from "@/lib/notion-image";

export type BlockTone = "light" | "dark";

interface BlockRendererProps {
  block: Block;
  tone?: BlockTone;
}

function renderUnsupportedBlock(type: string, tone: BlockTone) {
  return (
    <div
      className={`my-4 rounded-lg border p-3 text-xs ${
        tone === "dark"
          ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      Unsupported block: <span className="font-mono">{type}</span>
    </div>
  );
}

function getBlockFileUrl(
  fileBlock: { external?: { url?: string }; file?: { url?: string } } | undefined
) {
  return fileBlock?.external?.url || fileBlock?.file?.url || null;
}

function renderBlockCaption(caption: RichText[] | undefined, tone: BlockTone) {
  if (!caption || caption.length === 0) {
    return null;
  }

  return (
    <figcaption
      className={`mt-2 text-center text-sm ${tone === "dark" ? "text-white/50" : "text-stone-500"}`}
    >
      {renderRichText(caption, tone)}
    </figcaption>
  );
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

function renderRichText(richTexts: RichText[], tone: BlockTone) {
  return richTexts.map((text, i) => {
    const { annotations, text: textContent } = text;
    let content: React.ReactNode = textContent?.content || "";

    if (annotations?.code) {
      return (
        <code
          key={i}
          className={`rounded-md px-1.5 py-0.5 text-[0.9em] font-medium ${
            tone === "dark" ? "bg-white/10 text-white" : "bg-stone-100 text-stone-800"
          }`}
        >
          {content}
        </code>
      );
    }

    if (textContent?.link) {
      content = (
        <a
          href={textContent.link.url}
          className={`break-words underline underline-offset-4 transition ${
            tone === "dark"
              ? "text-sky-300 decoration-sky-400/50 hover:text-sky-200 hover:decoration-sky-300"
              : "text-blue-700 decoration-blue-300 hover:text-blue-800 hover:decoration-blue-500"
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
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

export function BlockRenderer({ block, tone = "light" }: BlockRendererProps) {
  const { type } = block;
  const isDark = tone === "dark";

  switch (type) {
    case "paragraph":
      return (
        <p
          className={`mb-5 break-words text-base leading-8 sm:text-[1.04rem] ${
            isDark ? "text-white/80" : "text-stone-700"
          }`}
        >
          {block.paragraph?.rich_text?.length
            ? renderRichText(block.paragraph.rich_text, tone)
            : "\u00A0"}
        </p>
      );

    case "heading_1":
      return (
        <h1
          className={`mb-6 mt-11 break-words text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl ${
            isDark ? "text-white" : "text-stone-950"
          }`}
        >
          {renderRichText(block.heading_1?.rich_text || [], tone)}
        </h1>
      );

    case "heading_2":
      return (
        <h2
          className={`mb-4 mt-10 break-words border-t pt-7 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl ${
            isDark ? "border-white/10 text-white" : "border-black/8 text-stone-950"
          }`}
        >
          {renderRichText(block.heading_2?.rich_text || [], tone)}
        </h2>
      );

    case "heading_3":
      return (
        <h3
          className={`mb-3 mt-8 break-words text-xl font-semibold tracking-[-0.02em] sm:text-2xl ${
            isDark ? "text-white" : "text-stone-900"
          }`}
        >
          {renderRichText(block.heading_3?.rich_text || [], tone)}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li
          className={`mb-2 ml-6 list-disc break-words text-base leading-8 marker:text-sm ${
            isDark ? "text-white/80 marker:text-white/40" : "text-stone-700 marker:text-stone-400"
          }`}
        >
          {renderRichText(block.bulleted_list_item?.rich_text || [], tone)}
          {block.children && (
            <ul className={`mt-2 border-l pl-4 ${isDark ? "border-white/15" : "border-stone-200"}`}>
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} tone={tone} />
              ))}
            </ul>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li
          className={`mb-2 ml-6 list-decimal break-words text-base leading-8 marker:text-sm ${
            isDark ? "text-white/80 marker:text-white/40" : "text-stone-700 marker:text-stone-400"
          }`}
        >
          {renderRichText(block.numbered_list_item?.rich_text || [], tone)}
          {block.children && (
            <ol className={`mt-2 border-l pl-4 ${isDark ? "border-white/15" : "border-stone-200"}`}>
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} tone={tone} />
              ))}
            </ol>
          )}
        </li>
      );

    case "to_do":
      return (
        <div className="mb-2 flex items-start gap-3">
          <input
            type="checkbox"
            checked={block.to_do?.checked}
            readOnly
            className={`mt-1.5 h-4 w-4 rounded ${isDark ? "border-white/30 bg-white/10" : "border-stone-300"}`}
          />
          <span
            className={
              block.to_do?.checked
                ? isDark
                  ? "line-through text-white/40"
                  : "line-through text-stone-400"
                : isDark
                  ? "text-white/80"
                  : "text-stone-700"
            }
          >
            {renderRichText(block.to_do?.rich_text || [], tone)}
          </span>
        </div>
      );

    case "quote":
      return (
        <blockquote
          className={`my-6 rounded-2xl border px-5 py-4 italic leading-8 ${
            isDark
              ? "border-white/15 bg-white/5 text-white/80"
              : "border-stone-200 bg-stone-50 text-stone-700"
          }`}
        >
          {renderRichText(block.quote?.rich_text || [], tone)}
        </blockquote>
      );

    case "callout":
      return (
        <div
          className={`my-6 flex gap-3 rounded-2xl border p-4 ${
            isDark
              ? "border-amber-300/30 bg-amber-500/10"
              : "border-amber-200 bg-amber-50/85"
          }`}
        >
          <span className={`mt-2 inline-block h-2 w-2 rounded-full ${isDark ? "bg-amber-300" : "bg-amber-500"}`} />
          <div className={`break-words ${isDark ? "text-amber-100" : "text-stone-800"}`}>
            {renderRichText(block.callout?.rich_text || [], tone)}
          </div>
        </div>
      );

    case "code": {
      const codeContent = toPlainText(block.code?.rich_text);

      return (
        <pre
          className={`my-6 overflow-x-auto rounded-2xl border p-4 shadow-sm sm:p-5 ${
            isDark
              ? "border-[#475569] bg-[#0f172a] text-slate-100"
              : "border-slate-800 bg-slate-950 text-slate-100"
          }`}
        >
          <code className="whitespace-pre-wrap font-mono text-sm leading-6">{codeContent || " "}</code>
        </pre>
      );
    }

    case "toggle":
      return (
        <details
          className={`my-5 rounded-xl border px-4 py-3 ${
            isDark ? "border-white/15 bg-white/5" : "border-stone-200 bg-stone-50/80"
          }`}
        >
          <summary className={`cursor-pointer font-medium ${isDark ? "text-white" : "text-stone-900"}`}>
            {renderRichText(block.toggle?.rich_text || [], tone)}
          </summary>
          {block.children?.length > 0 && (
            <div className="mt-3 space-y-2 pl-2">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} tone={tone} />
              ))}
            </div>
          )}
        </details>
      );

    case "table":
      return (
        <div
          className={`my-6 overflow-x-auto rounded-xl border ${
            isDark ? "border-white/15 bg-[#111827]" : "border-stone-200 bg-white"
          }`}
        >
          <table className="min-w-full border-collapse text-left text-sm">
            <tbody>
              {(block.children || []).map((row: Block) => {
                if (row.type !== "table_row") {
                  return null;
                }

                return (
                  <tr key={row.id} className={`border-b last:border-b-0 ${isDark ? "border-white/10" : "border-stone-100"}`}>
                    {(row.table_row?.cells || []).map((cell: RichText[], index: number) => (
                      <td key={`${row.id}-${index}`} className={`px-3 py-2 align-top ${isDark ? "text-white/80" : "text-stone-700"}`}>
                        {cell.length > 0 ? renderRichText(cell, tone) : <span>&nbsp;</span>}
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
        <div
          className={`my-4 rounded-lg border p-4 ${
            isDark ? "border-white/15 bg-white/5" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-white/50" : "text-slate-500"}`}>
            Synced block
          </div>
          {block.children?.length > 0 ? (
            <div className="mt-2 space-y-2">
              {block.children.map((child: Block) => (
                <BlockRenderer key={child.id} block={child} tone={tone} />
              ))}
            </div>
          ) : (
            <div className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-slate-600"}`}>
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
          className={`my-4 block rounded-xl border p-4 transition-colors ${
            isDark
              ? "border-white/15 bg-white/5 hover:bg-white/10"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-white/50" : "text-stone-500"}`}>
            Bookmark
          </div>
          <div className={`mt-1 break-all text-sm ${isDark ? "text-sky-300" : "text-blue-700"}`}>
            {block.bookmark?.url || "Untitled bookmark"}
          </div>
          {block.bookmark?.caption?.length > 0 && (
            <div className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-stone-600"}`}>
              {renderRichText(block.bookmark.caption, tone)}
            </div>
          )}
        </a>
      );

    case "video": {
      const videoUrl = getBlockFileUrl(block.video);
      if (!videoUrl) {
        return renderUnsupportedBlock(type, tone);
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
              className={`block rounded-xl border p-4 ${
                isDark
                  ? "border-white/15 bg-white/5 text-sky-300"
                  : "border-stone-200 bg-stone-50 text-blue-700"
              }`}
            >
              Open video
            </a>
          )}
          {renderBlockCaption(block.video?.caption, tone)}
        </figure>
      );
    }

    case "file": {
      const fileUrl = getBlockFileUrl(block.file);
      if (!fileUrl) {
        return renderUnsupportedBlock(type, tone);
      }

      return (
        <figure
          className={`my-4 rounded-xl border p-4 ${
            isDark ? "border-white/15 bg-white/5" : "border-stone-200 bg-stone-50"
          }`}
        >
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium hover:underline ${isDark ? "text-sky-300" : "text-blue-700"}`}
          >
            Download file
          </a>
          {renderBlockCaption(block.file?.caption, tone)}
        </figure>
      );
    }

    case "pdf": {
      const pdfUrl = getBlockFileUrl(block.pdf);
      if (!pdfUrl) {
        return renderUnsupportedBlock(type, tone);
      }

      return (
        <figure className="my-6 space-y-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium hover:underline ${isDark ? "text-sky-300" : "text-blue-700"}`}
          >
            Open PDF
          </a>
          <iframe
            src={pdfUrl}
            title={block.pdf?.caption?.[0]?.text?.content || "PDF preview"}
            className={`h-[460px] w-full rounded-lg border ${isDark ? "border-white/15" : "border-stone-200"}`}
          />
          {renderBlockCaption(block.pdf?.caption, tone)}
        </figure>
      );
    }

    case "image": {
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
            <figcaption
              className={`mt-2 text-center text-sm ${isDark ? "text-white/50" : "text-stone-500"}`}
            >
              {renderRichText(block.image.caption, tone)}
            </figcaption>
          )}
        </figure>
      );
    }

    case "divider":
      return <hr className={`my-8 ${isDark ? "border-white/15" : "border-stone-200"}`} />;

    case "link_to_page": {
      const pageId = block.link_to_page?.page_id;
      const linkedPagePath = toPublicPagePath(pageId);
      return (
        <a
          href={linkedPagePath || "#"}
          className={`my-4 block rounded-xl border p-4 transition-colors ${
            isDark
              ? "border-white/15 bg-white/5 hover:bg-white/10"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          <span className={isDark ? "text-sky-300" : "text-blue-700"}>Linked page</span>
          {pageId && (
            <span className={`ml-2 break-all text-sm ${isDark ? "text-white/50" : "text-stone-400"}`}>
              ({pageId})
            </span>
          )}
        </a>
      );
    }

    case "child_page": {
      const childPagePath = toPublicPagePath(block.id);
      return (
        <a
          href={childPagePath || "#"}
          className={`my-4 block rounded-xl border p-4 transition-colors ${
            isDark
              ? "border-white/15 bg-white/5 hover:bg-white/10"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          <span className={`break-words font-medium ${isDark ? "text-white" : "text-stone-900"}`}>
            {block.child_page?.title || "Sub page"}
          </span>
        </a>
      );
    }

    case "unsupported":
      return renderUnsupportedBlock(type, tone);

    default:
      return renderUnsupportedBlock(type, tone);
  }
}

interface BlocksRendererProps {
  blocks: Block[];
  tone?: BlockTone;
}

export function BlocksRenderer({ blocks, tone = "light" }: BlocksRendererProps) {
  const result: React.ReactNode[] = [];
  let currentList: Block[] = [];
  let listType: "bulleted" | "numbered" | null = null;

  const flushList = () => {
    if (currentList.length === 0) return;

    const ListTag = listType === "numbered" ? "ol" : "ul";
    result.push(
      <ListTag key={`list-${result.length}`} className="mb-5">
        {currentList.map((block) => (
          <BlockRenderer key={block.id} block={block} tone={tone} />
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
      result.push(<BlockRenderer key={block.id} block={block} tone={tone} />);
    }
  }
  flushList();

  return <>{result}</>;
}
