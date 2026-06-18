import { Fragment, type ReactNode } from "react";

/** Inline **bold** support. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-black text-[var(--color-ink)]">
        {p}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

/**
 * Minimal markdown renderer (no dependency). Supports:
 *   ## heading · - bullet list · blank line = paragraph break · **bold**.
 */
export function Markdownish({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!list.length) return;
    const items = list;
    blocks.push(
      <ul key={`ul${key++}`} className="mt-2 list-disc space-y-1.5 ps-5 text-[var(--color-ink-soft)]">
        {items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={`h${key++}`} className="mt-5 text-lg font-black first:mt-0">
          {renderInline(line.slice(3))}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={`p${key++}`} className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();

  return <div className={className}>{blocks}</div>;
}
