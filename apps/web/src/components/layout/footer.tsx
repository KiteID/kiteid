export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-parchment">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <p className="text-xs text-bronze">&copy; {new Date().getFullYear()} KiteID</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/KiteID"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-bronze transition-colors hover:text-carbon"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
