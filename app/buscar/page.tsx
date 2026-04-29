import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import { getMovies } from '@/lib/movie-repository';
import { type NextRequest } from 'next/server';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  let results: any[] = [];
  if (query.length >= 2) {
    const data = await getMovies({ search: query, page: 1 }).catch(() => ({ movies: [], total: 0, page: 1, pageSize: 60 }));
    results = data.movies || [];
  }

  return (
    <main className="min-h-screen text-white" style={{ backgroundColor: '#030712' }}>
      <AppHeader activePage="home" />
      <div style={{ paddingTop: '80px', maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>
          🔍 Buscar
        </h1>

        {/* Formulario de búsqueda */}
        <form method="GET" action="/buscar" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Escribí el nombre de la película o serie..."
              autoFocus
              style={{
                flex: 1,
                backgroundColor: '#1f2937',
                border: '2px solid #374151',
                borderRadius: '12px',
                padding: '14px 20px',
                fontSize: '18px',
                color: 'white',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '120px',
              }}
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Resultados */}
        {query && (
          <div>
            <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>
              {results.length > 0
                ? `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`
                : `No se encontraron resultados para "${query}"`
              }
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {results.map((movie, i) => (
                <div key={`${movie.slug}-${i}`} style={{ width: 'calc(16.666% - 10px)', minWidth: '120px' }}>
                  <MovieCard movie={movie} linkPrefix="/pelicula" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!query && (
          <p style={{ color: '#6b7280', fontSize: '16px', textAlign: 'center', marginTop: '48px' }}>
            Escribí el nombre de una película o serie y presioná Buscar
          </p>
        )}
      </div>
      <Footer />
    </main>
  );
}
