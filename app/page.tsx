import HeroMovie from '@/components/HeroMovie';
import MovieRow from '@/components/MovieRow';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import { getMoviesForHome, getMoviesForSearch, getAllGenres, getAllYears } from '@/lib/movie-repository';

export default async function Home() {
  let homeData;
  let searchMovies;
  let genres: string[] = [];
  let years: string[] = [];

  try {
    [homeData, searchMovies, genres, years] = await Promise.all([
      getMoviesForHome(),
      getMoviesForSearch(),
      getAllGenres(),
      getAllYears(),
    ]);
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
      <header className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-4">
          <a href="/" className="shrink-0"><img src="/cinemania.png" alt="Cinemanía" className="h-36" /></a>
          <SearchBar movies={searchMovies} />
          <UserMenu />
        </div>
      </header>
      <div className="pt-16">
        <HeroMovie movie={featured} />
      </div>
      <div className="px-4 py-6 space-y-2">
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
