/**
 * Resolves local asset paths relative to Vite's BASE_URL while stripping
 * duplicate leading slashes so subpath deployments (e.g. GitHub Pages)
 * and relative builds (base: './') always load reliably.
 */
export function resolveAssetPath(assetPath: string): string {
  if (!assetPath) return '';

  const trimmed = assetPath.trim();
  if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = trimmed.replace(/^\/+/, '');

  return `${cleanBase}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
}
