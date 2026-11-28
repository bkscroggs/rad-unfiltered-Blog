export type SortOption = 'date-desc' | 'date-asc' | 'read-asc' | 'read-desc';
export type ReaderFontSize = 'sm' | 'md' | 'lg';
export type ReaderWidth = 'standard' | 'wide';

export interface ReaderPreferences {
  fontSize: ReaderFontSize;
  width: ReaderWidth;
}

const BOOKMARKS_KEY = 'rad-unfiltered-bookmarks';
const READ_HISTORY_KEY = 'rad-unfiltered-read-history';
const READER_PREFS_KEY = 'rad-unfiltered-reader-prefs';

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(slugs: string[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(slugs));
  } catch {
    // Ignore storage quota / privacy mode restrictions
  }
}

export function loadReadHistory(): string[] {
  try {
    const raw = localStorage.getItem(READ_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function saveReadHistory(slugs: string[]): void {
  try {
    localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(slugs));
  } catch {
    // Ignore storage restrictions
  }
}

export function loadReaderPrefs(): ReaderPreferences {
  const defaults: ReaderPreferences = { fontSize: 'md', width: 'standard' };
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>;
    return {
      fontSize:
        parsed.fontSize === 'sm' ||
        parsed.fontSize === 'md' ||
        parsed.fontSize === 'lg'
          ? parsed.fontSize
          : 'md',
      width:
        parsed.width === 'standard' || parsed.width === 'wide'
          ? parsed.width
          : 'standard',
    };
  } catch {
    return defaults;
  }
}

export function saveReaderPrefs(prefs: ReaderPreferences): void {
  try {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage restrictions
  }
}
