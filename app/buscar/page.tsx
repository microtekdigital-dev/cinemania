import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import { getMoviesForSearch } from '@/lib/movie-repository';
import { getAllSeriesForSearch } from '@/lib/series-repository';

export default async function BuscarPage() {
  const [searchMovies, searchSeries] = await Promise.all([
    getMoviesForSearch(),
    getAllSeriesForSearch(),
  ]).catch(() => [[], []]) as [any[], any[]];

  return (
    <main className="min-h-screen text-white" style={{ backgroundColor: '#030712' }}>
      <AppHeader activePage="home" />
      <div style={{ paddingTop: '80px', maxWidth: '800px', margin: '0 auto', padding: '80px 24px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>
          🔍 Buscar
        </h1>
        <SearchBar movies={searchMovies} series={searchSeries} />
      </div>
      <Footer />
    </main>
  );
}
