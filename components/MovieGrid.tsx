'use client';
import { useState, useMemo, useEffect } from 'react';
import MovieCard from './MovieCard';

const PAGE_SIZE = 60;

interface Movie {
  slug: string;
  title: string;
  year: string;
  poster: string;
  rating: string;
  genre: string[];
}

export default function MovieGrid({ movies }: { movies: Movie[] }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);

  // Reset página al cambiar filtros
  useEffect(() => { setPage(1); }, [search, genre, year]);

  const genres = useMemo(() => {
    const all = movies.flatMap(m => Array.isArray(m.genre) ? m.genre : []);
    return [...new Set(all)].filter(Boolean).sort();
  }, [movies]);

  const years = useMemo(() => {
    const all = movies.map(m => m.year?.toString()).filter(Boolean);
    return [...new Set(all)].sort((a, b) => Number(b) - Number(a));
  }, [movies]);

  const filtered = useMemo(() => {
    return movies.filter(m => {
      const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase());
      const matchGenre = !genre || (Array.isArray(m.genre) && m.genre.includes(genre));
      const matchYear = !year || m.year?.toString() === year;
      return matchSearch && matchGenre && matchYear;
    });
  }, [movies, search, genre, year]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div>
      <div className="sticky top-[60px] z-40 bg-gray-950/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-4 border-b border-gray-800">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-32 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Género</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Año</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(search || genre || year) && (
            <button onClick={() => { setSearch(''); setGenre(''); setYear(''); }}
              className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-600">
              ✕
            </button>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Mostrando {visible.length} de {filtered.length} películas
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {visible.map((movie, i) => (
          <MovieCard key={`${movie.slug}-${i}`} movie={movie} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Cargar más ({filtered.length - visible.length} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
