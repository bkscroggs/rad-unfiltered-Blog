import { ArrowRight, Search, X } from 'lucide-react';
import type { BlogPost } from '../lib/posts';
import { EditorialImage } from './EditorialImage';

interface HomeFeedProps {
  posts: BlogPost[];
  categories: string[];
  activeCategory: string;
  searchQuery: string;
  onSelectCategory: (category: string) => void;
  onSearchChange: (query: string) => void;
  onOpenPost: (slug: string) => void;
}

export function HomeFeed({
  posts,
  categories,
  activeCategory,
  searchQuery,
  onSelectCategory,
  onSearchChange,
  onOpenPost,
}: HomeFeedProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === 'All' || post.category === activeCategory;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;
    return (
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.summary.toLowerCase().includes(normalizedQuery) ||
      post.category.toLowerCase().includes(normalizedQuery) ||
      post.content.toLowerCase().includes(normalizedQuery)
    );
  });

  const featuredPost = filteredPosts[0] ?? null;
  const secondaryPosts = filteredPosts.slice(1);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20">
      {/* Masthead & Search/Filter Toolbar */}
      <section className="pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 mb-3">
              Independent Radiology News &amp; Educational Commentary
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.12] text-[#0A0A0A] dark:text-[#F4F4F5]">
              Radiology Unfiltered
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Candid coverage of radiology news, clinical imaging advancements,
              and modality innovations across CT, MRI, X-ray, Mammography,
              Ultrasound, Nuclear Medicine, Interventional Radiology, and
              Radiology AI.
            </p>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <label htmlFor="editorial-search" className="sr-only">
              Search articles
            </label>
            <div className="relative flex items-center">
              <Search
                className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="editorial-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search modalities, studies, headlines..."
                className="w-full min-h-[42px] pl-10 pr-9 py-2 text-sm bg-white dark:bg-[#14161A] text-[#0A0A0A] dark:text-[#F4F4F5] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-[#1E3A8A] dark:focus:border-[#60A5FA] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Category Filter Bar & Live Count */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter articles by modality category"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-[#14161A] border border-zinc-200/80 dark:border-zinc-800 rounded-lg"
          >
            {categories.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  aria-pressed={selected}
                  className={`min-h-[36px] px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA] ${
                    selected
                      ? 'bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A]'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            {filteredPosts.length}{' '}
            {filteredPosts.length === 1 ? 'article' : 'articles'}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>
        </div>
      </section>

      {/* Empty Search / Filter State */}
      {!featuredPost && (
        <section className="py-20 text-center max-w-md mx-auto">
          <h2 className="font-serif text-2xl font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
            No matching articles found
          </h2>
          <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            No articles matched{' '}
            {normalizedQuery ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-200">
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
            className="mt-6 inline-flex items-center justify-center min-h-[40px] px-5 py-2 text-xs font-medium rounded-md bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reset Filters
          </button>
        </section>
      )}

      {/* Tier 1: Lead Featured Post */}
      {featuredPost && (
        <section className="pt-10 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          <article className="group grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-12">
            <a
              href={`#/post/${featuredPost.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenPost(featuredPost.slug);
              }}
              className="lg:col-span-7 block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
            >
              <div className="aspect-[16/9] lg:h-full w-full overflow-hidden">
                <EditorialImage
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </a>

            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
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
              </div>

              <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15] text-[#0A0A0A] dark:text-[#F4F4F5]">
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

              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {featuredPost.summary}
              </p>

              <div className="mt-7">
                <a
                  href={`#/post/${featuredPost.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPost(featuredPost.slug);
                  }}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium rounded-md bg-[#0A0A0A] text-white dark:bg-[#F4F4F5] dark:text-[#0A0A0A] hover:bg-[#1E3A8A] dark:hover:bg-[#93C5FD] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Tier 2: Secondary Feature Grid */}
      {secondaryPosts.length > 0 && (
        <section className="pt-12">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F4F4F5]">
              Recent Coverage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {secondaryPosts.map((post) => (
              <article key={post.slug} className="group flex flex-col">
                <a
                  href={`#/post/${post.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPost(post.slug);
                  }}
                  className="block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-[#60A5FA]"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden">
                    <EditorialImage
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                </a>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {post.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{post.formattedDate}</time>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{post.readingTimeLabel}</span>
                </div>

                <h3 className="mt-2.5 font-serif text-2xl font-semibold tracking-tight leading-snug text-[#0A0A0A] dark:text-[#F4F4F5]">
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

                <p className="mt-2.5 text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>

                <div className="mt-4 pt-2">
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
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
