import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Partial<Components> = {
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-[6px] bg-white dark:bg-[#0d0d0d]">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-gray-300 dark:border-gray-700">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-gray-200 last:border-0 dark:border-gray-800">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-gray-700 dark:text-gray-400">{children}</td>
  ),
  ul: ({ children }) => (
    <ul className="my-1.5 list-disc pl-5 text-gray-700 dark:text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1.5 list-decimal pl-5 text-gray-700 dark:text-gray-300">{children}</ol>
  ),
  li: ({ children }) => <li className="my-0.5 leading-6">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-1 mt-3 text-base font-bold leading-tight text-gray-800 dark:text-gray-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1 mt-2.5 text-[0.95rem] font-bold leading-tight text-gray-800 dark:text-gray-100">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2 text-sm font-bold leading-tight text-gray-800 dark:text-gray-100">{children}</h3>
  ),
  p: ({ children }) => <p className="my-1 leading-6 text-gray-700 dark:text-gray-300">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="my-1.5 border-l-2 border-gray-300 pl-3 text-gray-500 dark:border-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-gray-200 px-1 py-0.5 text-[0.85em] text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="my-2 overflow-x-auto rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500 dark:decoration-gray-600 dark:hover:decoration-gray-400"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-gray-200 dark:border-gray-700" />,
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body text-[15px] leading-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
