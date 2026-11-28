import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Search,
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
  const pulseModalities = categories.filter((c) => c !== 'All').slice(0, 6);

  // Dynamic date for the masthead strip
  const currentMonthYear = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <main className="max-w-container-max mx-auto w-full px-gutter-md sm:px-gutter-lg lg:px-gutter-xl py-gutter-xl flex-1 flex flex-col gap-section">
      {/* Editorial Masthead Strip from Stitch */}
      <div className="flex flex-wrap items-center justify-between gap-gutter-sm pb-gutter-md border-b border-light-outline/80 dark:border-dark-outline/80">
        <span className="font-label text-label-md uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Independent Radiology News · Modality Analysis · Floor-Level Commentary
        </span>
        <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
          Edition 42 · {currentMonthYear}
        </span>
      </div>

      {/* 4.1 Bento Hero Grid (12 Columns Asymmetric) */}
      {featuredPost && (
        <section
          aria-label="Featured dispatch and editorial overview"
          className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch"
        >
          {/* Left 7 Columns: Lead Story */}
          <article className="lg:col-span-7 rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <a
                href={`#/post/${featuredPost.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPost(featuredPost.slug);
                }}
                className="block aspect-video w-full overflow-hidden border-b border-light-outline dark:border-dark-outline bg-dark-surface-deep cursor-pointer"
              >
                <EditorialImage
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-image-zoom ease-image-zoom hover:scale-[1.02]"
                />
              </a>

              <div className="p-gutter-lg sm:p-gutter-xl flex flex-col gap-gutter-md">
                <div className="flex flex-wrap items-center gap-gutter-xs">
                  <span className="font-label text-label-md uppercase text-light-primary dark:text-dark-primary">
                    Featured · {featuredPost.category} · {featuredPost.formattedDate} ·{' '}
                    {featuredPost.readingTimeLabel}
                  </span>
                  <span
                    className={`font-label text-label-md uppercase ${
                      readSlugs.includes(featuredPost.slug)
                        ? 'text-success'
                        : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                  >
                    · {readSlugs.includes(featuredPost.slug) ? 'Read' : 'Unread'}
                  </span>
                </div>

                <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface dark:text-dark-on-surface text-balance hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-state-change">
                  <a
                    href={`#/post/${featuredPost.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPost(featuredPost.slug);
                    }}
                  >
                    {featuredPost.title}
                  </a>
                </h1>

                <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty max-w-[68ch]">
                  {featuredPost.summary}
                </p>
              </div>
            </div>

            <footer className="px-gutter-lg sm:px-gutter-xl py-gutter-md border-t border-light-outline dark:border-dark-outline flex items-center justify-between gap-gutter-md">
              <a
                href={`#/post/${featuredPost.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPost(featuredPost.slug);
                }}
                className="inline-flex items-center justify-center gap-gutter-sm h-10 px-gutter-lg rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label transition-colors duration-state-change hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lapis cursor-pointer"
              >
                <span className="text-label-lg">Read Article</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() => onToggleBookmark(featuredPost.slug)}
                aria-label={
                  bookmarkedSlugs.includes(featuredPost.slug)
                    ? `Remove ${featuredPost.title} from reading list`
                    : `Bookmark ${featuredPost.title}`
                }
                className="inline-flex items-center justify-center w-10 h-10 rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 text-light-on-surface-variant dark:text-dark-on-surface-variant transition-colors duration-state-change hover:text-light-primary dark:hover:text-dark-primary hover:border-lapis cursor-pointer"
              >
                <Bookmark
                  className={`w-5 h-5 ${
                    bookmarkedSlugs.includes(featuredPost.slug)
                      ? 'fill-current text-lapis'
                      : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </footer>
          </article>

          {/* Right 5 Columns: Vertical Stack */}
          <div className="lg:col-span-5 flex flex-col gap-gutter-lg justify-between">
            {/* Author Spotlight Card */}
            <article className="rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md p-gutter-lg flex flex-col gap-gutter-sm shadow-sm">
              <header className="flex flex-col gap-gutter-xs">
                <span className="font-label text-label-md uppercase text-light-primary dark:text-dark-primary">
                  Author Spotlight · Bryan Scroggs, RT(R)(CT)
                </span>
                <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface text-balance">
                  Floor-Level Clinical Reality, Unfiltered
                </h2>
              </header>
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Built from 20 years of hospital CT experience, this publication cuts
                through glossy OEM marketing to examine how imaging hardware, AI
                triage, and protocols actually behave on shift.
              </p>
              <div className="pt-gutter-xs">
                <button
                  type="button"
                  onClick={() => onOpenPost('welcome-to-radiology-unfiltered')}
                  className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-light-primary dark:text-dark-primary hover:underline cursor-pointer"
                >
                  <span>Read the Introductory Essay</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>

            {/* Modality Index Card */}
            <article className="rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md p-gutter-lg flex flex-col gap-gutter-md shadow-sm">
              <header className="flex items-center justify-between">
                <span className="font-label text-label-md uppercase text-light-primary dark:text-dark-primary">
                  Modality Index
                </span>
                <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                  {posts.length} Dispatches
                </span>
              </header>

              <div className="grid grid-cols-2 gap-gutter-sm">
                {pulseModalities.map((category) => {
                  const count = categoryCounts[category] ?? 0;
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onSelectCategory(category)}
                      className={`rounded border px-gutter-md py-gutter-sm flex items-center justify-between transition-colors duration-state-change text-left cursor-pointer ${
                        isActive
                          ? 'border-lapis bg-lapis/10 dark:bg-lapis/15'
                          : 'border-light-outline dark:border-dark-outline bg-light-surface/60 dark:bg-dark-surface/60 hover:border-lapis'
                      }`}
                    >
                      <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                        {category}
                      </span>
                      <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary tabular-nums ml-2 shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          </div>
        </section>
      )}

      {/* 4.2 Discovery & Filter Toolbar */}
      <section
        aria-label="Discovery and filter toolbar"
        className="flex flex-col gap-gutter-md border-t border-b border-light-outline dark:border-dark-outline py-gutter-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-gutter-md">
          {/* Interactive Search Input */}
          <div className="relative flex items-center flex-1 min-w-[260px] max-w-md rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md px-gutter-md py-gutter-sm focus-within:border-lapis">
            <Search
              className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-gutter-sm shrink-0"
              aria-hidden="true"
            />
            <input
              id="article-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter dispatches, modalities, or protocols..."
              className="w-full bg-transparent border-0 p-0 text-body-sm text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant dark:placeholder:text-dark-on-surface-variant focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="ml-gutter-sm p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCommandSearch}
                aria-label="Open instant search modal"
                className="ml-gutter-sm font-mono text-mono-sm px-gutter-xs py-0.5 rounded-sm border border-light-outline dark:border-dark-outline text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums hover:border-lapis cursor-pointer"
              >
                ⌘K
              </button>
            )}
          </div>

          {/* Saved Reading List & Sort Selector */}
          <div className="flex items-center gap-gutter-sm">
            <button
              type="button"
              onClick={onOpenReadingList}
              className="inline-flex items-center justify-center gap-gutter-sm px-gutter-md py-gutter-sm rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md text-light-on-surface dark:text-dark-on-surface font-label transition-colors duration-state-change hover:border-lapis cursor-pointer"
            >
              <Bookmark
                className="w-4 h-4 text-light-primary dark:text-dark-primary"
                aria-hidden="true"
              />
              <span className="text-label-lg tabular-nums">
                Saved ({bookmarkedSlugs.length})
              </span>
            </button>

            <label htmlFor="sort-select" className="sr-only">
              Sort articles
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md px-gutter-md py-gutter-sm font-label text-label-lg text-light-on-surface dark:text-dark-on-surface focus:border-lapis focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="read-asc">Shortest Read</option>
              <option value="read-desc">Longest Read</option>
            </select>
          </div>
        </div>

        {/* Modality Segmented Bar */}
        <div className="overflow-x-auto">
          <div
            role="tablist"
            aria-label="Modality categories"
            className="inline-flex items-center gap-gutter-xs p-gutter-xs rounded border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md"
          >
            {categories.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className={`px-gutter-md py-gutter-xs rounded-sm font-label whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                    selected
                      ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary'
                      : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                  }`}
                >
                  <span className="text-label-lg">{category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Empty Search / Filter State */}
      {!featuredPost && (
        <section className="py-16 text-center max-w-md mx-auto">
          <div className="p-gutter-xl rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/40 backdrop-blur-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
              No matching articles found
            </h2>
            <p className="mt-2.5 text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              No articles matched{' '}
              {normalizedQuery ? (
                <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
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
              className="mt-6 inline-flex items-center justify-center h-10 px-gutter-lg text-label-lg rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label hover:opacity-90 transition-opacity cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </section>
      )}

      {/* Recent Clinical Dispatches Grid */}
      {secondaryPosts.length > 0 && (
        <section aria-label="Recent clinical dispatches" className="flex flex-col gap-gutter-lg">
          <div className="flex items-baseline justify-between">
            <h2 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
              Recent Dispatches
            </h2>
            <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
              Showing {filteredPosts.length} of {posts.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg items-stretch">
            {secondaryPosts.map((post) => {
              const isSaved = bookmarkedSlugs.includes(post.slug);
              const isRead = readSlugs.includes(post.slug);

              return (
                <article
                  key={post.slug}
                  className="rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/80 dark:bg-dark-surface-container/35 backdrop-blur-md overflow-hidden flex flex-col justify-between transition-colors duration-state-change hover:border-lapis shadow-sm"
                >
                  <div>
                    <a
                      href={`#/post/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(post.slug);
                      }}
                      className="block aspect-video w-full overflow-hidden border-b border-light-outline dark:border-dark-outline bg-dark-surface-deep cursor-pointer"
                    >
                      <EditorialImage
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-image-zoom ease-image-zoom hover:scale-[1.02]"
                      />
                    </a>

                    <div className="p-gutter-lg flex flex-col gap-gutter-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-label text-label-md uppercase text-light-primary dark:text-dark-primary">
                          {post.category} · {post.formattedDate} · {post.readingTimeLabel} ·{' '}
                          {isRead ? 'Read' : 'Unread'}
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleBookmark(post.slug)}
                          aria-label={
                            isSaved
                              ? `Remove ${post.title} from bookmarks`
                              : `Bookmark ${post.title}`
                          }
                          className="p-1 rounded text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-primary dark:hover:text-dark-primary cursor-pointer shrink-0"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${isSaved ? 'fill-current text-lapis' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <h3 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface text-balance">
                        <a
                          href={`#/post/${post.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenPost(post.slug);
                          }}
                          className="hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-state-change"
                        >
                          {post.title}
                        </a>
                      </h3>

                      <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty line-clamp-2">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-gutter-lg py-gutter-md border-t border-light-outline/70 dark:border-dark-outline/70 flex items-center justify-between">
                    <a
                      href={`#/post/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPost(post.slug);
                      }}
                      className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-light-primary dark:text-dark-primary hover:underline cursor-pointer"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
