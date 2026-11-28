import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Columns2,
  Link2,
  Search,
  ZoomIn,
} from 'lucide-react';
import { MEDICAL_DISCLAIMER, type BlogPost } from '../lib/posts';
import type { ReaderFontSize, ReaderPreferences } from '../lib/preferences';
import { EditorialImage } from './EditorialImage';
import type { LightboxImageData } from './LightboxModal';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ArticleViewProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  isBookmarked: boolean;
  readerPrefs: ReaderPreferences;
  onUpdateReaderPrefs: (prefs: ReaderPreferences) => void;
  onToggleBookmark: (slug: string) => void;
  onOpenCommandSearch: () => void;
  onZoomImage: (image: LightboxImageData) => void;
  onBackHome: () => void;
  onOpenPost: (slug: string) => void;
  onProgressChange: (progress: number) => void;
}

const FONT_SIZE_OPTIONS: { value: ReaderFontSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export function ArticleView({
  post,
  relatedPosts,
  isBookmarked,
  readerPrefs,
  onUpdateReaderPrefs,
  onToggleBookmark,
  onOpenCommandSearch,
  onZoomImage,
  onBackHome,
  onOpenPost,
  onProgressChange,
}: ArticleViewProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>(
    post.headings[0]?.id ?? '',
  );
  const proseContainerRef = useRef<HTMLDivElement>(null);

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

  // Scroll-Spy IntersectionObserver for Table of Contents
  useEffect(() => {
    setActiveHeadingId(post.headings[0]?.id ?? '');
    const container = proseContainerRef.current;
    if (!container) return;

    const headingElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-toc-heading="true"]'),
    );
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible.length > 0 && visible[0].target.id) {
          setActiveHeadingId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-96px 0px -65% 0px',
        threshold: 0,
      },
    );

    for (const el of headingElements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [post.slug, post.headings]);

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
      setActiveHeadingId(id);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isWide = readerPrefs.width === 'wide';

  return (
    <article className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-20">
      {/* Top Action Bar: Back + Reader Comfort Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[40px] px-3 py-1.5 -ml-3 text-xs font-medium text-zinc-600 dark:text-slate-300 hover:text-[#0A0A0A] dark:hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to All Articles</span>
        </button>

        {/* Reader Comfort Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D192B]/70 backdrop-blur-md">
          {/* Font Size Controls */}
          <div
            role="group"
            aria-label="Reader text size"
            className="flex items-center gap-0.5 pr-2 border-r border-zinc-200 dark:border-slate-700/80"
          >
            {FONT_SIZE_OPTIONS.map((opt) => {
              const selected = readerPrefs.fontSize === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onUpdateReaderPrefs({ ...readerPrefs, fontSize: opt.value })
                  }
                  aria-pressed={selected}
                  aria-label={`Font size ${opt.label}`}
                  className={`min-w-[30px] min-h-[32px] px-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A]'
                      : 'text-zinc-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Reading Width Control */}
          <button
            type="button"
            onClick={() =>
              onUpdateReaderPrefs({
                ...readerPrefs,
                width: isWide ? 'standard' : 'wide',
              })
            }
            aria-pressed={isWide}
            aria-label="Toggle reading column width"
            className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              isWide
                ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#60A5FA]/15 dark:text-[#93C5FD]'
                : 'text-zinc-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isWide ? 'Wide' : 'Standard'}</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            type="button"
            onClick={() => onToggleBookmark(post.slug)}
            aria-pressed={isBookmarked}
            className="inline-flex items-center gap-1.5 min-h-[32px] px-2.5 text-xs font-medium rounded-md text-zinc-700 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isBookmarked
                  ? 'fill-[#1E3A8A] text-[#1E3A8A] dark:fill-[#60A5FA] dark:text-[#60A5FA]'
                  : ''
              }`}
              aria-hidden="true"
            />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Quick Command-K Search */}
          <button
            type="button"
            onClick={onOpenCommandSearch}
            aria-label="Open instant search"
            className="inline-flex items-center gap-1.5 min-h-[32px] px-2.5 text-xs font-medium rounded-md text-zinc-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline font-mono text-[11px]">⌘K</span>
          </button>
        </div>
      </div>

      {/* Article Masthead */}
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
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

        <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-slate-300 leading-relaxed">
          {post.summary}
        </p>
      </header>

      {/* Cover Photograph with Lightbox Zoom */}
      <figure className="group relative mt-8 sm:mt-10 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-zinc-100 dark:bg-slate-900 shadow-sm">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <EditorialImage
            src={post.coverImage}
            alt={post.title}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>
        {post.coverImage && (
          <button
            type="button"
            onClick={() =>
              onZoomImage({
                src: post.coverImage,
                alt: post.title,
                caption: post.summary,
              })
            }
            aria-label="Zoom cover photograph"
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-black/65 text-white backdrop-blur-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Inspect Figure</span>
          </button>
        )}
      </figure>

      {/* Asymmetric Reading Canvas + Sticky Scroll-Spy Index */}
      <div className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className={isWide ? 'lg:col-span-9 min-w-0' : 'lg:col-span-8 min-w-0'}>
          <div
            ref={proseContainerRef}
            className={isWide ? 'max-w-[82ch]' : 'max-w-[68ch]'}
          >
            <MarkdownRenderer
              content={post.content}
              fontSize={readerPrefs.fontSize}
              onNavigateSlug={onOpenPost}
              onZoomImage={onZoomImage}
            />
            {!post.content.includes('Medical Disclaimer:') && (
              <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-slate-800 text-xs leading-relaxed text-zinc-600 dark:text-slate-400">
                <p>{MEDICAL_DISCLAIMER}</p>
              </div>
            )}
          </div>
        </div>

        <aside
          aria-label="Article notes and section index"
          className={`${
            isWide ? 'lg:col-span-3' : 'lg:col-span-4'
          } lg:sticky lg:top-24 space-y-6`}
        >
          {post.headings.length > 0 && (
            <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-[#0D192B]/65 backdrop-blur-md">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-slate-400 mb-3.5">
                In This Article
              </h2>
              <nav aria-label="Table of contents">
                <ul className="space-y-2 text-sm">
                  {post.headings.map((heading) => {
                    const isActive = activeHeadingId === heading.id;
                    return (
                      <li
                        key={heading.id}
                        className={heading.level === 3 ? 'pl-3.5' : ''}
                      >
                        <button
                          type="button"
                          onClick={() => scrollToHeading(heading.id)}
                          className={`text-left transition-colors leading-snug cursor-pointer ${
                            isActive
                              ? 'font-semibold text-[#1E3A8A] dark:text-[#60A5FA]'
                              : 'text-zinc-600 dark:text-slate-400 hover:text-[#0A0A0A] dark:hover:text-white'
                          }`}
                        >
                          {heading.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-[#0D192B]/65 backdrop-blur-md">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-slate-400 mb-3.5">
              Colophon
            </h2>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-4 py-1 border-b border-zinc-100 dark:border-slate-800/70">
                <dt className="text-zinc-500 dark:text-slate-400">Section</dt>
                <dd className="font-medium text-zinc-900 dark:text-slate-100 text-right">
                  {post.category}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1 border-b border-zinc-100 dark:border-slate-800/70">
                <dt className="text-zinc-500 dark:text-slate-400">Published</dt>
                <dd className="font-medium text-zinc-900 dark:text-slate-100 text-right">
                  {post.formattedDate}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1 border-b border-zinc-100 dark:border-slate-800/70">
                <dt className="text-zinc-500 dark:text-slate-400">Length</dt>
                <dd className="font-medium text-zinc-900 dark:text-slate-100 tabular-nums text-right">
                  {post.wordCount} words ({post.readingTimeLabel})
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 text-zinc-800 dark:text-slate-200 hover:border-zinc-300 dark:hover:border-slate-600 transition-colors cursor-pointer whitespace-nowrap"
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
        <section className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-slate-800/80">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F4F4F5] mb-8">
            Continue Reading
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {relatedPosts.map((related) => (
              <article
                key={related.slug}
                className="group flex flex-col justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D192B]/60 backdrop-blur-md shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
                    <span className="font-medium text-zinc-800 dark:text-slate-200">
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

                  <p className="mt-2 text-sm text-zinc-600 dark:text-slate-300/90 leading-relaxed line-clamp-2">
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
