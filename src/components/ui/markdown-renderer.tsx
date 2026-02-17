"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose-sm prose-invert max-w-none ${className}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-muted-foreground">{children}</em>
        ),
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mt-3 mb-2 text-foreground">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mt-3 mb-1.5 text-foreground">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 last:mb-0 space-y-1.5 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 last:mb-0 space-y-1.5 pl-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex gap-2 leading-relaxed">
            <span className="text-primary mt-1.5 shrink-0 text-[8px]">●</span>
            <span className="flex-1">{children}</span>
          </li>
        ),
        hr: () => (
          <hr className="my-3 border-border/50" />
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/40 pl-3 my-3 text-muted-foreground italic">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block p-3 rounded-lg bg-background/50 border border-border/50 text-xs font-mono overflow-x-auto my-2">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-2">{children}</pre>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-border/50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left p-2 font-semibold text-foreground">{children}</th>
        ),
        td: ({ children }) => (
          <td className="p-2 border-b border-border/30">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
