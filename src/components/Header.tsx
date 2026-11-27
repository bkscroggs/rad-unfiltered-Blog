import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeCategory: string;
  onNavigateHome: (category?: string) => void;
  readingProgress?: number | null;
}

const NAV_ITEMS = [
  { label: 'All Coverage', category: 'All' },
  { label: 'CT & Spectral', category: 'CT & Spectral Imaging' },
  { label: 'MRI', category: 'MRI' },
  { label: 'Mammography', category: "Mammography & Women's Imaging" },
  { label: 'Radiology AI', category: 'Radiology AI' },
];

export function Header({
  theme,
  onToggleTheme,
  activeCategory,
  onNavigateHome,
  readingProgress = null,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0B0C0E]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome('All');
          }}
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F4F4F5] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA] rounded-sm"
        >
          Radiology Unfiltered
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeCategory === item.category;
            return (
              <a
                key={item.label}
                href="#/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateHome(item.category);
                }}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA] rounded-sm ${
                  isActive
                    ? 'text-[#0A0A0A] dark:text-[#F4F4F5] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[#1E3A8A] dark:after:bg-[#60A5FA]'
                    : ''
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary theme action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161A] text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#1E3A8A]" aria-hidden="true" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {readingProgress !== null && (
        <div
          aria-hidden="true"
          className="h-[2px] w-full bg-transparent overflow-hidden"
        >
          <div
            className="h-full bg-[#1E3A8A] dark:bg-[#60A5FA] origin-left transition-transform duration-150 ease-out"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, readingProgress / 100))})`,
            }}
          />
        </div>
      )}
    </header>
  );
}
