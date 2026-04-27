import HeroMovie from '@/components/HeroMovie';
import MovieRow from '@/components/MovieRow';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import movies from '@/lib/movies.json';

export default function Home() {
  const all = movies as any[];

  const featured = all.find(m => m.backdrop && m.trailer) || all[0];

  // tendencias: rating alto y año reciente
  const trending = [...all]
    .filter(m => m.rating && parseFloat(m.rating) >= 7 && parseInt(m.year) >= 2020)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 20);

  // aclamadas por la crítica: rating muy alto
  const topRated = [...all]
    .filter(m => m.rating && parseFloat(m.rating) >= 8)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 20);

  // estrenos: año más reciente
  const recent = [...all]
    .filter(m => m.year)
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 20);

  // acción
  const action = all.filter(m => m.genre?.includes('Acción')).slice(0, 20);

  // drama
  const drama = all.filter(m => m.genre?.includes('Drama')).slice(0, 20);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-4">
          <a href="/" className="shrink-0">
            <img src="/cinemania.png" alt="Cinemanía" className="h-36" />
          </a>
          <SearchBar movies={all.map(m => ({ slug: m.slug, title: m.title, year: m.year, poster: m.poster, rating: m.rating }))} />
        </div>
      </header>

      <div className="pt-16">
        <HeroMovie movie={featured} />
      </div>

      <div className="px-4 py-6 space-y-2">
        <MovieRow title="🔥 Tendencias" movies={trending} />
        <MovieRow title="⭐ Aclamadas por la crítica" movies={topRated} />
        <MovieRow title="🆕 Estrenos recientes" movies={recent} />
        <MovieRow title="💥 Acción" movies={action} />
        <MovieRow title="🎭 Drama" movies={drama} />

        <div className="pt-4">
          <h2 className="text-lg font-bold mb-4">🎬 Todo el catálogo</h2>
          <MovieGrid movies={all} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
