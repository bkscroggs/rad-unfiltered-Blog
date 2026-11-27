interface FooterProps {
  onNavigateHome: (category?: string) => void;
}

export function Footer({ onNavigateHome }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0B0C0E] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="space-y-1">
          <p className="font-serif text-base font-semibold text-[#0A0A0A] dark:text-[#F4F4F5]">
            Monograph
          </p>
          <p>
            &copy; {new Date().getFullYear()} Monograph Editorial Journal. Static
            Markdown Edition.
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
            All Essays
          </a>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('Architecture');
            }}
            className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
          >
            Architecture
          </a>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('Design');
            }}
            className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
          >
            Design
          </a>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('Technology');
            }}
            className="hover:text-[#0A0A0A] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
          >
            Technology
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
    </footer>
  );
}
