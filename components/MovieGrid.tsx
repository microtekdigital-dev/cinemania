'use client';
import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';

const PAGE_SIZE = 60;

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
  genre: string[];
}

interface MovieGridProps {
  genres: string[];
  years: string[];
}

export default function MovieGrid({ genres, years }: MovieGridProps) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset página al cambiar filtros
  useEffect(() => { setPage(1); setMovies([]); }, [search, genre, year]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (genre) params.set('genre', genre);
    if (year) params.set('year', year);
    params.set('page', String(page));

    setLoading(true);
    fetch(`/api/movies?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (page === 1) {
          setMovies(data.movies ?? []);
        } else {
          setMovies(prev => [...prev, ...(data.movies ?? [])]);
        }
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, genre, year, page]);

  const hasMore = movies.length < total;

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
          {loading ? 'Cargando...' : `Mostrando ${movies.length} de ${total} películas`}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {movies.map((movie, i) => (
          <MovieCard key={`${movie.slug}-${i}`} movie={movie} />
        ))}
        {loading && movies.length === 0 && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-gray-800" />
            <div className="h-2.5 bg-gray-800 rounded mt-2 w-3/4" />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            {loading ? 'Cargando...' : `Cargar más (${total - movies.length} restantes)`}
          </button>
        </div>
      )}
    </div>
  );
}
