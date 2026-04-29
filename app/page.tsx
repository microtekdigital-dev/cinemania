import AppHeader from '@/components/AppHeader';
import SidebarLayout from '@/components/SidebarLayout';
import Footer from '@/components/Footer';
import { getMoviesForSearch, type SearchMovie } from '@/lib/movie-repository';
import { getAllSeriesForSearch } from '@/lib/series-repository';

export default async function Home() {
  let searchMovies: SearchMovie[] = [];
  let searchSeries: any[] = [];

  try {
    [searchMovies, searchSeries] = await Promise.all([
      getMoviesForSearch(),
      getAllSeriesForSearch(),
    ]);
  } catch {
    searchMovies = [];
    searchSeries = [];
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <AppHeader movies={searchMovies} series={searchSeries} activePage="home" />
      <div className="pt-14">
        <SidebarLayout searchMovies={searchMovies} searchSeries={searchSeries} />
      </div>
      <Footer />
    </main>
  );
}
