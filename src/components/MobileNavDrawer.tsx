import { useEffect } from 'react';
import { Bookmark, Moon, Search, Sun, X } from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  categories: string[];
  categoryCounts: Record<string, number>;
  activeCategory: string;
  bookmarkCount: number;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenReadingList: () => void;
}

export function MobileNavDrawer({
  isOpen,
  theme,
  categories,
  categoryCounts,
  activeCategory,
  bookmarkCount,
  onClose,
  onSelectCategory,
  onToggleTheme,
  onOpenSearch,
  onOpenReadingList,
}: MobileNavDrawerProps) {
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
      aria-label="Mobile navigation menu"
      className="fixed inset-0 z-50 flex justify-end md:hidden"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
      />

      <aside className="relative z-10 w-full max-w-xs h-full flex flex-col bg-white/95 dark:bg-[#0B172A]/95 backdrop-blur-xl border-l border-zinc-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-slate-800">
          <span className="font-serif text-lg font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
            Radiology Unfiltered
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Utilities */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between min-h-[44px] px-3.5 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-slate-700/80 bg-zinc-50/80 dark:bg-slate-900/60 text-zinc-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                Instant Search
              </span>
              <span className="text-[11px] font-mono text-zinc-400">⌘K</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReadingList();
              }}
              className="w-full flex items-center justify-between min-h-[44px] px-3.5 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-slate-700/80 bg-zinc-50/80 dark:bg-slate-900/60 text-zinc-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                Saved Reading List
              </span>
              <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-slate-400">
                {bookmarkCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between min-h-[44px] px-3.5 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-slate-700/80 bg-zinc-50/80 dark:bg-slate-900/60 text-zinc-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
                )}
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </span>
            </button>
          </div>

          {/* Modalities Directory */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-slate-400 mb-2.5">
              Modalities &amp; Sections
            </p>
            <nav aria-label="Mobile category sections" className="space-y-1">
              {categories.map((category) => {
                const selected = activeCategory === category;
                const count = categoryCounts[category] ?? 0;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      onSelectCategory(category);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between min-h-[44px] px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] font-medium'
                        : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="truncate">{category}</span>
                    <span
                      className={`text-xs font-mono tabular-nums ml-2 ${
                        selected
                          ? 'opacity-80'
                          : 'text-zinc-400 dark:text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-zinc-200 dark:border-slate-800 text-xs text-zinc-500 dark:text-slate-400">
          <p className="font-medium text-zinc-900 dark:text-slate-200">
            Bryan Scroggs
          </p>
          <p className="mt-0.5">
            20 Years Hospital CT Technologist · Independent Editor
          </p>
        </div>
      </aside>
    </div>
  );
}
