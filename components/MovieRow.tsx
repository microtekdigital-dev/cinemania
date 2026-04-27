'use client';
import Link from 'next/link';
import { useRef } from 'react';

interface Movie {
  slug: string;
  title: string;
  year: string;
  poster: string;
  rating: string;
}

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  const ref = useRef<HTMLDivElement>(null);

  if (!movies.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 px-1">{title}</h2>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-1 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {movies.map(movie => (
          <Link key={movie.slug} href={`/pelicula/${movie.slug}`} className="shrink-0 w-24 sm:w-32 group">
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
                  {movie.rating}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-1 truncate leading-tight">{movie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
