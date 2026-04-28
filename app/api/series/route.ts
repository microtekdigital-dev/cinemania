import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

const PAGE_SIZE = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const country = searchParams.get('country') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const supabase = createServerClient();

    // Obtener géneros únicos en paralelo
    let query = supabase
      .from('series')
      .select('slug,title,original_title,year,poster,rating,genre,country', { count: 'exact' });

    if (search) query = query.or(`title.ilike.%${search}%,original_title.ilike.%${search}%`);
    if (genre) query = query.contains('genre', [genre]);
    if (country) query = query.contains('country', [country]);

    const [seriesResult, genresResult] = await Promise.all([
      query.order('rating', { ascending: false }).range(from, to),
      supabase.from('series').select('genre'),
    ]);

    const genres = new Set<string>();
    genresResult.data?.forEach(row => row.genre?.forEach((g: string) => genres.add(g)));

    return NextResponse.json({
      series: seriesResult.data ?? [],
      total: seriesResult.count ?? 0,
      page,
      genres: Array.from(genres).sort(),
    });
  } catch (err) {
    return NextResponse.json({ series: [], total: 0, page, genres: [] }, { status: 500 });
  }
}
