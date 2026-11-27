import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveAssetPath } from '../utils/assets';

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
  loading?: 'eager' | 'lazy';
}

export function EditorialImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClassName = 'aspect-[16/9]',
  loading = 'lazy',
}: EditorialImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveAssetPath(src);

  if (!resolvedSrc || hasError) {
    return (
      <div
        role="img"
        aria-label={alt || 'Editorial illustration placeholder'}
        className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-200/70 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800/70 dark:to-zinc-900 text-zinc-500 dark:text-zinc-400 p-6 text-center ${aspectClassName}`}
      >
        <ImageOff className="w-5 h-5 opacity-60" aria-hidden="true" />
        <span className="text-xs font-serif italic max-w-xs leading-relaxed">
          {alt || 'Archival photograph unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
