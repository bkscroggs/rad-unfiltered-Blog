import { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { EditorialImage } from './EditorialImage';

export interface LightboxImageData {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxModalProps {
  image: LightboxImageData | null;
  onClose: () => void;
}

export function LightboxModal({ image, onClose }: LightboxModalProps) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setZoomed(false);
  }, [image]);

  useEffect(() => {
    if (!image) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Image lightbox preview'}
      className="fixed inset-0 z-50 flex flex-col bg-[#040913]/92 backdrop-blur-md"
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 text-slate-200">
        <p className="text-xs sm:text-sm font-medium truncate max-w-xl">
          {image.alt || 'Clinical Figure'}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoomed((prev) => !prev)}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            {zoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Fit View</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Zoom 1.75×</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Image Canvas */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8"
      >
        <div
          onClick={() => setZoomed((prev) => !prev)}
          className={`transition-transform duration-200 ease-out cursor-zoom-in ${
            zoomed
              ? 'scale-150 sm:scale-[1.75] cursor-zoom-out'
              : 'max-w-5xl w-full'
          }`}
        >
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#081221] shadow-2xl">
            <EditorialImage
              src={image.src}
              alt={image.alt}
              loading="eager"
              className="w-full max-h-[78vh] object-contain mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Optional Caption */}
      {(image.caption || image.alt) && (
        <div className="px-6 py-3.5 border-t border-slate-800/80 text-center">
          <p className="font-serif italic text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto">
            {image.caption || image.alt}
          </p>
        </div>
      )}
    </div>
  );
}
