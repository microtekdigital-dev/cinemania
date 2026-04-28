import { NextRequest, NextResponse } from 'next/server';

const TMDB_KEY = '9966bf776626887596e80e01878f5ee2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tmdbId = searchParams.get('tmdbId');
  const season = searchParams.get('season') || '1';

  if (!tmdbId) return NextResponse.json({ episode_count: 10 });

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?api_key=${TMDB_KEY}&language=es`,
      { next: { revalidate: 86400 } } // cache 24h
    );
    const data = await res.json();
    return NextResponse.json({ episode_count: data.episodes?.length || 10 });
  } catch {
    return NextResponse.json({ episode_count: 10 });
  }
}
