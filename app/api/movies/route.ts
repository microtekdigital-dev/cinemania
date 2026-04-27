import { NextRequest, NextResponse } from 'next/server';
import { getMovies } from '../../../lib/movie-repository';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search = searchParams.get('search') ?? undefined;
  const genre = searchParams.get('genre') ?? undefined;
  const year = searchParams.get('year') ?? undefined;
  const pageParam = searchParams.get('page');

  // Validar que page sea un entero positivo si se proporciona
  let page: number | undefined;
  if (pageParam !== null) {
    const parsed = Number(pageParam);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json({ error: 'page inválido' }, { status: 400 });
    }
    page = parsed;
  }

  const result = await getMovies({ search, genre, year, page });
  return NextResponse.json(result);
}
