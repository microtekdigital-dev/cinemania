import HeroMovie from '@/components/HeroMovie';
import MovieRow from '@/components/MovieRow';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import { createClient } from '@/lib/supabase-server';
import { getMoviesForHome, getMoviesForSearch, getAllGenres, getAllYears, getWatchHistory, type SearchMovie, type HomeMovies } from '@/lib/movie-repository';

export default async function Home() {
  let homeData: HomeMovies = { trending: [], topRated: [], recent: [], action: [], drama: [] };
  let searchMovies: SearchMovie[] = [];
  let genres: string[] = [];
  let years: string[] = [];
  let continueWatching: any[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const results = await Promise.all([
      getMoviesForHome(),
      getMoviesForSearch(),
      getAllGenres(),
      getAllYears(),
      user ? getWatchHistory(user.id) : Promise.resolve([]),
    ]);
    [homeData, searchMovies, genres, years, continueWatching] = results;
  } catch {
    homeData = { trending: [], topRated: [], recent: [], action: [], drama: [] };
    searchMovies = [];
  }

  const featured =
    homeData.trending.find(m => m.backdrop && m.trailer) ??
    homeData.trending[0] ??
    null;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center gap-2">
          <a href="/" className="shrink-0"><img src="/cinemania.png" alt="Cinemanía" className="h-10 sm:h-36" /></a>
          <div className="flex-1 min-w-0">
            <SearchBar movies={searchMovies} />
          </div>
          <UserMenu />
        </div>
      </header>
      <div className="pt-14">
        <HeroMovie movie={featured} />
      </div>
      <div className="px-4 py-6 space-y-2">
        {continueWatching.length > 0 && (
          <MovieRow title="▶ Continuar viendo" movies={continueWatching} />
        )}
        <MovieRow title="🔥 Tendencias" movies={homeData.trending} />
        <MovieRow title="⭐ Aclamadas por la crítica" movies={homeData.topRated} />
        <MovieRow title="🆕 Estrenos recientes" movies={homeData.recent} />
        <MovieRow title="💥 Acción" movies={homeData.action} />
        <MovieRow title="🎭 Drama" movies={homeData.drama} />
        <div className="pt-4">
          <h2 className="text-lg font-bold mb-4">🎬 Todo el catálogo</h2>
          <MovieGrid genres={genres} years={years} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
