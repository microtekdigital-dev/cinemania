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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ position: 'relative', paddingBottom: '56.25%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <iframe
          key={current}
          src={embeds[current]?.url}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          onError={() => setFailed(prev => new Set([...prev, current]))}
        />
      </div>
      {embeds.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
          {embeds.map((e, i) => !failed.has(i) && (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              tabIndex={0}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: current === i ? '#2563eb' : '#374151',
                color: current === i ? '#ffffff' : '#d1d5db',
                minWidth: '80px',
              }}
            >
              {e.server || e.lang} {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
