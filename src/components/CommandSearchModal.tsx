import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bookmark, FileText, Search, X } from 'lucide-react';
import type { BlogPost } from '../lib/posts';

interface CommandSearchModalProps {
  isOpen: boolean;
  posts: BlogPost[];
  categories: string[];
  bookmarkedSlugs: string[];
  onClose: () => void;
  onOpenPost: (slug: string, headingId?: string) => void;
  onSelectCategory: (category: string) => void;
}

interface SearchHit {
  post: BlogPost;
  matchedHeadingId?: string;
  matchedHeadingText?: string;
  snippet: string;
}

function buildSnippet(post: BlogPost, query: string): string {
  if (!query) return post.summary;
  const lower = post.plainText.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return post.summary;
  const start = Math.max(0, idx - 45);
  const end = Math.min(post.plainText.length, idx + query.length + 95);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < post.plainText.length ? '…' : '';
  return `${prefix}${post.plainText.slice(start, end)}${suffix}`;
}

export function CommandSearchModal({
  isOpen,
  posts,
  categories,
  bookmarkedSlugs,
  onClose,
  onOpenPost,
  onSelectCategory,
}: CommandSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const results = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return posts.slice(0, 5).map((post) => ({
        post,
        snippet: post.summary,
      }));
    }

    const hits: SearchHit[] = [];
    for (const post of posts) {
      const headingMatch = post.headings.find((h) =>
        h.text.toLowerCase().includes(q),
      );
      const matches =
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        Boolean(headingMatch) ||
        post.plainText.toLowerCase().includes(q);

      if (matches) {
        hits.push({
          post,
          matchedHeadingId: headingMatch?.id,
          matchedHeadingText: headingMatch?.text,
          snippet: buildSnippet(post, q),
        });
      }
    }
    return hits;
  }, [posts, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        const selected = results[activeIndex];
        if (selected) {
          e.preventDefault();
          onOpenPost(selected.post.slug, selected.matchedHeadingId);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex, onClose, onOpenPost]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instant article search"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-[#0B172A]/95 backdrop-blur-xl shadow-2xl">
        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-slate-800">
          <Search
            className="w-4 h-4 text-zinc-400 dark:text-slate-400 shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, clinical rules, modalities, or headings..."
            className="w-full bg-transparent text-sm sm:text-base text-[#0A0A0A] dark:text-[#F4F4F5] placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[58vh] overflow-y-auto p-2.5 space-y-1">
          {!query.trim() && (
            <div className="px-2.5 pt-1 pb-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-slate-400 mb-2">
                Browse by Modality
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categories
                  .filter((c) => c !== 'All')
                  .map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onSelectCategory(category);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-slate-700/80 bg-zinc-50/80 dark:bg-slate-900/60 text-zinc-700 dark:text-slate-300 hover:border-[#1E3A8A] dark:hover:border-[#60A5FA] hover:text-[#1E3A8A] dark:hover:text-[#93C5FD] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {category}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-slate-400">
            {query.trim()
              ? `${results.length} ${results.length === 1 ? 'Match' : 'Matches'}`
              : 'Latest Coverage'}
          </p>

          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-serif text-lg font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
                No matching articles
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                Try searching for CT, CCHR, photon-counting, AI triage, or
                mammography.
              </p>
            </div>
          ) : (
            results.map((hit, idx) => {
              const isSelected = idx === activeIndex;
              const isSaved = bookmarkedSlugs.includes(hit.post.slug);
              return (
                <button
                  key={hit.post.slug}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onOpenPost(hit.post.slug, hit.matchedHeadingId);
                    onClose();
                  }}
                  className={`w-full text-left flex items-start justify-between gap-4 px-3.5 py-3 rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100/90 dark:bg-slate-800/80'
                      : 'hover:bg-zinc-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-slate-400">
                      <span className="font-medium text-[#1E3A8A] dark:text-[#60A5FA]">
                        {hit.post.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {hit.post.readingTimeLabel}
                      </span>
                      {isSaved && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-slate-200">
                            <Bookmark
                              className="w-3 h-3 fill-current"
                              aria-hidden="true"
                            />
                            Saved
                          </span>
                        </>
                      )}
                    </div>

                    <p className="mt-1 font-serif text-base font-semibold text-[#0A0A0A] dark:text-[#F4F4F5] line-clamp-1">
                      {hit.post.title}
                    </p>

                    {hit.matchedHeadingText ? (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-slate-300">
                        <FileText className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          Section: {hit.matchedHeadingText}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400 line-clamp-1">
                        {hit.snippet}
                      </p>
                    )}
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 mt-3 transition-opacity ${
                      isSelected
                        ? 'opacity-100 text-[#1E3A8A] dark:text-[#60A5FA]'
                        : 'opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Hint Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] font-mono text-zinc-500 dark:text-slate-400 border-t border-zinc-200 dark:border-slate-800 bg-zinc-50/70 dark:bg-[#081221]/80">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>Esc Close</span>
          </div>
          <span className="tabular-nums">{posts.length} indexed</span>
        </div>
      </div>
    </div>
  );
}
