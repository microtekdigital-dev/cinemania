import Link from 'next/link';
import Image from 'next/image';

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/pelicula/${movie.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
        <img
          src={movie.poster || undefined}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
          {movie.rating}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-white font-semibold truncate">{movie.title}</p>
        <p className="text-gray-400 text-sm">{movie.year}</p>
      </div>
    </Link>
  );
}
