import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import SerieRow from '@/components/SerieRow';
import SeriesGrid from '@/components/SeriesGrid';
import { getSeriesForHome, getAllSeriesForSearch, getAllSeriesCountries } from '@/lib/series-repository';
import { getMoviesForSearch } from '@/lib/movie-repository';

export default async function SeriesPage() {
  const [allSeries, searchMovies, searchSeries, countries] = await Promise.all([
    getSeriesForHome(300),
    getMoviesForSearch(),
    getAllSeriesForSearch(),
    getAllSeriesCountries(),
  ]).catch(() => [[], [], [], []]) as [any[], any[], any[], string[]];

  const topRated = [...allSeries].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 30);
  const recent = [...allSeries].sort((a, b) => (b.year ?? '').localeCompare(a.year ?? '')).slice(0, 30);

  // Agrupar por género
  const byGenre: Record<string, typeof allSeries> = {};
  for (const serie of allSeries) {
    for (const g of serie.genre ?? []) {
      if (!byGenre[g]) byGenre[g] = [];
      byGenre[g].push(serie);
    }
  }
  const topGenres = Object.entries(byGenre)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full z-[100] bg-gray-950/95 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center gap-3">
          <Logo />
          <nav className="hidden sm:flex items-center gap-1 shrink-0">
            <a href="/" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Películas</a>
            <a href="/series" className="px-3 py-1.5 text-sm font-semibold text-white bg-white/10 rounded-lg transition">Series</a>
          </nav>
          <div className="flex-1 min-w-0">
            <SearchBar movies={searchMovies} series={searchSeries} />
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="pt-16 px-4 py-6 space-y-2">
        <h1 className="text-2xl font-black mb-4">📺 Series</h1>

        <SerieRow title="⭐ Mejor valoradas" series={topRated} />
        <SerieRow title="🆕 Más recientes" series={recent} />
        {topGenres.map(([genre, series]) => (
          <SerieRow key={genre} title={genre} series={series.slice(0, 30)} />
        ))}

        <div className="pt-4">
          <h2 className="text-lg font-bold mb-4">🔍 Todo el catálogo</h2>
          <SeriesGrid countries={countries} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
