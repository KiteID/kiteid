import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-parchment">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <p className="text-xs text-bronze">&copy; {new Date().getFullYear()} KiteID</p>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <a
            href="https://github.com/KiteID"
            target="_blank"
            rel="noopener noreferrer"
            className="link-editorial inline-flex items-center gap-1 text-xs text-bronze hover:text-carbon"
            aria-label="KiteID on GitHub (opens in new tab)"
          >
            GitHub
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
