import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load as yamlLoad } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SITE_URL = 'https://bkscroggs.github.io/rad-unfiltered-Blog';
const SITE_NAME = 'Radiology Unfiltered';
const AUTHOR_NAME = 'Bryan Scroggs, RT(R)(CT)';

interface Frontmatter {
  title: string;
  slug: string;
  date: string;
  category: string;
  coverImage: string;
  summary: string;
}

interface ParsedPost extends Frontmatter {
  content: string;
  filename: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toAbsoluteUrl(imgPath: string): string {
  if (!imgPath) return `${SITE_URL}/images/logo.png`;
  if (/^https?:\/\//i.test(imgPath)) return imgPath;

  const clean = imgPath
    .replace(/^(\.\/|\/)+/, '')
    .replace(/^public\//, '')
    .replace(/^rad-unfiltered-Blog\//i, '');

  return `${SITE_URL}/${clean}`.replace(/([^:])\/+/g, '$1/');
}

function parseMarkdownFile(filePath: string): ParsedPost | null {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const normalized = raw.replace(/^\uFEFF/, '').trimStart();
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) return null;

  try {
    const data = yamlLoad(match[1]) as Partial<Frontmatter>;
    const content = match[2]?.trim() || '';

    if (!data.title || !data.slug) return null;

    return {
      title: String(data.title).trim(),
      slug: String(data.slug).trim(),
      date: String(data.date || new Date().toISOString().split('T')[0]).trim(),
      category: String(data.category || 'Editorial & Announcements').trim(),
      coverImage: String(data.coverImage || '/images/logo.png').trim(),
      summary: String(data.summary || '').trim(),
      content,
      filename: path.basename(filePath),
    };
  } catch (err) {
    console.error(`Error parsing frontmatter in ${filePath}:`, err);
    return null;
  }
}

function loadAllPosts(): ParsedPost[] {
  const postsDir = path.resolve(rootDir, 'src/posts');
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
  const posts: ParsedPost[] = [];

  for (const file of files) {
    const parsed = parseMarkdownFile(path.join(postsDir, file));
    if (parsed) posts.push(parsed);
  }

  // Sort descending by date
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

function generateSitemap(posts: ParsedPost[]): string {
  const latestDate = posts[0]?.date || new Date().toISOString().split('T')[0];

  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
    {
      loc: `${SITE_URL}/`,
      lastmod: latestDate,
      changefreq: 'daily',
      priority: '1.0',
    },
  ];

  for (const post of posts) {
    // Canonical path URL
    urls.push({
      loc: `${SITE_URL}/post/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.9',
    });
    // Hash deep-link URL for SPA crawlers
    urls.push({
      loc: `${SITE_URL}/#/post/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  const xmlEntries = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;
}

function convertMarkdownToSimpleHtml(markdown: string): string {
  // Convert first few paragraphs to safe, clean semantic HTML for crawlers
  const paragraphs = markdown
    .split(/\r?\n\r?\n/)
    .filter((p) => p.trim() && !p.startsWith('#') && !p.startsWith('>'))
    .slice(0, 5);

  return paragraphs
    .map((p) => `<p style="margin-bottom: 1.25rem;">${escapeHtml(p.replace(/[*_`]/g, '').trim())}</p>`)
    .join('\n');
}

function prerenderPostHtml(baseHtml: string, post: ParsedPost): string {
  const postTitle = `${post.title} — ${SITE_NAME}`;
  const postDescription = post.summary;
  const canonicalUrl = `${SITE_URL}/post/${post.slug}`;
  const absoluteCoverImage = toAbsoluteUrl(post.coverImage);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: [absoluteCoverImage],
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      jobTitle: 'CT Technologist & Radiology Publisher',
      url: `${SITE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
  };

  let html = baseHtml;

  // 1. Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(postTitle)}</title>`);

  // 2. Meta description
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?>/i,
    `<meta name="description" content="${escapeHtml(postDescription)}" />`,
  );

  // 3. Canonical link
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link\s+rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // 4. OpenGraph tags
  const ogTags = `
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(post.title)}" />
    <meta property="og:description" content="${escapeHtml(postDescription)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${absoluteCoverImage}" />
    <meta property="og:image:alt" content="${escapeHtml(post.title)}" />
    <meta property="article:published_time" content="${post.date}" />
    <meta property="article:section" content="${escapeHtml(post.category)}" />
    <meta property="article:author" content="${AUTHOR_NAME}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(post.title)}" />
    <meta name="twitter:description" content="${escapeHtml(postDescription)}" />
    <meta name="twitter:image" content="${absoluteCoverImage}" />
  `;

  // Remove existing OG and twitter tags to prevent duplicates
  html = html.replace(/<meta\s+property="og:[\s\S]*?>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[\s\S]*?>/gi, '');
  html = html.replace('</head>', `${ogTags}\n  </head>`);

  // 5. Schema.org JSON-LD
  const jsonLdTag = `  <script id="schema-jsonld" type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
  html = html.replace('</head>', `${jsonLdTag}\n  </head>`);

  // 6. Semantic Prerender Content inside <div id="root">
  const articleHtml = `
    <div id="root">
      <article style="max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.25rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="margin-bottom: 2rem;">
          <p style="text-transform: uppercase; font-size: 0.875rem; color: #60A5FA; font-weight: 600; letter-spacing: 0.05em;">
            ${escapeHtml(post.category)} · <time datetime="${post.date}">${post.date}</time>
          </p>
          <h1 style="font-size: 2.5rem; font-weight: 700; margin: 0.75rem 0 1rem; line-height: 1.2; color: #FFFFFF;">
            ${escapeHtml(post.title)}
          </h1>
          <p style="font-size: 1.2rem; color: #94A3B8; line-height: 1.6; margin: 0;">
            ${escapeHtml(post.summary)}
          </p>
        </header>
        <figure style="margin: 2rem 0;">
          <img src="${absoluteCoverImage}" alt="${escapeHtml(post.title)}" style="width: 100%; border-radius: 0.75rem; max-height: 550px; object-fit: cover;" />
        </figure>
        <div style="font-size: 1.1rem; line-height: 1.8; color: #E4E4E7;">
          ${convertMarkdownToSimpleHtml(post.content)}
        </div>
      </article>
    </div>
  `;

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, articleHtml);

  // 7. Adjust relative asset paths for deep routes:
  // Since this file will live in dist/post/<slug>/index.html (2 levels deep),
  // paths like href="./assets/..." or src="./assets/..." become href="../../assets/..."
  html = html.replace(/(src|href)="\.\/assets\//g, '$1="../../assets/');
  html = html.replace(/(src|href)="\.\/images\//g, '$1="../../images/');

  return html;
}

function generate404Html(baseHtml: string): string {
  const redirectScript = `
    <script>
      // Single-page app fallback redirect for GitHub Pages deep links
      (function() {
        var base = '/rad-unfiltered-Blog/';
        var path = window.location.pathname;
        if (path.indexOf(base) === 0) {
          path = path.slice(base.length);
        }
        path = path.replace(/^\\/+/, '');
        if (path && path !== '404.html') {
          var target = base + '#/' + path + (window.location.search || '') + (window.location.hash || '');
          window.location.replace(target);
        }
      })();
    </script>
  `;

  return baseHtml.replace('</head>', `${redirectScript}\n  </head>`);
}

export function run() {
  console.log('🚀 Running SEO & Sitemap Prerender Script...');

  const posts = loadAllPosts();
  console.log(`📚 Found ${posts.length} Markdown posts in src/posts/`);

  // 1. Generate Sitemap
  const sitemapXml = generateSitemap(posts);
  const publicDir = path.resolve(rootDir, 'public');
  const distDir = path.resolve(rootDir, 'dist');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('✅ Generated public/sitemap.xml');

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
    console.log('✅ Generated dist/sitemap.xml');
  }

  // 2. Ensure robots.txt exists in public & dist
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  }
  console.log('✅ Verified robots.txt in public/ and dist/');

  // 3. Static HTML Prerendering
  const distIndexHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndexHtmlPath)) {
    const baseHtml = fs.readFileSync(distIndexHtmlPath, 'utf-8');

    for (const post of posts) {
      const postDir = path.join(distDir, 'post', post.slug);
      fs.mkdirSync(postDir, { recursive: true });

      const postHtml = prerenderPostHtml(baseHtml, post);
      fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf-8');
      console.log(`  📄 Prerendered static post page: dist/post/${post.slug}/index.html`);
    }

    // 4. Generate dist/404.html
    const fallback404Html = generate404Html(baseHtml);
    fs.writeFileSync(path.join(distDir, '404.html'), fallback404Html, 'utf-8');
    console.log('✅ Generated dist/404.html for GitHub Pages fallback');
  } else {
    console.log('ℹ️ dist/index.html not found yet (will be prerendered upon running `npm run build`).');
  }

  console.log('🎉 SEO & Sitemap Generation Complete!');
}

run();
