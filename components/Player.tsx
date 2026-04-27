'use client';
import { useState, useEffect } from 'react';

interface Embed {
  lang: string;
  url: string;
  quality?: string;
  server?: string;
}

interface PlayerProps {
  embeds: Embed[];
  slug?: string;
}

export default function Player({ embeds: initialEmbeds, slug }: PlayerProps) {
  const [embeds, setEmbeds] = useState<Embed[]>(initialEmbeds || []);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialEmbeds?.length === 0 && slug) {
      setLoading(true);
      fetch(`/api/links?slug=${slug}`)
        .then(r => r.json())
        .then(data => { if (data.embeds?.length) setEmbeds(data.embeds); })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  // si el actual falló, pasar al siguiente automáticamente
  useEffect(() => {
    if (failed.has(current)) {
      const next = embeds.findIndex((_, i) => i > current && !failed.has(i));
      if (next !== -1) setCurrent(next);
    }
  }, [failed, current]);

  if (loading) return (
    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
      Cargando links...
    </div>
  );

  const available = embeds.filter((_, i) => !failed.has(i));

  if (!available.length) return (
    <div className="aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2">
      <span className="text-2xl">🎬</span>
      <p className="text-sm">No hay links disponibles.</p>
    </div>
  );

  return (
    <div>
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          key={current}
          src={embeds[current]?.url}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          onError={() => setFailed(prev => new Set([...prev, current]))}
        />
      </div>
      {embeds.length > 1 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {embeds.map((e, i) => !failed.has(i) && (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                current === i ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {e.lang} {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
