/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { ArticleView } from './components/ArticleView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HomeFeed } from './components/HomeFeed';
import { ALL_POSTS, getAllCategories, getPostBySlug } from './lib/posts';

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
  const [readingProgress, setReadingProgress] = useState<number | null>(null);

  const categories = getAllCategories();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
    } else {
      document.title = 'Radiology Unfiltered';
      setReadingProgress(null);
    }
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

  const navigateToPost = useCallback((slug: string) => {
    const targetHash = `#/post/${encodeURIComponent(slug)}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setRoute({ view: 'post', slug });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const relatedPosts = activePost
    ? ALL_POSTS.filter((p) => p.slug !== activePost.slug).slice(0, 2)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#01060f] dark:bg-[linear-gradient(to_bottom,#081221,#01060f)] dark:bg-fixed dark:text-[#F4F4F5] transition-colors duration-200">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeCategory={route.view === 'home' ? activeCategory : ''}
        onNavigateHome={navigateHome}
        readingProgress={route.view === 'post' && activePost ? readingProgress : null}
      />

      <div className="flex-1">
        {route.view === 'home' && (
          <HomeFeed
            posts={ALL_POSTS}
            categories={categories}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSelectCategory={setActiveCategory}
            onSearchChange={setSearchQuery}
            onOpenPost={navigateToPost}
          />
        )}

        {route.view === 'post' && activePost && (
          <ArticleView
            post={activePost}
            relatedPosts={relatedPosts}
            onBackHome={() => navigateHome()}
            onOpenPost={navigateToPost}
            onProgressChange={setReadingProgress}
          />
        )}

        {route.view === 'post' && !activePost && (
          <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Archive Notice
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
              Article Not Found
            </h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              The requested article could not be located in the current archive.
            </p>
            <button
              type="button"
              onClick={() => navigateHome('All')}
              className="mt-6 inline-flex items-center justify-center min-h-[40px] px-5 py-2 text-xs font-medium rounded-md bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Return to All Articles
            </button>
          </main>
        )}
      </div>

      <Footer onNavigateHome={navigateHome} />
    </div>
  );
}
