import Player from '@/components/Player';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import FavoriteButton from '@/components/FavoriteButton';
import MovieRow from '@/components/MovieRow';
import { getMovieBySlug, getMovies, getMoviesForSearch, getRelatedMovies } from '@/lib/movie-repository';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  try {
    const { movies } = await getMovies({ page: 1 });
    return movies
      .filter(m => m.slug && !m.slug.startsWith('http'))
      .map(m => ({ slug: m.slug }));
  } catch {
    return [];
  }
}

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [movie, searchMovies] = await Promise.all([
    getMovieBySlug(slug),
    getMoviesForSearch(),
  ]);

  if (!movie) notFound();

  const related = await getRelatedMovies(slug, movie.genre ?? []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
        <a href="/" className="shrink-0">
          <img src="/cinemania.png" alt="Cinemanía" className="h-36" />
        </a>
        <SearchBar movies={searchMovies as any} />
        <UserMenu />
      </header>

      {/* Hero con backdrop */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        {movie.backdrop && (
          <>
            <img src={movie.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />
          </>
        )}

        {/* Info sobre el hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 pt-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-3">
              <span className="text-yellow-400 font-bold">⭐ {movie.rating}</span>
              <span>{movie.year}</span>
              {movie.genre?.slice(0, 3).map((g: string) => (
                <span key={g} className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{g}</span>
              ))}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-5 max-w-lg">{movie.overview}</p>

            {/* Botones */}
            <div className="flex flex-wrap gap-3">
              <a href="#player" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm">
                ▶ Reproducir
              </a>
              {movie.trailer && (
                <a href="#trailer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg transition text-sm backdrop-blur">
                  🎬 Trailer
                </a>
              )}
              <FavoriteButton slug={movie.slug} />
              <a href="#info" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg transition text-sm backdrop-blur">
                ℹ Info
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">

        {/* Player */}
        <div id="player" className="mb-8">
          <h2 className="text-lg font-bold mb-3">Ver Online</h2>
          <Player embeds={movie.embeds as any} slug={movie.slug} />
        </div>

        {/* Trailer */}
        {movie.trailer && (
          <div id="trailer" className="mb-8">
            <h2 className="text-lg font-bold mb-3">Trailer</h2>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={movie.trailer.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media"
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div id="info" className="flex gap-6">
          <img src={movie.poster ?? undefined} alt={movie.title} className="w-32 rounded-xl shrink-0 shadow-lg hidden sm:block" />
          <div>
            <h2 className="text-lg font-bold mb-2">{movie.title}</h2>
            {movie.original_title && <p className="text-gray-400 text-sm mb-2">{movie.original_title}</p>}
            <p className="text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
          </div>
        </div>

        {/* Relacionadas */}
        {related.length > 0 && (
          <div className="mt-10">
            <MovieRow title="También te puede gustar" movies={related} />
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
