import { useEffect } from 'react';
import type { BlogPost } from '../lib/posts';

export const SITE_NAME = 'Radiology Unfiltered';
export const SITE_URL = 'https://bkscroggs.github.io/rad-unfiltered-Blog';
export const DEFAULT_DESCRIPTION =
  'Candid coverage of radiology news, clinical imaging advancements, and modality innovations across CT, MRI, X-ray, Mammography, Ultrasound, Nuclear Medicine, Interventional Radiology, and Radiology AI.';
export const DEFAULT_COVER_IMAGE = `${SITE_URL}/images/logo.png`;
export const AUTHOR_NAME = 'Bryan Scroggs, RT(R)(CT)';

export function toAbsoluteUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return DEFAULT_COVER_IMAGE;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const clean = pathOrUrl
    .replace(/^(\.\/|\/)+/, '')
    .replace(/^public\//, '')
    .replace(/^rad-unfiltered-Blog\//i, '');

  return `${SITE_URL}/${clean}`.replace(/([^:])\/+/g, '$1/');
}

interface SEOProps {
  post?: BlogPost;
  category?: string;
}

export function SEO({ post, category }: SEOProps) {
  const isPost = Boolean(post);

  const title = isPost
    ? `${post!.title} — ${SITE_NAME}`
    : category && category !== 'All'
      ? `${category} Coverage — ${SITE_NAME}`
      : `${SITE_NAME} — Candid Insights Across Modern Radiology`;

  const description = isPost ? post!.summary : DEFAULT_DESCRIPTION;

  const canonicalUrl = isPost
    ? `${SITE_URL}/post/${post!.slug}`
    : `${SITE_URL}/`;

  const ogType = isPost ? 'article' : 'website';

  const imageUrl = isPost
    ? toAbsoluteUrl(post!.coverImage)
    : DEFAULT_COVER_IMAGE;

  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to safely set or create a <meta> tag
    const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
      let meta = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };

    // 2. Standard Meta
    setMeta('name', 'description', description);

    // 3. Canonical Link
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 4. Open Graph
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:title', isPost ? post!.title : title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:alt', isPost ? post!.title : SITE_NAME);

    if (isPost && post) {
      setMeta('property', 'article:published_time', post.date);
      setMeta('property', 'article:modified_time', post.date);
      setMeta('property', 'article:section', post.category);
      setMeta('property', 'article:author', AUTHOR_NAME);
    }

    // 5. Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', isPost ? post!.title : title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    // 6. Schema.org JSON-LD Structured Data
    const structuredData = isPost && post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary,
          image: [imageUrl],
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
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          description: DEFAULT_DESCRIPTION,
          publisher: {
            '@type': 'Person',
            name: AUTHOR_NAME,
            jobTitle: 'CT Technologist & Radiology Publisher',
          },
        };

    let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData, null, 2);
  }, [title, description, canonicalUrl, ogType, imageUrl, isPost, post]);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={isPost ? post!.title : title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={isPost ? post!.title : title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  );
}
