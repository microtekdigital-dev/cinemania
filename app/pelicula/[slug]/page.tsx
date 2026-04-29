import Player from '@/components/Player';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import FavoriteButton from '@/components/FavoriteButton';
import WatchTracker from '@/components/WatchTracker';
import WatchHistoryTracker from '@/components/WatchHistoryTracker';
import ReviewSection from '@/components/ReviewSection';
import MovieRow from '@/components/MovieRow';
import Logo from '@/components/Logo';
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

export default async function MoviePage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ server?: string }> }) {
  const { slug } = await params;
  const { server: serverParam } = await searchParams;
  const [movie, searchMovies] = await Promise.all([
    getMovieBySlug(slug),
    getMoviesForSearch(),
  ]);

  if (!movie) notFound();

  const related = await getRelatedMovies(slug, movie.genre ?? [], movie.title);
  const embeds = (movie.embeds as any[]) || [];
  const currentServer = Math.min(parseInt(serverParam || '0'), Math.max(0, embeds.length - 1));
  const currentEmbed = embeds[currentServer];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
        <Logo />
        <nav className="hidden sm:flex items-center gap-1 ml-2">
          <a href="/" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Películas</a>
          <a href="/series" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Series</a>
        </nav>
        <div className="flex-1 min-w-0">
          <SearchBar movies={searchMovies as any} />
        </div>
        <UserMenu />
      </header>

      {/* Hero con backdrop */}
      <WatchHistoryTracker slug={movie.slug} />
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
              <span className="text-yellow-400 font-bold mr-2">⭐ {movie.rating}</span>
              <span className="mr-2">{movie.year}</span>
              {movie.genre?.slice(0, 3).map((g: string) => (
                <span key={g} className="bg-white/10 px-2 py-0.5 rounded-full text-xs mr-1">{g}</span>
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
          {/* Botones de servidor */}
          {embeds.length > 1 && (
            <div id="server-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
              {embeds.map((e: any, i: number) => (
                <a
                  key={i}
                  href={`/pelicula/${slug}?server=${i}#player`}
                  id={`btn-${i}`}
                  tabIndex={0}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-block',
                    backgroundColor: currentServer === i ? '#2563eb' : '#374151',
                    color: currentServer === i ? '#ffffff' : '#d1d5db',
                    minWidth: '80px',
                    textAlign: 'center',
                  }}
                >
                  {e.server || e.lang || `Servidor ${i + 1}`}
                </a>
              ))}
            </div>
          )}
          {/* Player iframe */}
          {currentEmbed ? (
            <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', paddingBottom: '56.25%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                id="main-player"
                src={currentEmbed.url}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media"
              />
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>No hay links disponibles.</div>
          )}
          {/* Script para Samsung: cambiar servidor sin recargar */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              var embeds = ${JSON.stringify(embeds.map((e: any) => e.url))};
              var btns = document.querySelectorAll('#server-buttons a');
              btns.forEach(function(btn, i) {
                btn.addEventListener('click', function(ev) {
                  ev.preventDefault();
                  var iframe = document.getElementById('main-player');
                  if (iframe) iframe.src = embeds[i];
                  btns.forEach(function(b, j) {
                    b.style.backgroundColor = j === i ? '#2563eb' : '#374151';
                    b.style.color = j === i ? '#ffffff' : '#d1d5db';
                  });
                });
              });
            })();
          ` }} />
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

        {/* Reseñas */}
        <ReviewSection slug={movie.slug} />
      </div>
      <WatchTracker slug={movie.slug} />
      <Footer />
    </main>
  );
}
