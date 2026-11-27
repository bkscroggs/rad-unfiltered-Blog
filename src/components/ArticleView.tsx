import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Link2 } from 'lucide-react';
import { MEDICAL_DISCLAIMER, type BlogPost } from '../lib/posts';
import { EditorialImage } from './EditorialImage';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ArticleViewProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  onBackHome: () => void;
  onOpenPost: (slug: string) => void;
  onProgressChange: (progress: number) => void;
}

export function ArticleView({
  post,
  relatedPosts,
  onBackHome,
  onOpenPost,
  onProgressChange,
}: ArticleViewProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        onProgressChange(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
      onProgressChange(pct);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [post.slug, onProgressChange]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }
  };

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <article className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-20">
      {/* Back navigation */}
      <div className="mb-8">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[40px] px-3 py-1.5 -ml-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] rounded-md transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to All Articles</span>
        </button>
      </div>

      {/* Article Masthead */}
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium uppercase tracking-wider text-[#1E3A8A] dark:text-[#60A5FA]">
            {post.category}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{post.formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{post.readingTimeLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{post.wordCount} words</span>
        </div>

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-[3.25rem] font-semibold tracking-tight leading-[1.1] text-[#0A0A0A] dark:text-[#F4F4F5]">
          {post.title}
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {post.summary}
        </p>
      </header>

      {/* Cover Photograph */}
      <figure className="mt-8 sm:mt-10 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <EditorialImage
            src={post.coverImage}
            alt={post.title}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>
      </figure>

      {/* Asymmetric Reading Canvas + Margin Index */}
      <div className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-8 min-w-0">
          <div className="max-w-[68ch]">
            <MarkdownRenderer
              content={post.content}
              onNavigateSlug={onOpenPost}
            />
            {!post.content.includes('Medical Disclaimer:') && (
              <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                <p>{MEDICAL_DISCLAIMER}</p>
              </div>
            )}
          </div>
        </div>

        <aside
          aria-label="Article notes and section index"
          className="lg:col-span-4 lg:sticky lg:top-24 space-y-8 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 pt-8 lg:pt-0 lg:pl-8"
        >
          {post.headings.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-3.5">
                In This Article
              </h2>
              <nav aria-label="Table of contents">
                <ul className="space-y-2 text-sm">
                  {post.headings.map((heading) => (
                    <li
                      key={heading.id}
                      className={heading.level === 3 ? 'pl-3.5' : ''}
                    >
                      <button
                        type="button"
                        onClick={() => scrollToHeading(heading.id)}
                        className="text-left text-zinc-600 dark:text-zinc-400 hover:text-[#1E3A8A] dark:hover:text-[#93C5FD] transition-colors leading-snug cursor-pointer"
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-3.5">
              Colophon
            </h2>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-4 py-1 border-b border-zinc-100 dark:border-zinc-800/70">
                <dt className="text-zinc-500 dark:text-zinc-400">Section</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {post.category}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1 border-b border-zinc-100 dark:border-zinc-800/70">
                <dt className="text-zinc-500 dark:text-zinc-400">Published</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {post.formattedDate}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1 border-b border-zinc-100 dark:border-zinc-800/70">
                <dt className="text-zinc-500 dark:text-zinc-400">Length</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {post.wordCount} words ({post.readingTimeLabel})
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161A] text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {linkCopied ? (
                <>
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Article Link</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Continue Reading Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F4F4F5] mb-8">
            Continue Reading
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {relatedPosts.map((related) => (
              <article
                key={related.slug}
                className="group flex flex-col justify-between p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161A]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {related.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={related.date}>{related.formattedDate}</time>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {related.readingTimeLabel}
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F4F4F5]">
                    <a
                      href={`#/post/${related.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(related.slug);
                      }}
                      className="hover:text-[#1E3A8A] dark:hover:text-[#93C5FD] transition-colors"
                    >
                      {related.title}
                    </a>
                  </h3>

                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {related.summary}
                  </p>
                </div>

                <div className="mt-5">
                  <a
                    href={`#/post/${related.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPost(related.slug);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] dark:text-[#60A5FA] hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    <span>Read Article</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
