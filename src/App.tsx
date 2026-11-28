/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { ArticleView } from './components/ArticleView';
import { CommandSearchModal } from './components/CommandSearchModal';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HomeFeed } from './components/HomeFeed';
import { LightboxModal, type LightboxImageData } from './components/LightboxModal';
import { MobileNavDrawer } from './components/MobileNavDrawer';
import { ReadingListDrawer } from './components/ReadingListDrawer';
import {
  ALL_POSTS,
  getAllCategories,
  getCategoryCounts,
  getPostBySlug,
} from './lib/posts';
import {
  loadBookmarks,
  loadReaderPrefs,
  loadReadHistory,
  saveBookmarks,
  saveReaderPrefs,
  saveReadHistory,
  type ReaderPreferences,
  type SortOption,
} from './lib/preferences';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ThemeMode = 'light' | 'dark';

function parseHashRoute(): { view: 'home' } | { view: 'post'; slug: string } {
  const hash = window.location.hash || '#/';
  const postMatch = hash.match(/^#\/post\/([^/?#]+)/);
  if (postMatch && postMatch[1]) {
    return { view: 'post', slug: decodeURIComponent(postMatch[1]) };
  }
  return { view: 'home' };
}

function getInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export default function App() {
  const [route, setRoute] = useState(parseHashRoute);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [readingProgress, setReadingProgress] = useState<number | null>(null);

  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>(loadBookmarks);
  const [readSlugs, setReadSlugs] = useState<string[]>(loadReadHistory);
  const [readerPrefs, setReaderPrefs] =
    useState<ReaderPreferences>(loadReaderPrefs);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReadingListOpen, setIsReadingListOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<LightboxImageData | null>(
    null,
  );

  const categories = getAllCategories();
  const categoryCounts = getCategoryCounts();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut for instant search
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('monograph-theme', theme);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [theme]);

  const activePost =
    route.view === 'post' ? getPostBySlug(route.slug) : undefined;

  useEffect(() => {
    if (route.view === 'post' && activePost) {
      document.title = `${activePost.title} — Radiology Unfiltered`;
      setReadSlugs((prev) => {
        if (prev.includes(activePost.slug)) return prev;
        const next = [...prev, activePost.slug];
        saveReadHistory(next);
        return next;
      });
    } else {
      document.title = 'Radiology Unfiltered';
      setReadingProgress(null);
    }
  }, [route, activePost]);

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.hash || '#/'}`,
    });
  }, [route, activePost]);

  const navigateHome = useCallback((category?: string) => {
    if (category) {
      setActiveCategory(category);
    }
    if (window.location.hash !== '#/' && window.location.hash !== '') {
      window.location.hash = '#/';
    } else {
      setRoute({ view: 'home' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const navigateToPost = useCallback((slug: string, headingId?: string) => {
    const targetHash = `#/post/${encodeURIComponent(slug)}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setRoute({ view: 'post', slug });
      if (!headingId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    if (headingId) {
      window.setTimeout(() => {
        document.getElementById(headingId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 120);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarkedSlugs((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [slug, ...prev];
      saveBookmarks(next);
      return next;
    });
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarkedSlugs([]);
    saveBookmarks([]);
  }, []);

  const updateReaderPrefs = useCallback((nextPrefs: ReaderPreferences) => {
    setReaderPrefs(nextPrefs);
    saveReaderPrefs(nextPrefs);
  }, []);

  const savedPosts = bookmarkedSlugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));

  const relatedPosts = activePost
    ? ALL_POSTS.filter((p) => p.slug !== activePost.slug).slice(0, 2)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#01060f] dark:bg-[linear-gradient(to_bottom,#05204d,#01060f)] dark:bg-fixed dark:text-[#F4F4F5] transition-colors duration-200">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeCategory={route.view === 'home' ? activeCategory : ''}
        onNavigateHome={navigateHome}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        readingProgress={
          route.view === 'post' && activePost ? readingProgress : null
        }
      />

      <div className="flex-1">
        {route.view === 'home' && (
          <HomeFeed
            posts={ALL_POSTS}
            categories={categories}
            categoryCounts={categoryCounts}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            sortBy={sortBy}
            bookmarkedSlugs={bookmarkedSlugs}
            readSlugs={readSlugs}
            onSelectCategory={setActiveCategory}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            onToggleBookmark={toggleBookmark}
            onOpenReadingList={() => setIsReadingListOpen(true)}
            onOpenCommandSearch={() => setIsSearchOpen(true)}
            onOpenPost={navigateToPost}
          />
        )}

        {route.view === 'post' && activePost && (
          <ArticleView
            post={activePost}
            relatedPosts={relatedPosts}
            isBookmarked={bookmarkedSlugs.includes(activePost.slug)}
            readerPrefs={readerPrefs}
            onUpdateReaderPrefs={updateReaderPrefs}
            onToggleBookmark={toggleBookmark}
            onOpenCommandSearch={() => setIsSearchOpen(true)}
            onZoomImage={setLightboxImage}
            onBackHome={() => navigateHome()}
            onOpenPost={navigateToPost}
            onProgressChange={setReadingProgress}
          />
        )}

        {route.view === 'post' && !activePost && (
          <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-slate-400">
              Archive Notice
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
              Article Not Found
            </h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              The requested article could not be located in the current archive.
            </p>
            <button
              type="button"
              onClick={() => navigateHome('All')}
              className="mt-6 inline-flex items-center justify-center min-h-[40px] px-5 py-2 text-xs font-medium rounded-lg bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Return to All Articles
            </button>
          </main>
        )}
      </div>

      <Footer onNavigateHome={navigateHome} />

      <CommandSearchModal
        isOpen={isSearchOpen}
        posts={ALL_POSTS}
        categories={categories}
        bookmarkedSlugs={bookmarkedSlugs}
        onClose={() => setIsSearchOpen(false)}
        onOpenPost={navigateToPost}
        onSelectCategory={(cat) => navigateHome(cat)}
      />

      <ReadingListDrawer
        isOpen={isReadingListOpen}
        savedPosts={savedPosts}
        readSlugs={readSlugs}
        onClose={() => setIsReadingListOpen(false)}
        onOpenPost={navigateToPost}
        onRemoveBookmark={toggleBookmark}
        onClearAll={clearAllBookmarks}
      />

      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        theme={theme}
        categories={categories}
        categoryCounts={categoryCounts}
        activeCategory={activeCategory}
        bookmarkCount={bookmarkedSlugs.length}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectCategory={(cat) => navigateHome(cat)}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenReadingList={() => setIsReadingListOpen(true)}
      />

      <LightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
