import { MEDICAL_DISCLAIMER } from '../lib/posts';

interface FooterProps {
  onNavigateHome: (category?: string) => void;
}

export function Footer({ onNavigateHome }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-transparent border-t border-light-outline/80 dark:border-dark-outline/80 mt-auto transition-colors duration-200">
      <div className="max-w-container-max mx-auto px-gutter-md sm:px-gutter-lg lg:px-gutter-xl py-gutter-xl flex flex-col gap-gutter-md">
        {/* Medical Disclaimer in Dedicated Glass Card (Stitch design) */}
        <div className="rounded-md border border-light-outline dark:border-dark-outline bg-light-surface-container/60 dark:bg-dark-surface-container/50 backdrop-blur-md p-gutter-lg shadow-sm">
          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
            <strong className="text-light-on-surface dark:text-dark-on-surface font-semibold">
              Medical Disclaimer:
            </strong>{' '}
            {MEDICAL_DISCLAIMER.replace(/^Medical Disclaimer:\s*/, '')}
          </p>
        </div>

        {/* Footer Navigation & Credits */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-gutter-md pt-gutter-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-body-sm">
          <div className="flex flex-wrap items-center gap-gutter-md font-label text-label-lg">
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome('All');
              }}
              className="hover:text-light-primary dark:hover:text-dark-primary transition-colors whitespace-nowrap"
            >
              All Coverage
            </a>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome('CT & Spectral Imaging');
              }}
              className="hover:text-light-primary dark:hover:text-dark-primary transition-colors whitespace-nowrap"
            >
              CT &amp; Spectral
            </a>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome("Mammography & Women's Imaging");
              }}
              className="hover:text-light-primary dark:hover:text-dark-primary transition-colors whitespace-nowrap"
            >
              Mammography
            </a>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome('Radiology AI');
              }}
              className="hover:text-light-primary dark:hover:text-dark-primary transition-colors whitespace-nowrap"
            >
              Radiology AI
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-light-primary dark:hover:text-dark-primary transition-colors whitespace-nowrap cursor-pointer"
            >
              Back to Top
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-gutter-md">
            <span className="font-mono text-mono-sm">
              Radiology Unfiltered · Bryan Scroggs, RT(R)(CT)
            </span>
            <span className="font-label text-label-md uppercase hidden lg:inline">
              Primary Authorities: RSNA · ACR · FDA · Radiopaedia · NICE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
