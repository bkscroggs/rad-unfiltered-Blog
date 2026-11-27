import { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Check, Copy } from 'lucide-react';
import { slugifyHeading } from '../lib/posts';
import { EditorialImage } from './EditorialImage';

interface MarkdownRendererProps {
  content: string;
  onNavigateSlug?: (slug: string) => void;
}

function extractNodeText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractNodeText).join('');
  }
  if (
    children &&
    typeof children === 'object' &&
    'props' in children &&
    children.props &&
    typeof children.props === 'object' &&
    'children' in children.props
  ) {
    return extractNodeText(children.props.children as ReactNode);
  }
  return '';
}

function CodeBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const codeText = extractNodeText(children).replace(/\n$/, '');
  const langMatch = className?.match(/language-(\w+)/);
  const language = langMatch ? langMatch[1] : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative group my-8">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-[#181B20] border border-b-0 border-zinc-200 dark:border-zinc-800 rounded-t-lg">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({
  content,
  onNavigateSlug,
}: MarkdownRendererProps) {
  return (
    <div className="editorial-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ children, ...props }) => {
            const text = extractNodeText(children);
            const id = slugifyHeading(text);
            return (
              <h2 id={id} className="scroll-mt-24" {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = extractNodeText(children);
            const id = slugifyHeading(text);
            return (
              <h3 id={id} className="scroll-mt-24" {...props}>
                {children}
              </h3>
            );
          },
          img: ({ src, alt, title }) => {
            const imageNode = (
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <EditorialImage
                  src={src || ''}
                  alt={alt || ''}
                  className="w-full h-auto object-cover"
                  aspectClassName="aspect-[4/3]"
                />
              </div>
            );

            if (title) {
              return (
                <figure>
                  {imageNode}
                  <figcaption>{title}</figcaption>
                </figure>
              );
            }

            return <figure>{imageNode}</figure>;
          },
          p: ({ children, node }) => {
            const hasBlockImage =
              node?.children?.length === 1 &&
              node.children[0].type === 'element' &&
              node.children[0].tagName === 'img';

            if (hasBlockImage) {
              return <>{children}</>;
            }

            return <p>{children}</p>;
          },
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
          pre: ({ children }) => {
            if (
              children &&
              typeof children === 'object' &&
              'props' in children &&
              children.props
            ) {
              const codeProps = children.props as {
                children?: ReactNode;
                className?: string;
              };
              return (
                <CodeBlock className={codeProps.className}>
                  {codeProps.children}
                </CodeBlock>
              );
            }
            return <pre>{children}</pre>;
          },
          a: ({ href, children, ...props }) => {
            const isHashPost = href?.startsWith('#/post/');
            if (isHashPost && href && onNavigateSlug) {
              const slug = href.replace('#/post/', '');
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateSlug(slug);
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            const isExternal = href && /^https?:\/\//i.test(href);
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
