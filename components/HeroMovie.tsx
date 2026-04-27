'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Movie {
  slug: string;
  title: string;
  year: string;
  poster: string;
  backdrop: string;
  overview: string;
  rating: string;
  genre: string[];
  trailer: string | null;
}

export default function HeroMovie({ movie }: { movie: Movie }) {
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* Backdrop */}
      {movie.backdrop && (
        <>
          <img src={movie.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/40 to-transparent" />
        </>
      )}

      {/* Trailer overlay */}
      {showTrailer && movie.trailer && (
        <div className="absolute inset-0 z-10 bg-black">
          <iframe src={movie.trailer + '?autoplay=1'} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" />
          <button onClick={() => setShowTrailer(false)} className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm hover:bg-black/80">
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 pt-20">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">DESTACADA</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-2 leading-tight">{movie.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-3">
            <span className="text-yellow-400 font-bold">⭐ {movie.rating}</span>
            <span>{movie.year}</span>
            {movie.genre?.slice(0, 3).map((g: string) => (
              <span key={g} className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{g}</span>
            ))}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-5">{movie.overview}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/pelicula/${movie.slug}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm">
              ▶ Reproducir
            </Link>
            {movie.trailer && (
              <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg transition text-sm backdrop-blur">
                🎬 Ver Trailer
              </button>
            )}
            <Link href={`/pelicula/${movie.slug}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg transition text-sm backdrop-blur">
              ℹ Más Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
