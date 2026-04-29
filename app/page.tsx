import AppHeader from '@/components/AppHeader';
import SidebarLayout from '@/components/SidebarLayout';
import Footer from '@/components/Footer';
import { getMoviesForSearch, getMovies, type SearchMovie } from '@/lib/movie-repository';
import { getAllSeriesForSearch } from '@/lib/series-repository';

export default async function Home() {
  let searchMovies: SearchMovie[] = [];
  let searchSeries: any[] = [];
  let initialMovies: any[] = [];
  let initialTotal = 0;

  try {
    const [sm, ss, moviesData] = await Promise.all([
      getMoviesForSearch(),
      getAllSeriesForSearch(),
      getMovies({ page: 1 }),
    ]);
    searchMovies = sm;
    searchSeries = ss;
    initialMovies = moviesData.movies || [];
    initialTotal = moviesData.total || 0;
  } catch {
    searchMovies = [];
    searchSeries = [];
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <AppHeader movies={searchMovies} series={searchSeries} activePage="home" />
      <div className="pt-14">
        <SidebarLayout
          initialMovies={initialMovies}
          initialTotal={initialTotal}
        />
      </div>
      <Footer />
    </main>
  );
}
