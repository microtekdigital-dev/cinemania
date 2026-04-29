import { NextRequest, NextResponse } from 'next/server';
import { getMovies } from '../../../lib/movie-repository';
import { createServerClient } from '../../../lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search = searchParams.get('search') ?? undefined;
  const genre = searchParams.get('genre') ?? undefined;
  const year = searchParams.get('year') ?? undefined;
  const country = searchParams.get('country') ?? undefined;
  const slugsParam = searchParams.get('slugs');
  const pageParam = searchParams.get('page');

  // Soporte para slugs específicos (últimas vistas)
  if (slugsParam) {
    const slugs = slugsParam.split(',').filter(Boolean).slice(0, 20);
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from('movies')
        .select('slug,title,year,poster,rating,genre')
        .in('slug', slugs);
      // Mantener el orden original
      const ordered = slugs.map(s => data?.find(m => m.slug === s)).filter(Boolean);
      return NextResponse.json({ movies: ordered, total: ordered.length, page: 1, pageSize: 20 });
    } catch {
      return NextResponse.json({ movies: [], total: 0, page: 1, pageSize: 20 });
    }
  }

  // Validar que page sea un entero positivo si se proporciona
  let page: number | undefined;
  if (pageParam !== null) {
    const parsed = Number(pageParam);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json({ error: 'page inválido' }, { status: 400 });
    }
    page = parsed;
  }

  const result = await getMovies({ search, genre, year, country, page });
  return NextResponse.json(result);
}
