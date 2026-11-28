import { Menu, Moon, Sun } from 'lucide-react';
import { resolveAssetPath } from '../utils/assets';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeCategory: string;
  onNavigateHome: (category?: string) => void;
  onOpenMobileMenu: () => void;
  readingProgress?: number | null;
}

const NAV_ITEMS = [
  { label: 'Articles', category: 'All' },
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
  onOpenMobileMenu,
  readingProgress = null,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-light-outline/80 dark:border-dark-outline/80 bg-light-surface/90 dark:bg-dark-surface/85 backdrop-blur-xl">
      <div className="max-w-container-max mx-auto px-gutter-md sm:px-gutter-lg lg:px-gutter-xl h-14 sm:h-16 flex items-center justify-between gap-gutter-md">
        {/* Zone 1: Site Logo + Wordmark */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome('All');
          }}
          className="group flex items-center gap-2.5 sm:gap-3 font-display text-headline-sm text-light-on-surface dark:text-dark-on-surface whitespace-nowrap tracking-tight hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-state-change"
        >
          <img
            src={resolveAssetPath('images/logo.png')}
            alt="Radiology Unfiltered Logo"
            className="h-8 w-auto sm:h-9 object-contain drop-shadow-sm transition-transform duration-state-change group-hover:scale-105"
          />
          <span>Radiology Unfiltered</span>
        </a>

        {/* Zone 2: Primary Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-gutter-lg"
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
                className={`font-label text-label-lg py-gutter-xs whitespace-nowrap transition-colors duration-state-change ${
                  isActive
                    ? 'text-light-primary dark:text-dark-primary border-b-2 border-light-primary dark:border-dark-primary'
                    : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                }`}
              >
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-gutter-sm">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle light or dark reading theme"
            className="inline-flex items-center justify-center w-10 h-10 rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/75 backdrop-blur-md text-light-on-surface-variant dark:text-dark-on-surface-variant transition-colors duration-state-change hover:text-light-primary dark:hover:text-dark-primary hover:border-lapis cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lapis"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-light-primary" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/75 text-light-on-surface-variant dark:text-dark-on-surface-variant cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 2px Reading Depth Progress Bar */}
      {readingProgress !== null && (
        <div
          aria-hidden="true"
          className="w-full h-0.5 bg-light-outline-variant/40 dark:bg-dark-outline-variant/60"
        >
          <div
            className="h-full bg-light-primary dark:bg-dark-primary transition-all duration-state-change"
            style={{
              width: `${Math.min(100, Math.max(0, readingProgress))}%`,
            }}
          />
        </div>
      )}
    </header>
  );
}
