'use client';
import { useState, useEffect, useRef } from 'react';

interface Movie {
  slug: string;
  title: string;
  original_title?: string | null;
  year: string | null;
  poster: string | null;
  rating: number | null;
}

export default function SearchBar({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const found = movies
      .filter(m => {
        const title = m.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const orig = (m.original_title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return title.includes(q) || orig.includes(q);
      })
      .slice(0, 8);
    setResults(found);
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
          placeholder="Buscar películas..."
          className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-white">
            ✕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.map(m => (
            <a
              key={m.slug}
              href={`/pelicula/${m.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
              onClick={() => setOpen(false)}
            >
              {m.poster
                ? <img src={m.poster} alt={m.title} className="w-9 h-12 object-cover rounded shrink-0" />
                : <div className="w-9 h-12 bg-gray-700 rounded shrink-0" />
              }
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{m.title}</p>
                <p className="text-xs text-gray-400">{m.year} {m.rating && `· ⭐ ${m.rating}`}</p>
              </div>
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
