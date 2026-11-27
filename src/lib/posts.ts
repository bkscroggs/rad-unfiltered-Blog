import { load as parseYaml } from 'js-yaml';

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  category: string;
  coverImage: string;
  summary: string;
}

export interface PostHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogPost extends PostFrontmatter {
  content: string;
  readingTimeMinutes: number;
  readingTimeLabel: string;
  wordCount: number;
  formattedDate: string;
  headings: PostHeading[];
}

const rawPostModules = import.meta.glob('/src/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseFrontmatter(raw: string): {
  data: Partial<PostFrontmatter>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }

  const [, yamlBlock, body] = match;
  const parsed = parseYaml(yamlBlock);
  const data =
    parsed && typeof parsed === 'object'
      ? (parsed as Partial<PostFrontmatter>)
      : {};

  return {
    data,
    content: body.trim(),
  };
}

function computeReadingStats(markdown: string): {
  wordCount: number;
  readingTimeMinutes: number;
  readingTimeLabel: string;
} {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plainText ? plainText.split(' ').length : 0;
  const minutes = Math.max(1, Math.ceil(words / 215));

  return {
    wordCount: words,
    readingTimeMinutes: minutes,
    readingTimeLabel: `${minutes} min read`,
  };
}

function extractHeadings(markdown: string): PostHeading[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  const headings: PostHeading[] = [];
  const lines = withoutCode.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const rawText = match[2].replace(/[`*_~]/g, '').trim();
      headings.push({
        id: slugifyHeading(rawText),
        text: rawText,
        level,
      });
    }
  }

  return headings;
}

function formatEditorialDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(`${dateStr}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return dateStr;

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function loadAllPosts(): BlogPost[] {
  const posts: BlogPost[] = Object.entries(rawPostModules).map(
    ([filePath, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const fallbackSlug =
        filePath.split('/').pop()?.replace(/\.md$/i, '') ?? 'untitled';

      const date = data.date ? String(data.date) : '2026-01-01';
      const stats = computeReadingStats(content);

      return {
        title: data.title ?? 'Untitled Essay',
        slug: data.slug ?? fallbackSlug,
        date,
        category: data.category ?? 'Essays',
        coverImage: data.coverImage ?? '',
        summary: data.summary ?? '',
        content,
        ...stats,
        formattedDate: formatEditorialDate(date),
        headings: extractHeadings(content),
      };
    },
  );

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export const ALL_POSTS: BlogPost[] = loadAllPosts();

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((post) => post.slug === slug);
}

export function getAllCategories(): string[] {
  const unique = new Set(ALL_POSTS.map((post) => post.category));
  return ['All', ...Array.from(unique)];
}
