import Link from 'next/link';

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating?: number | null;
  overview?: string | null;
  genre?: string[];
}

interface MovieCardProps {
  movie: Movie;
  linkPrefix?: '/pelicula' | '/serie';
}

export default function MovieCard({ movie, linkPrefix = '/pelicula' }: MovieCardProps) {
  return (
    <Link href={`${linkPrefix}/${movie.slug}`} className="group block" tabIndex={0}>
      <div className="relative overflow-hidden rounded-lg bg-gray-800" style={{ paddingBottom: '150%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {movie.poster
          ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{movie.title}</div>
        }
        {/* Year badge — top left, blue */}
        {movie.year && (
          <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded" style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#2563eb', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
            {movie.year}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">▶</span>
        </div>
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-1 truncate leading-tight">{movie.title}</p>
    </Link>
  );
}
