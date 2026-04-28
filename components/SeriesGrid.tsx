'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const COUNTRY_NAMES: Record<string, string> = {
  AR: 'Argentina', MX: 'México', ES: 'España', BR: 'Brasil', CO: 'Colombia',
  US: 'Estados Unidos', GB: 'Reino Unido', FR: 'Francia', DE: 'Alemania',
  IT: 'Italia', JP: 'Japón', KR: 'Corea del Sur', CN: 'China', IN: 'India',
  AU: 'Australia', CA: 'Canadá', RU: 'Rusia', CL: 'Chile', PE: 'Perú',
};

interface Serie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
  genre: string[];
  country?: string[];
}

export default function SeriesGrid({ countries = [] }: { countries?: string[] }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const [series, setSeries] = useState<Serie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const initialized = useRef(false);

  useEffect(() => { setPage(1); setSeries([]); }, [search, genre, country]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (genre) params.set('genre', genre);
    if (country) params.set('country', country);
    params.set('page', String(page));
    params.set('limit', '60');

    setLoading(true);
    fetch(`/api/series?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (page === 1) setSeries(data.series ?? []);
        else setSeries(prev => [...prev, ...(data.series ?? [])]);
        setTotal(data.total ?? 0);
        if (!initialized.current && data.genres) {
          setGenres(data.genres);
          initialized.current = true;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, genre, country, page]);

  const hasMore = series.length < total;
  const hasFilters = search || genre || country;

  return (
    <div>
      <div className="sticky top-[60px] z-40 bg-gray-950/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-4 border-b border-gray-800">
        <div className="flex flex-wrap gap-2">
          <input type="text" placeholder="Buscar series..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-32 outline-none focus:ring-1 focus:ring-blue-500" />
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Género</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {countries.length > 0 && (
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">País</option>
              {countries.map(c => <option key={c} value={c}>{COUNTRY_NAMES[c] ?? c}</option>)}
            </select>
          )}
          {hasFilters && (
            <button onClick={() => { setSearch(''); setGenre(''); setCountry(''); }}
              className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-600">✕</button>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-2">
          {loading ? 'Cargando...' : `Mostrando ${series.length} de ${total} series`}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {series.map((serie, i) => (
          <Link key={`${serie.slug}-${i}`} href={`/serie/${serie.slug}`} className="group">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
              {serie.poster
                ? <img src={serie.poster} alt={serie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{serie.title}</div>
              }
              {serie.rating && (
                <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 text-xs font-bold px-1 py-0.5 rounded">
                  ⭐ {serie.rating}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-1 truncate leading-tight">{serie.title}</p>
          </Link>
        ))}
        {loading && series.length === 0 && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-gray-800" />
            <div className="h-2.5 bg-gray-800 rounded mt-2 w-3/4" />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button onClick={() => setPage(p => p + 1)} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition">
            {loading ? 'Cargando...' : `Cargar más (${total - series.length} restantes)`}
          </button>
        </div>
      )}
    </div>
  );
}
