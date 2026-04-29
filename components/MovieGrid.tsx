'use client';
import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import type { CategoryId } from './Sidebar';

const PAGE_SIZE = 60;

const COUNTRY_NAMES: Record<string, string> = {
  AR: 'Argentina', MX: 'México', ES: 'España', BR: 'Brasil', CO: 'Colombia',
  US: 'Estados Unidos', GB: 'Reino Unido', FR: 'Francia', DE: 'Alemania',
  IT: 'Italia', JP: 'Japón', KR: 'Corea del Sur', CN: 'China', IN: 'India',
  AU: 'Australia', CA: 'Canadá', RU: 'Rusia', CL: 'Chile', PE: 'Perú',
  VE: 'Venezuela', UY: 'Uruguay', BO: 'Bolivia', PY: 'Paraguay', EC: 'Ecuador',
};

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
  genre: string[];
}

interface MovieGridProps {
  genres?: string[];
  years?: string[];
  countries?: string[];
  category?: CategoryId;
}

function categoryToParams(cat: CategoryId): URLSearchParams {
  const params = new URLSearchParams();
  switch (cat) {
    case 'estrenos':
      params.set('sort', 'year');
      params.set('order', 'desc');
      break;
    case 'populares':
      params.set('sort', 'rating');
      params.set('order', 'desc');
      break;
    case 'top-rated':
      params.set('sort', 'rating');
      params.set('order', 'desc');
      params.set('minRating', '7.5');
      break;
    case 'proximos':
      params.set('sort', 'year');
      params.set('order', 'desc');
      params.set('upcoming', 'true');
      break;
    case 'locales-ar':
      params.set('country', 'AR');
      break;
    case 'locales-mx':
      params.set('country', 'MX');
      break;
    case 'locales-es':
      params.set('country', 'ES');
      break;
    default:
      params.set('sort', 'rating');
      params.set('order', 'desc');
  }
  return params;
}

export default function MovieGrid({ genres = [], years = [], countries = [], category }: MovieGridProps) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset when category changes
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setSearch('');
    setGenre('');
    setYear('');
    setCountry('');
  }, [category]);

  useEffect(() => { setPage(1); setMovies([]); }, [search, genre, year, country]);

  useEffect(() => {
    let params: URLSearchParams;

    if (category) {
      params = categoryToParams(category);
    } else {
      params = new URLSearchParams();
      if (search) params.set('search', search);
      if (genre) params.set('genre', genre);
      if (year) params.set('year', year);
      if (country) params.set('country', country);
    }
    params.set('page', String(page));

    // Series categories use /api/series endpoint
    const isSeriesCategory = category?.startsWith('series-');
    const endpoint = isSeriesCategory ? '/api/series' : '/api/movies';

    if (isSeriesCategory && category) {
      const seriesParams = new URLSearchParams();
      if (category === 'series-popular') {
        seriesParams.set('sort', 'rating');
        seriesParams.set('order', 'desc');
      } else if (category === 'series-ultimas') {
        seriesParams.set('sort', 'year');
        seriesParams.set('order', 'desc');
      } else if (category === 'series-mejores') {
        seriesParams.set('sort', 'rating');
        seriesParams.set('order', 'desc');
        seriesParams.set('minRating', '8');
      }
      seriesParams.set('page', String(page));
      params = seriesParams;
    }

    setLoading(true);
    fetch(`${endpoint}?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        const items = data.movies ?? data.series ?? [];
        if (page === 1) {
          setMovies(items);
        } else {
          setMovies(prev => [...prev, ...items]);
        }
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, genre, year, country, page, category]);

  const hasMore = movies.length < total;
  const hasFilters = search || genre || year || country;
  const isSeriesCategory = category?.startsWith('series-');
  const linkPrefix = isSeriesCategory ? '/serie' : '/pelicula';

  return (
    <div>
      {/* Filters — only shown when no category is active */}
      {!category && (
        <div className="sticky top-[60px] z-40 bg-[#030712]/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-4 border-b border-gray-800">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-32 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select value={genre} onChange={e => setGenre(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Género</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Año</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {countries.length > 0 && (
              <select value={country} onChange={e => setCountry(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">País</option>
                {countries.map(c => (
                  <option key={c} value={c}>{COUNTRY_NAMES[c] ?? c}</option>
                ))}
              </select>
            )}
            {hasFilters && (
              <button onClick={() => { setSearch(''); setGenre(''); setYear(''); setCountry(''); }}
                className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-600">
                ✕
              </button>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {loading ? 'Cargando...' : `Mostrando ${movies.length} de ${total} películas`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {movies.map((movie, i) => (
          <MovieCard key={`${movie.slug}-${i}`} movie={movie} linkPrefix={linkPrefix as '/pelicula' | '/serie'} />
        ))}
        {loading && movies.length === 0 && Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-gray-800" />
            <div className="h-2.5 bg-gray-800 rounded mt-2 w-3/4" />
          </div>
        ))}
      </div>

      {movies.length === 0 && !loading && (
        <p className="text-gray-500 text-sm text-center py-12">No hay contenido disponible</p>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button onClick={() => setPage(p => p + 1)} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition">
            {loading ? 'Cargando...' : `Cargar más (${total - movies.length} restantes)`}
          </button>
        </div>
      )}
    </div>
  );
}
