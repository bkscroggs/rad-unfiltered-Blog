import { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Check, Copy, ZoomIn } from 'lucide-react';
import { slugifyHeading } from '../lib/posts';
import type { ReaderFontSize } from '../lib/preferences';
import { EditorialImage } from './EditorialImage';
import type { LightboxImageData } from './LightboxModal';

interface MarkdownRendererProps {
  content: string;
  fontSize?: ReaderFontSize;
  onNavigateSlug?: (slug: string) => void;
  onZoomImage?: (image: LightboxImageData) => void;
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
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-slate-400 bg-zinc-100 dark:bg-[#0D192B] border border-b-0 border-zinc-200 dark:border-slate-700/80 rounded-t-lg">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
  fontSize = 'md',
  onNavigateSlug,
  onZoomImage,
}: MarkdownRendererProps) {
  const sizeClass =
    fontSize === 'sm'
      ? 'prose-size-sm'
      : fontSize === 'lg'
        ? 'prose-size-lg'
        : '';

  return (
    <div className={`editorial-prose ${sizeClass}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ children, ...props }) => {
            const text = extractNodeText(children);
            const id = slugifyHeading(text);
            return (
              <h2 id={id} data-toc-heading="true" className="scroll-mt-24" {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = extractNodeText(children);
            const id = slugifyHeading(text);
            return (
              <h3 id={id} data-toc-heading="true" className="scroll-mt-24" {...props}>
                {children}
              </h3>
            );
          },
          img: ({ src, alt, title }) => {
            const imgSrc = src || '';
            const imgAlt = alt || '';
            const imageNode = (
              <div className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-slate-800 bg-zinc-100 dark:bg-slate-900">
                <EditorialImage
                  src={imgSrc}
                  alt={imgAlt}
                  className="w-full h-auto object-cover"
                  aspectClassName="aspect-[4/3]"
                />
                {onZoomImage && imgSrc && (
                  <button
                    type="button"
                    onClick={() =>
                      onZoomImage({
                        src: imgSrc,
                        alt: imgAlt,
                        caption: title || undefined,
                      })
                    }
                    aria-label={`Zoom image: ${imgAlt || 'clinical figure'}`}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-black/65 text-white backdrop-blur-sm opacity-85 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Zoom</span>
                  </button>
                )}
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
