import { MEDICAL_DISCLAIMER } from '../lib/posts';

interface FooterProps {
  onNavigateHome: (category?: string) => void;
}

export function Footer({ onNavigateHome }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-200/80 dark:border-slate-800/80 bg-[#FAFAFA] dark:bg-transparent transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs text-zinc-500 dark:text-slate-400">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <p className="font-serif text-base font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
              Radiology Unfiltered
            </p>
            <p className="leading-relaxed">
              An independent radiology news and educational commentary
              publication written for imaging professionals, students, and
              informed readers. &copy; {new Date().getFullYear()} Radiology
              Unfiltered.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome('All');
              }}
              className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
            >
              All Coverage
            </a>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome('CT & Spectral Imaging');
              }}
              className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
            >
              CT &amp; Spectral
            </a>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome("Mammography & Women's Imaging");
              }}
              className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
            >
              Mammography
            </a>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome('Radiology AI');
              }}
              className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
            >
              Radiology AI
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap cursor-pointer"
            >
              Back to Top
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200/80 dark:border-slate-800/80">
          <p className="text-[11.5px] leading-relaxed text-zinc-500 dark:text-slate-400">
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </div>
    </footer>
  );
}
