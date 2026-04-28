'use client';
import Link from 'next/link';
import { useRef } from 'react';

interface Serie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating: number | null;
  seasons?: number;
}

export default function SerieRow({ title, series }: { title: string; series: Serie[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const unique = series.filter((s, i, arr) => arr.findIndex(x => x.slug === s.slug) === i);
  if (!unique.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 px-1">{title}</h2>
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {unique.map(serie => (
          <Link key={serie.slug} href={`/serie/${serie.slug}`} className="shrink-0 w-28 sm:w-36 group">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
              {serie.poster
                ? <img src={serie.poster} alt={serie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{serie.title}</div>
              }
              {serie.rating && (
                <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 text-xs font-bold px-1 py-0.5 rounded">
                  ⭐ {serie.rating}
                </div>
              )}
              <div className="absolute bottom-1 left-1 bg-blue-600/80 text-white text-xs px-1.5 py-0.5 rounded">
                SERIE
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-1 truncate leading-tight">{serie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
