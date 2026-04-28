'use client';
import { useState } from 'react';

export default function SeriePlayer({ tmdbId, totalSeasons }: { tmdbId: number; totalSeasons: number }) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [server, setServer] = useState('vidlink');

  const servers = [
    { id: 'vidlink', name: 'VidLink', url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?sub_label=Spanish&player=jw&autoplay=true` },
    { id: 'vidsrc', name: 'VidSrc', url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}` },
  ];

  const currentServer = servers.find(s => s.id === server) || servers[0];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Ver Online</h2>
      
      {/* Selectores */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={season} onChange={e => setSeason(Number(e.target.value))}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({length: totalSeasons}, (_, i) => (
            <option key={i+1} value={i+1}>Temporada {i+1}</option>
          ))}
        </select>
        <select value={episode} onChange={e => setEpisode(Number(e.target.value))}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({length: 30}, (_, i) => (
            <option key={i+1} value={i+1}>Episodio {i+1}</option>
          ))}
        </select>
      </div>

      {/* Servidores */}
      <div className="flex flex-wrap gap-2 mb-3">
        {servers.map(s => (
          <button key={s.id} onClick={() => setServer(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              server === s.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Player */}
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
        <iframe
          key={`${server}-${season}-${episode}`}
          src={currentServer.url}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
        />
      </div>
    </div>
  );
}
