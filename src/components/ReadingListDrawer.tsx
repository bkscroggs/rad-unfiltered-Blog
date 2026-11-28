import { useEffect } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, Trash2, X } from 'lucide-react';
import type { BlogPost } from '../lib/posts';

interface ReadingListDrawerProps {
  isOpen: boolean;
  savedPosts: BlogPost[];
  readSlugs: string[];
  onClose: () => void;
  onOpenPost: (slug: string) => void;
  onRemoveBookmark: (slug: string) => void;
  onClearAll: () => void;
}

export function ReadingListDrawer({
  isOpen,
  savedPosts,
  readSlugs,
  onClose,
  onOpenPost,
  onRemoveBookmark,
  onClearAll,
}: ReadingListDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved reading list"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <aside className="relative z-10 w-full max-w-md h-full flex flex-col bg-white/95 dark:bg-[#0B172A]/95 backdrop-blur-xl border-l border-zinc-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-slate-800">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
              Saved Reading List
            </h2>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {savedPosts.length}{' '}
              {savedPosts.length === 1 ? 'saved article' : 'saved articles'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reading list"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedPosts.length === 0 ? (
            <div className="py-16 text-center max-w-xs mx-auto">
              <Bookmark
                className="w-7 h-7 mx-auto text-zinc-400 dark:text-slate-500 mb-3"
                aria-hidden="true"
              />
              <h3 className="font-serif text-lg font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
                Your reading list is empty
              </h3>
              <p className="mt-2 text-xs text-zinc-500 dark:text-slate-400 leading-relaxed">
                Select the bookmark icon on any article card or reading view to
                save coverage for offline shift breaks and study review.
              </p>
            </div>
          ) : (
            savedPosts.map((post) => {
              const isRead = readSlugs.includes(post.slug);
              return (
                <article
                  key={post.slug}
                  className="p-4 rounded-xl border border-zinc-200/80 dark:border-slate-800/80 bg-zinc-50/80 dark:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="font-medium text-[#1E3A8A] dark:text-[#60A5FA] truncate">
                        {post.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {post.readingTimeLabel}
                      </span>
                      {isRead && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2
                              className="w-3 h-3"
                              aria-hidden="true"
                            />
                            Read
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(post.slug)}
                      aria-label={`Remove ${post.title} from reading list`}
                      className="p-1.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <h3 className="mt-2 font-serif text-base font-semibold text-[#0A0A0A] dark:text-[#F4F4F5] leading-snug">
                    <a
                      href={`#/post/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(post.slug);
                        onClose();
                      }}
                      className="hover:text-[#1E3A8A] dark:hover:text-[#93C5FD] transition-colors"
                    >
                      {post.title}
                    </a>
                  </h3>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenPost(post.slug);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer"
                    >
                      <span>Open Article</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {savedPosts.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-500 dark:text-slate-400">
              Stored locally in your browser
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
