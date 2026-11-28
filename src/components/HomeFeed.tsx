import {
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  CheckCircle2,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import type { BlogPost } from '../lib/posts';
import type { SortOption } from '../lib/preferences';
import { EditorialImage } from './EditorialImage';

interface HomeFeedProps {
  posts: BlogPost[];
  categories: string[];
  categoryCounts: Record<string, number>;
  activeCategory: string;
  searchQuery: string;
  sortBy: SortOption;
  bookmarkedSlugs: string[];
  readSlugs: string[];
  onSelectCategory: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onToggleBookmark: (slug: string) => void;
  onOpenReadingList: () => void;
  onOpenCommandSearch: () => void;
  onOpenPost: (slug: string) => void;
}

export function HomeFeed({
  posts,
  categories,
  categoryCounts,
  activeCategory,
  searchQuery,
  sortBy,
  bookmarkedSlugs,
  readSlugs,
  onSelectCategory,
  onSearchChange,
  onSortChange,
  onToggleBookmark,
  onOpenReadingList,
  onOpenCommandSearch,
  onOpenPost,
}: HomeFeedProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory =
        activeCategory === 'All' || post.category === activeCategory;
      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;
      return (
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.summary.toLowerCase().includes(normalizedQuery) ||
        post.category.toLowerCase().includes(normalizedQuery) ||
        post.plainText.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'read-asc':
          return a.readingTimeMinutes - b.readingTimeMinutes;
        case 'read-desc':
          return b.readingTimeMinutes - a.readingTimeMinutes;
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const featuredPost = filteredPosts[0] ?? null;
  const secondaryPosts = filteredPosts.slice(1);
  const introPostExists = posts.some(
    (p) => p.slug === 'welcome-to-radiology-unfiltered',
  );

  const pulseModalities = categories.filter((c) => c !== 'All').slice(0, 6);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20">
      {/* Masthead */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-slate-400 mb-3">
              Independent Radiology News &amp; Educational Commentary
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold tracking-tight leading-[1.1] text-[#0A0A0A] dark:text-[#F4F4F5]">
              Radiology Unfiltered
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-slate-300/90 leading-relaxed">
              Candid coverage of radiology news, clinical imaging advancements,
              and modality innovations across CT, MRI, X-ray, Mammography,
              Ultrasound, Nuclear Medicine, Interventional Radiology, and
              Radiology AI.
            </p>
          </div>

          {/* Quick Utility Cluster: Search + Command-K + Saved Reading List */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            <div className="relative flex items-center flex-1 sm:w-64 lg:w-72">
              <label htmlFor="editorial-search" className="sr-only">
                Search articles
              </label>
              <Search
                className="w-4 h-4 text-zinc-400 dark:text-slate-400 absolute left-3.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="editorial-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter feed..."
                className="w-full min-h-[42px] pl-10 pr-16 py-2 text-sm bg-white/80 dark:bg-[#0D192B]/70 backdrop-blur-md text-[#0A0A0A] dark:text-[#F4F4F5] placeholder:text-zinc-400 dark:placeholder:text-slate-400 border border-zinc-200/90 dark:border-slate-700/80 rounded-lg focus:outline-none focus:border-[#1E3A8A] dark:focus:border-[#60A5FA] transition-colors"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCommandSearch}
                  aria-label="Open instant search modal"
                  className="absolute right-2 px-1.5 py-0.5 text-[11px] font-mono rounded border border-zinc-200 dark:border-slate-700 bg-zinc-100/80 dark:bg-slate-800/80 text-zinc-500 dark:text-slate-300 hover:text-[#1E3A8A] dark:hover:text-[#60A5FA] transition-colors cursor-pointer"
                >
                  ⌘K
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenReadingList}
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-200/90 dark:border-slate-700/80 bg-white/80 dark:bg-[#0D192B]/70 backdrop-blur-md text-zinc-800 dark:text-slate-200 hover:border-[#1E3A8A] dark:hover:border-[#60A5FA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  bookmarkedSlugs.length > 0
                    ? 'fill-[#1E3A8A] text-[#1E3A8A] dark:fill-[#60A5FA] dark:text-[#60A5FA]'
                    : ''
                }`}
                aria-hidden="true"
              />
              <span>Saved</span>
              <span className="font-mono tabular-nums text-zinc-500 dark:text-slate-400">
                ({bookmarkedSlugs.length})
              </span>
            </button>
          </div>
        </div>

        {/* Discovery Filter & Sort Bar */}
        <div className="mt-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter articles by modality category"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/70 dark:bg-[#0D192B]/65 backdrop-blur-md border border-zinc-200/80 dark:border-slate-800/80 rounded-xl"
          >
            {categories.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  aria-pressed={selected}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA] ${
                    selected
                      ? 'bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A]'
                      : 'text-zinc-600 dark:text-slate-300 hover:text-[#0A0A0A] dark:hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
            <div className="inline-flex items-center gap-2">
              <ArrowUpDown
                className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="sort-select" className="sr-only">
                Sort articles
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200/90 dark:border-slate-700/80 bg-white/80 dark:bg-[#0D192B]/70 text-zinc-800 dark:text-slate-200 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-[#60A5FA] cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="read-asc">Shortest Read</option>
                <option value="read-desc">Longest Read</option>
              </select>
            </div>

            <p className="text-xs text-zinc-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
              {filteredPosts.length}{' '}
              {filteredPosts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </div>
      </section>

      {/* Empty Search / Filter State */}
      {!featuredPost && (
        <section className="py-16 text-center max-w-md mx-auto">
          <div className="p-8 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-[#0D192B]/60 backdrop-blur-md">
            <h2 className="font-serif text-2xl font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
              No matching articles found
            </h2>
            <p className="mt-2.5 text-sm text-zinc-600 dark:text-slate-400 leading-relaxed">
              No articles matched{' '}
              {normalizedQuery ? (
                <span className="font-medium text-zinc-900 dark:text-slate-200">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              ) : (
                <span>{activeCategory}</span>
              )}
              . Clear the filters to browse all available coverage.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('All');
              }}
              className="mt-6 inline-flex items-center justify-center min-h-[40px] px-5 py-2 text-xs font-medium rounded-lg bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </section>
      )}

      {/* Tier 1: Glassmorphic Bento Hero */}
      {featuredPost && (
        <section className="pt-8 sm:pt-10 pb-12 border-b border-zinc-200/80 dark:border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-6">
            {/* Primary Lead Story Card */}
            <article className="lg:col-span-7 group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D192B]/65 backdrop-blur-md shadow-sm">
              <a
                href={`#/post/${featuredPost.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPost(featuredPost.slug);
                }}
                className="block overflow-hidden border-b border-zinc-200/70 dark:border-slate-800/80 bg-zinc-100 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
              >
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <EditorialImage
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    loading="eager"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </a>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
                      <span className="font-medium uppercase tracking-wider text-[#1E3A8A] dark:text-[#60A5FA]">
                        Featured
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredPost.category}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={featuredPost.date}>
                        {featuredPost.formattedDate}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {featuredPost.readingTimeLabel}
                      </span>
                      {readSlugs.includes(featuredPost.slug) && (
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
                      onClick={() => onToggleBookmark(featuredPost.slug)}
                      aria-label={
                        bookmarkedSlugs.includes(featuredPost.slug)
                          ? `Remove ${featuredPost.title} from reading list`
                          : `Save ${featuredPost.title} to reading list`
                      }
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200/80 dark:border-slate-700/80 bg-zinc-50/70 dark:bg-slate-900/60 text-zinc-600 dark:text-slate-300 hover:border-[#1E3A8A] dark:hover:border-[#60A5FA] transition-colors cursor-pointer shrink-0"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          bookmarkedSlugs.includes(featuredPost.slug)
                            ? 'fill-[#1E3A8A] text-[#1E3A8A] dark:fill-[#60A5FA] dark:text-[#60A5FA]'
                            : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <h2 className="mt-4 font-serif text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold tracking-tight leading-[1.15] text-[#0A0A0A] dark:text-[#F4F4F5]">
                    <a
                      href={`#/post/${featuredPost.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(featuredPost.slug);
                      }}
                      className="hover:text-[#1E3A8A] dark:hover:text-[#93C5FD] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                    >
                      {featuredPost.title}
                    </a>
                  </h2>

                  <p className="mt-3.5 text-sm sm:text-base text-zinc-600 dark:text-slate-300 leading-relaxed">
                    {featuredPost.summary}
                  </p>
                </div>

                <div className="mt-6 pt-2">
                  <a
                    href={`#/post/${featuredPost.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPost(featuredPost.slug);
                    }}
                    className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium rounded-lg bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] hover:bg-[#1E3A8A] dark:hover:bg-[#93C5FD] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>

            {/* Right Bento Stack: Author Spotlight + Modality Pulse */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Bryan Scroggs Author Spotlight Card */}
              <section
                aria-label="Author spotlight"
                className="p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D192B]/65 backdrop-blur-md shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E3A8A] dark:text-[#60A5FA]">
                    Editor&rsquo;s Note
                  </p>
                  <UserCheck
                    className="w-4 h-4 text-zinc-400 dark:text-slate-400"
                    aria-hidden="true"
                  />
                </div>

                <h2 className="mt-2.5 font-serif text-xl font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
                  Bryan Scroggs
                </h2>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">
                  20 Years Hospital CT Technologist · Founder
                </p>

                <p className="mt-3 text-sm text-zinc-600 dark:text-slate-300 leading-relaxed">
                  Bridging the gap between glossy vendor press releases and what
                  actually happens on the hospital floor at 2:00 AM—grounded in
                  verified clinical studies, FDA clearances, and day-to-day
                  imaging workflow reality.
                </p>

                {introPostExists && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenPost('welcome-to-radiology-unfiltered')
                    }
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    <span>Read Bryan&rsquo;s Introduction</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </section>

              {/* Modality Pulse Quick-Filter Grid */}
              <section
                aria-label="Coverage by modality"
                className="p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D192B]/65 backdrop-blur-md shadow-sm flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-slate-400">
                      Modality Index
                    </h2>
                    <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-slate-400">
                      {posts.length} Total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pulseModalities.map((category) => {
                      const count = categoryCounts[category] ?? 0;
                      const isActive = activeCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => onSelectCategory(category)}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 text-left text-xs rounded-lg border transition-colors cursor-pointer ${
                            isActive
                              ? 'border-[#1E3A8A] dark:border-[#60A5FA] bg-[#1E3A8A]/10 dark:bg-[#60A5FA]/15 text-[#0A0A0A] dark:text-white font-medium'
                              : 'border-zinc-200/80 dark:border-slate-800/80 bg-zinc-50/70 dark:bg-slate-900/45 text-zinc-700 dark:text-slate-300 hover:border-zinc-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate">{category}</span>
                          <span className="font-mono tabular-nums text-[11px] text-zinc-500 dark:text-slate-400 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
                  <span>Press ⌘K anytime to search</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('All')}
                    className="font-medium text-[#1E3A8A] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    View All
                  </button>
                </div>
              </section>
            </div>
          </div>
        </section>
      )}

      {/* Tier 2: Secondary Coverage Grid */}
      {secondaryPosts.length > 0 && (
        <section className="pt-12">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F4F4F5]">
              Recent Coverage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {secondaryPosts.map((post) => {
              const isSaved = bookmarkedSlugs.includes(post.slug);
              const isRead = readSlugs.includes(post.slug);

              return (
                <article
                  key={post.slug}
                  className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D192B]/60 backdrop-blur-md shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5"
                >
                  <div>
                    <a
                      href={`#/post/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(post.slug);
                      }}
                      className="block overflow-hidden rounded-xl border border-zinc-200/80 dark:border-slate-800/80 bg-zinc-100 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <EditorialImage
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                    </a>

                    <div className="mt-5 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400 min-w-0">
                        <span className="font-medium text-zinc-800 dark:text-slate-200">
                          {post.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.date}>{post.formattedDate}</time>
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
                        onClick={() => onToggleBookmark(post.slug)}
                        aria-label={
                          isSaved
                            ? `Remove ${post.title} from reading list`
                            : `Save ${post.title} to reading list`
                        }
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isSaved
                              ? 'fill-[#1E3A8A] text-[#1E3A8A] dark:fill-[#60A5FA] dark:text-[#60A5FA]'
                              : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <h3 className="mt-2.5 font-serif text-xl sm:text-2xl font-semibold tracking-tight leading-snug text-[#0A0A0A] dark:text-[#F4F4F5]">
                      <a
                        href={`#/post/${post.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenPost(post.slug);
                        }}
                        className="hover:text-[#1E3A8A] dark:hover:text-[#93C5FD] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                      >
                        {post.title}
                      </a>
                    </h3>

                    <p className="mt-2.5 text-sm text-zinc-600 dark:text-slate-300/90 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-200/60 dark:border-slate-800/70">
                    <a
                      href={`#/post/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(post.slug);
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
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
