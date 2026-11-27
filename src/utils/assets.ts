/**
 * Resolves local asset paths relative to Vite's BASE_URL while stripping
 * duplicate leading slashes, public/ prefixes, and duplicate repo subpath
 * segments (/rad-unfiltered-Blog/) so GitHub Pages and local builds load reliably.
 */
export function resolveAssetPath(assetPath: string): string {
  if (!assetPath) return '';

  const trimmed = assetPath.trim();
  if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed.replace(
      /(\/rad-unfiltered-Blog)+(?=\/)/gi,
      '/rad-unfiltered-Blog',
    );
  }

  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  let cleanPath = trimmed.replace(/^(\.\/|\/)+/, '');

  const repoPrefix = 'rad-unfiltered-Blog/';
  while (cleanPath.toLowerCase().startsWith(repoPrefix.toLowerCase())) {
    cleanPath = cleanPath.slice(repoPrefix.length);
  }

  if (cleanPath.toLowerCase().startsWith('public/')) {
    cleanPath = cleanPath.slice('public/'.length);
  }

  const normalizedBase = cleanBase.replace(/^(\.\/|\/)+/, '');
  while (
    normalizedBase &&
    cleanPath.toLowerCase().startsWith(normalizedBase.toLowerCase())
  ) {
    cleanPath = cleanPath.slice(normalizedBase.length);
  }

  cleanPath = cleanPath.replace(/^\/+/, '');

  return `${cleanBase}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
}
