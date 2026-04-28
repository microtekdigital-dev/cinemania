'use client';
import { useState } from 'react';

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
}

// Reemplaza temporada/episodio en URLs que los tengan hardcodeados
function buildEpisodeUrl(url: string, season: number, episode: number): string {
  // vidlink: /tv/{id}/1/1
  url = url.replace(/(\/tv\/\d+\/)(\d+)\/(\d+)/, `$1${season}/${episode}`);
  // vidsrc.to: /embed/tv/{id}/1/1
  url = url.replace(/(\/embed\/tv\/\d+\/)(\d+)\/(\d+)/, `$1${season}/${episode}`);
  // vidsrc.me: ?season=1&episode=1
  url = url.replace(/season=\d+/, `season=${season}`).replace(/episode=\d+/, `episode=${episode}`);
  // videasy: /tv/{id}/1/1
  url = url.replace(/(\/tv\/\d+\/)(\d+)\/(\d+)/, `$1${season}/${episode}`);
  return url;
}

export default function SeriePlayer({ tmdbId, totalSeasons, embeds = [] }: SeriePlayerProps) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  // Servidores base siempre disponibles
  const baseServers: Embed[] = [
    { server: 'VidLink', url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?sub_label=Spanish&player=jw&autoplay=true`, lang: 'Multilenguaje', quality: 'HD' },
    { server: 'VidSrc', url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`, lang: 'Multilenguaje', quality: 'HD' },
  ];

  // Embeds de luvana (goodstream, hlswish, voe, etc.) — solo los que no sean vidlink/vidsrc
  const luvanaEmbeds = embeds.filter(e =>
    !e.url?.includes('vidlink') && !e.url?.includes('vidsrc')
  );

  // Combinar: base + todos los embeds de luvana (cada uno es un servidor distinto)
  const allServers = [...baseServers, ...luvanaEmbeds];

  const [selectedIdx, setSelectedIdx] = useState(0);

  // URL del servidor seleccionado, con temporada/episodio actualizado
  const currentEmbed = allServers[selectedIdx] || allServers[0];
  const currentUrl = buildEpisodeUrl(currentEmbed.url, season, episode);

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Ver Online</h2>

      {/* Selectores temporada/episodio */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={season} onChange={e => setSeason(Number(e.target.value))}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({ length: totalSeasons }, (_, i) => (
            <option key={i + 1} value={i + 1}>Temporada {i + 1}</option>
          ))}
        </select>
        <select value={episode} onChange={e => setEpisode(Number(e.target.value))}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({ length: 30 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Episodio {i + 1}</option>
          ))}
        </select>
      </div>

      {/* Botones de servidor */}
      <div className="flex flex-wrap gap-2 mb-3">
        {allServers.map((s, idx) => {
          // Para embeds con server "Online", mostrar el dominio como nombre
          let label = s.server;
          if (s.server === 'Online') {
            try { label = new URL(s.url).hostname.replace('www.', '').split('.')[0]; } catch {}
          }
          return (
            <button key={idx} onClick={() => setSelectedIdx(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                selectedIdx === idx ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}>
              {label}
              {s.lang && s.lang !== 'Multilenguaje' && (
                <span className="ml-1 text-xs opacity-70">({s.lang})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Player */}
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
        <iframe
          key={`${selectedIdx}-${season}-${episode}`}
          src={currentUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
        />
      </div>
    </div>
  );
}
