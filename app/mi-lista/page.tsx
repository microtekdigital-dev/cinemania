import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';

export default async function MiListaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/bienvenida');

  const { data: favorites } = await supabase
    .from('favorites')
    .select('movie_slug, created_at, movies(slug, title, poster, year, rating)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const movies = (favorites ?? []).map((f: any) => f.movies).filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <a href="/"><img src="/cinemania.png" alt="Cinemanía" className="h-36" /></a>
        <UserMenu />
      </header>

      <div className="pt-24 px-4 sm:px-8 max-w-6xl mx-auto pb-12">
        <h1 className="text-2xl font-black mb-6">Mi Lista</h1>

        {movies.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🎬</p>
            <p className="text-lg">Todavía no agregaste películas a tu lista.</p>
            <Link href="/" className="mt-4 inline-block text-blue-400 hover:underline">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {movies.map((movie: any) => (
              <Link key={movie.slug} href={`/pelicula/${movie.slug}`} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  {movie.poster
                    ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{movie.title}</div>
                  }
                  {movie.rating && (
                    <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 text-xs font-bold px-1 py-0.5 rounded">
                      {movie.rating}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1 truncate">{movie.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
