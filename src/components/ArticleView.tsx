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
    <article className="max-w-container-max mx-auto px-gutter-md sm:px-gutter-lg lg:px-gutter-xl pt-gutter-lg sm:pt-gutter-xl pb-section">
      {/* Top Action Bar: Back + Reader Comfort Controls */}
      <div className="mb-gutter-lg flex flex-wrap items-center justify-between gap-gutter-md">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-gutter-xs min-h-[40px] px-gutter-sm text-label-lg font-label text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface rounded transition-colors cursor-pointer whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-lapis"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Articles</span>
        </button>

        {/* Reader Comfort Toolbar */}
        <div className="flex flex-wrap items-center gap-gutter-xs p-gutter-xs rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/70 backdrop-blur-md">
          {/* Font Size Controls */}
          <div
            role="group"
            aria-label="Reader text size"
            className="flex items-center gap-0.5 pr-gutter-xs border-r border-light-outline dark:border-dark-outline"
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
                  className={`min-w-[32px] min-h-[32px] px-2 text-label-lg font-label rounded-sm transition-colors cursor-pointer ${
                    selected
                      ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary'
                      : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-zinc-100 dark:hover:bg-slate-800'
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
            className={`inline-flex items-center gap-1.5 min-h-[32px] px-gutter-sm text-label-lg font-label rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
              isWide
                ? 'bg-lapis/10 text-lapis dark:bg-lapis/20 dark:text-lapis-light'
                : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-zinc-100 dark:hover:bg-slate-800'
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
            className="inline-flex items-center gap-1.5 min-h-[32px] px-gutter-sm text-label-lg font-label rounded-sm text-light-on-surface dark:text-dark-on-surface hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isBookmarked
                  ? 'fill-current text-lapis'
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
            className="inline-flex items-center gap-1.5 min-h-[32px] px-gutter-sm text-label-lg font-label rounded-sm text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline font-mono text-mono-sm">⌘K</span>
          </button>
        </div>
      </div>

      {/* Article Masthead */}
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-gutter-xs text-label-md font-label uppercase text-light-primary dark:text-dark-primary">
          <span>{post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{post.formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{post.readingTimeLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{post.wordCount} words</span>
        </div>

        <h1 className="mt-gutter-sm font-headline text-headline-lg-mobile md:text-headline-lg lg:text-[48px] lg:leading-[52px] font-semibold tracking-tight text-light-on-surface dark:text-dark-on-surface text-balance">
          {post.title}
        </h1>

        <p className="mt-gutter-md font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty leading-relaxed">
          {post.summary}
        </p>
      </header>

      {/* Cover Photograph with Lightbox Zoom */}
      <figure className="group relative mt-gutter-lg sm:mt-gutter-xl overflow-hidden rounded-md border border-light-outline dark:border-dark-outline bg-dark-surface-deep shadow-sm">
        <div className="aspect-video w-full overflow-hidden">
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
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-label-lg font-label rounded bg-black/75 text-white backdrop-blur-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
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
          } lg:sticky lg:top-24 space-y-gutter-md`}
        >
          {post.headings.length > 0 && (
            <div className="p-gutter-lg rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md shadow-sm">
              <h2 className="font-label text-label-md uppercase text-light-primary dark:text-dark-primary mb-gutter-sm">
                In This Article
              </h2>
              <nav aria-label="Table of contents">
                <ul className="space-y-2 text-body-sm font-body">
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
                          className={`text-left transition-colors duration-state-change leading-snug cursor-pointer ${
                            isActive
                              ? 'font-semibold text-light-primary dark:text-dark-primary'
                              : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
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

          <div className="p-gutter-lg rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md shadow-sm">
            <h2 className="font-label text-label-md uppercase text-light-primary dark:text-dark-primary mb-gutter-sm">
              Colophon
            </h2>
            <dl className="space-y-2.5 text-body-sm">
              <div className="flex justify-between gap-4 py-1 border-b border-light-outline/70 dark:border-dark-outline/70">
                <dt className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Section</dt>
                <dd className="font-medium text-light-on-surface dark:text-dark-on-surface text-right">
                  {post.category}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1 border-b border-light-outline/70 dark:border-dark-outline/70">
                <dt className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Published</dt>
                <dd className="font-medium text-light-on-surface dark:text-dark-on-surface text-right">
                  {post.formattedDate}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1 border-b border-light-outline/70 dark:border-dark-outline/70">
                <dt className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Length</dt>
                <dd className="font-mono text-mono-sm font-medium text-light-on-surface dark:text-dark-on-surface tabular-nums text-right">
                  {post.wordCount} words ({post.readingTimeLabel})
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="mt-gutter-md w-full inline-flex items-center justify-center gap-gutter-xs h-10 px-gutter-md text-label-lg font-label rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/70 text-light-on-surface dark:text-dark-on-surface hover:border-lapis transition-colors duration-state-change cursor-pointer whitespace-nowrap"
            >
              {linkCopied ? (
                <>
                  <Check
                    className="w-4 h-4 text-success"
                    aria-hidden="true"
                  />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" aria-hidden="true" />
                  <span>Copy Article Link</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Continue Reading Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-section pt-gutter-xl border-t border-light-outline/80 dark:border-dark-outline/80">
          <h2 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface mb-gutter-lg">
            Continue Reading
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg">
            {relatedPosts.map((related) => (
              <article
                key={related.slug}
                className="rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/35 backdrop-blur-md p-gutter-lg flex flex-col justify-between shadow-sm transition-colors duration-state-change hover:border-lapis"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-gutter-xs text-label-md font-label uppercase text-light-primary dark:text-dark-primary">
                    <span>{related.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={related.date}>{related.formattedDate}</time>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{related.readingTimeLabel}</span>
                  </div>

                  <h3 className="mt-gutter-xs font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface text-balance">
                    <a
                      href={`#/post/${related.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(related.slug);
                      }}
                      className="hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-state-change"
                    >
                      {related.title}
                    </a>
                  </h3>

                  <p className="mt-gutter-xs font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty line-clamp-2">
                    {related.summary}
                  </p>
                </div>

                <div className="mt-gutter-md pt-gutter-sm border-t border-light-outline/70 dark:border-dark-outline/70">
                  <a
                    href={`#/post/${related.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPost(related.slug);
                    }}
                    className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-light-primary dark:text-dark-primary hover:underline whitespace-nowrap cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
