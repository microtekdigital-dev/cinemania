'use client';
import { useState, useEffect, useCallback } from 'react';

interface Embed {
  url: string;
  server: string;
  lang?: string;
  quality?: string;
}

interface SeriePlayerProps {
  tmdbId: number;
  totalSeasons: number;
  embeds?: Embed[];
  serieSlug?: string; // slug para cuevana3
}

function buildEpisodeUrl(url: string, season: number, episode: number): string {
  url = url.replace(/(\/tv\/\d+\/)(\d+)\/(\d+)/, `$1${season}/${episode}`);
  url = url.replace(/(\/embed\/tv\/\d+\/)(\d+)\/(\d+)/, `$1${season}/${episode}`);
  url = url.replace(/season=\d+/, `season=${season}`).replace(/episode=\d+/, `episode=${episode}`);
  return url;
}

function isCuevanaEmbed(url: string) {
  return url?.includes('cuevana3') || url?.includes('video.cuevana3');
}

export default function SeriePlayer({ tmdbId, totalSeasons, embeds = [], serieSlug }: SeriePlayerProps) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [cuevanaEmbeds, setCuevanaEmbeds] = useState<Embed[]>([]);
  const [loadingCuevana, setLoadingCuevana] = useState(false);

  // Servidores base (VidLink, VidSrc, etc.)
  const baseServers: Embed[] = [
    { server: 'VidLink', url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?sub_label=Spanish&player=jw&autoplay=true`, lang: 'Multilenguaje', quality: 'HD' },
    { server: 'VidSrc', url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`, lang: 'Multilenguaje', quality: 'HD' },
  ];

  // Embeds no-cuevana del JSON (luvana, etc.)
  const staticEmbeds = embeds.filter(e => !isCuevanaEmbed(e.url) && !e.url?.includes('vidlink') && !e.url?.includes('vidsrc'));

  // Detectar si hay cuevana_slug guardado en los embeds
  const hasCuevana = embeds.some(e => isCuevanaEmbed(e.url));
  const rawCuevanaSlug = serieSlug || (hasCuevana ? embeds.find(e => isCuevanaEmbed(e.url))?.url?.match(/cuevana3\.st\/serie\/([^/]+)/)?.[1] : null);
  // Quitar el año del slug para cuevana3 (breaking-bad-2008 → breaking-bad)
  const cuevanaSlug = rawCuevanaSlug?.replace(/-\d{4}$/, '') || null;

  // Cargar embeds de cuevana cuando cambia episodio
  const loadCuevanaEmbeds = useCallback(async (s: number, e: number) => {
    if (!cuevanaSlug) return;
    setLoadingCuevana(true);
    try {
      const res = await fetch(`/api/cuevana?slug=${cuevanaSlug}&s=${s}&e=${e}`);
      const data = await res.json();
      setCuevanaEmbeds(data.embeds || []);
    } catch {
      setCuevanaEmbeds([]);
    } finally {
      setLoadingCuevana(false);
    }
  }, [cuevanaSlug]);

  useEffect(() => {
    loadCuevanaEmbeds(season, episode);
  }, [season, episode, loadCuevanaEmbeds]);

  // Todos los servidores combinados
  const allServers = [...baseServers, ...staticEmbeds, ...cuevanaEmbeds];

  const currentEmbed = allServers[selectedIdx] || allServers[0];
  const currentUrl = currentEmbed ? buildEpisodeUrl(currentEmbed.url, season, episode) : '';

  function getLabel(s: Embed) {
    if (s.server === 'Online' || !s.server) {
      try { return new URL(s.url).hostname.replace('www.', '').split('.')[0]; } catch {}
    }
    return s.server;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Ver Online</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={season} onChange={e => { setSeason(Number(e.target.value)); setEpisode(1); setSelectedIdx(0); }}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({ length: totalSeasons }, (_, i) => (
            <option key={i + 1} value={i + 1}>Temporada {i + 1}</option>
          ))}
        </select>
        <select value={episode} onChange={e => { setEpisode(Number(e.target.value)); setSelectedIdx(0); }}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({ length: 30 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Episodio {i + 1}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {allServers.map((s, idx) => (
          <button key={idx} onClick={() => setSelectedIdx(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              selectedIdx === idx ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}>
            {getLabel(s)}
            {s.lang && s.lang !== 'Multilenguaje' && (
              <span className="ml-1 text-xs opacity-70">({s.lang.split(' ')[0]})</span>
            )}
          </button>
        ))}
        {loadingCuevana && (
          <span className="px-4 py-2 text-sm text-gray-500">Cargando...</span>
        )}
      </div>

      <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
        {currentUrl && (
          <iframe
            key={`${selectedIdx}-${season}-${episode}`}
            src={currentUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
          />
        )}
      </div>
    </div>
  );
}
