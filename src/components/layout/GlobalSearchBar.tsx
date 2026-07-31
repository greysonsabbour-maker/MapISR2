import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSearchStore } from '@/stores/mapStore';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { cn } from '@/utils';

export function GlobalSearchBar() {
  const query = useSearchStore((s) => s.query);
  const isOpen = useSearchStore((s) => s.isOpen);
  const setQuery = useSearchStore((s) => s.setQuery);
  const setIsOpen = useSearchStore((s) => s.setIsOpen);
  const clearSearch = useSearchStore((s) => s.clearSearch);
  const results = useGlobalSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        clearSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen, clearSearch]);

  const handleSelect = (path?: string) => {
    if (path) navigate(path);
    clearSearch();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search trains, locomotives, locations... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-72 rounded-lg border border-border bg-background/80 py-2 pl-9 pr-8 text-sm',
            'text-foreground placeholder:text-foreground/40',
            'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50',
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 glass-panel shadow-xl animate-slide-in">
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <button
                  onClick={() => handleSelect(result.path)}
                  className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-border/50 transition-colors"
                >
                  <span className="text-sm font-medium">{result.title}</span>
                  <span className="text-xs text-foreground/50">
                    {result.type} — {result.subtitle}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 glass-panel p-4 shadow-xl">
          <p className="text-sm text-foreground/50">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
