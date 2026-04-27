'use client';
import Link from 'next/link';
import { useRef } from 'react';

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
  overview?: string | null;
  genre?: string[];
}

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // deduplicar por slug por si acaso
  const unique = movies.filter((m, i, arr) => arr.findIndex(x => x.slug === m.slug) === i);

  if (!unique.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 px-1">{title}</h2>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {unique.map(movie => (
          <Link key={movie.slug} href={`/pelicula/${movie.slug}`} className="shrink-0 w-28 sm:w-36 group">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{movie.title}</div>
              )}
              {movie.rating && (
                <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 text-xs font-bold px-1 py-0.5 rounded">
                  ⭐ {movie.rating}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                <div className="flex justify-center mb-1">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">▶</span>
                </div>
                {movie.overview && (
                  <p className="text-white text-xs line-clamp-3 leading-tight">{movie.overview}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-1 truncate leading-tight">{movie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
