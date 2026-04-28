import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';
import Logo from '@/components/Logo';
import SeriePlayer from '@/components/SeriePlayer';
import { getSerieBySlug } from '@/lib/series-repository';
import { notFound } from 'next/navigation';

export default async function SeriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const serie = await getSerieBySlug(slug);
  if (!serie) notFound();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full z-[100] bg-gray-950/95 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
        <Logo />
        <nav className="hidden sm:flex items-center gap-1 ml-2">
          <a href="/" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Películas</a>
          <a href="/series" className="px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Series</a>
        </nav>
        <div className="flex-1" />
        <UserMenu />
      </header>

      {/* Hero */}
      <div className="relative w-full h-[50vh] min-h-[350px]">
        {serie.backdrop && (
          <>
            <img src={serie.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 pt-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">{serie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-2">
              {serie.rating && <span className="text-yellow-400 font-bold">⭐ {serie.rating}</span>}
              <span>{serie.year}</span>
              {serie.seasons > 0 && <span>{serie.seasons} temporada{serie.seasons > 1 ? 's' : ''}</span>}
              {serie.status && <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{serie.status}</span>}
              {serie.genre?.slice(0, 3).map(g => (
                <span key={g} className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{g}</span>
              ))}
            </div>
            <p className="text-gray-300 text-sm line-clamp-2">{serie.overview}</p>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto">
        {serie.tmdb_id && (
          <SeriePlayer tmdbId={serie.tmdb_id} totalSeasons={serie.seasons} embeds={serie.embeds} serieSlug={serie.slug} />
        )}

        {/* Trailer */}
        {serie.trailer && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">Trailer</h2>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={serie.trailer.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
