import { load as parseYaml } from 'js-yaml';

export const MEDICAL_DISCLAIMER =
  'Medical Disclaimer: The content published on Radiology Unfiltered is provided strictly for informational and educational purposes only and represents an aggregation and commentary on news from various radiology headlines and industry sources. The author assumes no personal or professional responsibility or liability for any medical, diagnostic, or clinical applications resulting from the use or interpretation of information on this site. Nothing on this blog constitutes medical advice, clinical guidance, or a substitute for professional medical judgment, institutional protocols, or official manufacturer and regulatory documentation.';

export const RADIOLOGY_CATEGORIES: string[] = [
  'All',
  'CT & Spectral Imaging',
  'MRI',
  "Mammography & Women's Imaging",
  'X-Ray & Fluoroscopy',
  'Ultrasound',
  'Nuclear Medicine & IR',
  'Radiology AI',
  'Editorial & Announcements',
];

const CATEGORY_ALIASES: Record<string, string> = {
  all: 'Editorial & Announcements',
  'all coverage': 'Editorial & Announcements',
  editorial: 'Editorial & Announcements',
  announcements: 'Editorial & Announcements',
  'editorial & announcements': 'Editorial & Announcements',
  ct: 'CT & Spectral Imaging',
  'ct scan': 'CT & Spectral Imaging',
  'ct scans': 'CT & Spectral Imaging',
  'ct & spectral': 'CT & Spectral Imaging',
  'ct & spectral imaging': 'CT & Spectral Imaging',
  'spectral ct': 'CT & Spectral Imaging',
  'photon-counting ct': 'CT & Spectral Imaging',
  mri: 'MRI',
  mr: 'MRI',
  'magnetic resonance': 'MRI',
  mammography: "Mammography & Women's Imaging",
  'breast imaging': "Mammography & Women's Imaging",
  "women's imaging": "Mammography & Women's Imaging",
  "mammography & women's imaging": "Mammography & Women's Imaging",
  'x-ray': 'X-Ray & Fluoroscopy',
  xray: 'X-Ray & Fluoroscopy',
  radiography: 'X-Ray & Fluoroscopy',
  fluoroscopy: 'X-Ray & Fluoroscopy',
  'x-ray & fluoroscopy': 'X-Ray & Fluoroscopy',
  ultrasound: 'Ultrasound',
  us: 'Ultrasound',
  pocus: 'Ultrasound',
  sonography: 'Ultrasound',
  'nuclear medicine': 'Nuclear Medicine & IR',
  ir: 'Nuclear Medicine & IR',
  'interventional radiology': 'Nuclear Medicine & IR',
  'nuclear medicine & ir': 'Nuclear Medicine & IR',
  ai: 'Radiology AI',
  'radiology ai': 'Radiology AI',
  'artificial intelligence': 'Radiology AI',
};

export function normalizeCategory(rawCategory?: string): string {
  if (!rawCategory || !rawCategory.trim()) {
    return 'Editorial & Announcements';
  }
  const key = rawCategory.trim().toLowerCase();
  if (CATEGORY_ALIASES[key]) {
    return CATEGORY_ALIASES[key];
  }
  const exactMatch = RADIOLOGY_CATEGORIES.find(
    (cat) => cat.toLowerCase() === key,
  );
  return exactMatch ?? rawCategory.trim();
}

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
  rawCategory: string;
  content: string;
  plainText: string;
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
  const normalized = raw.replace(/^\uFEFF/, '').trimStart();
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: normalized.trim() };
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

function extractPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeReadingStats(plainText: string): {
  wordCount: number;
  readingTimeMinutes: number;
  readingTimeLabel: string;
} {
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
      const plainText = extractPlainText(content);
      const stats = computeReadingStats(plainText);
      const rawCategory = data.category ?? 'Editorial & Announcements';

      return {
        title: data.title ?? 'Untitled Article',
        slug: data.slug ?? fallbackSlug,
        date,
        rawCategory,
        category: normalizeCategory(rawCategory),
        coverImage: data.coverImage ?? '',
        summary: data.summary ?? '',
        content,
        plainText,
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
  const extras = ALL_POSTS.map((post) => post.category).filter(
    (cat) => cat && !RADIOLOGY_CATEGORIES.includes(cat),
  );
  return [...RADIOLOGY_CATEGORIES, ...Array.from(new Set(extras))];
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = { All: ALL_POSTS.length };
  for (const cat of getAllCategories()) {
    if (cat !== 'All') {
      counts[cat] = 0;
    }
  }
  for (const post of ALL_POSTS) {
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  }
  return counts;
}
