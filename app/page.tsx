import HeroMovie from '@/components/HeroMovie';
import MovieRow from '@/components/MovieRow';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import Logo from '@/components/Logo';
import SerieRow from '@/components/SerieRow';
import { createClient } from '@/lib/supabase-server';
import { getMoviesForHome, getMoviesForSearch, getAllGenres, getAllYears, getAllCountries, getWatchHistory, type SearchMovie, type HomeMovies } from '@/lib/movie-repository';
import { getSeriesForHome, getAllSeriesForSearch } from '@/lib/series-repository';

export default async function Home() {
  let homeData: HomeMovies = { trending: [], topRated: [], recent: [], action: [], drama: [] };
  let searchMovies: SearchMovie[] = [];
  let genres: string[] = [];
  let years: string[] = [];
  let countries: string[] = [];
  let continueWatching: any[] = [];
  let topSeries: any[] = [];
  let searchSeries: any[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const results = await Promise.all([
      getMoviesForHome(),
      getMoviesForSearch(),
      getAllGenres(),
      getAllYears(),
      getAllCountries(),
      user ? getWatchHistory(user.id) : Promise.resolve([]),
      getSeriesForHome(20),
      getAllSeriesForSearch(),
    ]);
    [homeData, searchMovies, genres, years, countries, continueWatching, topSeries, searchSeries] = results;
  } catch {
    homeData = { trending: [], topRated: [], recent: [], action: [], drama: [] };
    searchMovies = [];
    searchSeries = [];
  }

  const featured = [
    ...homeData.trending.filter(m => m.backdrop && m.trailer),
    ...homeData.trending.filter(m => m.backdrop && !m.trailer),
  ].slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full z-[100] bg-gray-950/95 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center gap-3">
          <Logo />
          <nav className="hidden sm:flex items-center gap-1 shrink-0">
            <a href="/" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Películas</a>
            <a href="/series" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Series</a>
          </nav>
          <div className="flex-1 min-w-0">
            <SearchBar movies={searchMovies} series={searchSeries} />
          </div>
          <UserMenu />
        </div>
      </header>
      <div className="pt-14">
        <HeroMovie movies={featured} />
      </div>
      <div className="px-4 py-6 space-y-2">
        {continueWatching.length > 0 && (
          <MovieRow title="▶ Continuar viendo" movies={continueWatching} />
        )}
        {topSeries.length > 0 && (
          <SerieRow title="📺 Series populares" series={topSeries} />
        )}
        <MovieRow title="🔥 Tendencias" movies={homeData.trending} />
        <MovieRow title="⭐ Aclamadas por la crítica" movies={homeData.topRated} />
        <MovieRow title="🆕 Estrenos recientes" movies={homeData.recent} />
        <MovieRow title="💥 Acción" movies={homeData.action} />
        <MovieRow title="🎭 Drama" movies={homeData.drama} />
        <div className="pt-4">
          <h2 className="text-lg font-bold mb-4">🎬 Todo el catálogo</h2>
          <MovieGrid genres={genres} years={years} countries={countries} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
