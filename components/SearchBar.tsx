'use client';
import { useState, useEffect, useRef } from 'react';

interface Item {
  slug: string;
  title: string;
  original_title?: string | null;
  year: string | null;
  poster: string | null;
  rating: number | null;
  type: 'movie' | 'serie';
}

interface Props {
  movies: Omit<Item, 'type'>[];
  series?: Omit<Item, 'type'>[];
}

export default function SearchBar({ movies, series = [] }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const moviesRef = useRef(movies);
  const seriesRef = useRef(series);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const movieResults: Item[] = moviesRef.current
      .filter(m => normalize(m.title).includes(q) || normalize(m.original_title || '').includes(q))
      .slice(0, 5)
      .map(m => ({ ...m, type: 'movie' as const }));

    const serieResults: Item[] = seriesRef.current
      .filter(s => normalize(s.title).includes(q) || normalize(s.original_title || '').includes(q))
      .slice(0, 3)
      .map(s => ({ ...s, type: 'serie' as const }));

    setResults([...movieResults, ...serieResults].slice(0, 8));
    setOpen(true);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center bg-gray-800/80 border border-gray-700 rounded-full px-4 py-2 gap-2 focus-within:border-blue-500 transition">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar películas y series..."
          className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-white">✕</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.map(item => (
            <a
              key={`${item.type}-${item.slug}`}
              href={item.type === 'movie' ? `/pelicula/${item.slug}` : `/serie/${item.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
              onClick={() => setOpen(false)}
            >
              {item.poster
                ? <img src={item.poster} alt={item.title} className="w-9 h-12 object-cover rounded shrink-0" />
                : <div className="w-9 h-12 bg-gray-700 rounded shrink-0" />
              }
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-400">{item.year} {item.rating && `· ⭐ ${item.rating}`}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.type === 'serie' ? 'bg-blue-600/80 text-white' : 'bg-gray-700 text-gray-300'}`}>
                {item.type === 'serie' ? 'SERIE' : 'PELÍCULA'}
              </span>
            </a>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400 z-50">
          No se encontraron resultados para "{query}"
        </div>
      )}
    </div>
  );
}
