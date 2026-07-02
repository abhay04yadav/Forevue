import { cn } from "@/lib/utils";

/** Minimal markdown — bold, paragraphs, bullet lists (AI Workspace design) */
export function Markdown({
  content,
  className,
  streaming = false,
}: {
  content: string;
  className?: string;
  streaming?: boolean;
}) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className={cn("text-[14.5px] leading-[1.62] text-[var(--text-body)]", className)}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((line) => line.replace(/^- /, ""));
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5">
              {items.map((item, j) => (
                <li key={j}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className={i > 0 ? "mt-3" : undefined}>
            <InlineMarkdown text={trimmed} />
            {streaming && i === blocks.length - 1 && <StreamingCaret />}
          </p>
        );
      })}
      {streaming && blocks.length === 0 && <StreamingCaret />}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-bold text-[var(--text-strong)]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function StreamingCaret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[17px] w-2 animate-fv-caret rounded-[1px] bg-[var(--color-deep-teal)] align-[-3px]"
    />
  );
}
