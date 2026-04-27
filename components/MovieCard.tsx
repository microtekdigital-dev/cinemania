import Link from 'next/link';

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
  overview?: string | null;
  genre?: string[];
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/pelicula/${movie.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
        {movie.poster
          ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{movie.title}</div>
        }
        {/* Rating badge */}
        {movie.rating && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
            ⭐ {movie.rating}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center justify-center mb-2">
            <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">▶</span>
          </div>
          {movie.overview && (
            <p className="text-white text-xs line-clamp-3 leading-relaxed">{movie.overview}</p>
          )}
          {movie.genre && movie.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genre.slice(0, 2).map(g => (
                <span key={g} className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-1 truncate leading-tight">{movie.title}</p>
      {movie.year && <p className="text-xs text-gray-500">{movie.year}</p>}
    </Link>
  );
}
