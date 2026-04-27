import { createServerClient } from './supabase';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Embed {
  url: string;
  lang: string | null;
  server: string | null;
  quality: string | null;
}

export interface Download {
  url: string;
  lang?: string | null;
  quality?: string | null;
}

export interface Movie {
  slug: string;
  title: string;
  original_title: string | null;
  year: string | null;
  poster: string | null;
  backdrop: string | null;
  overview: string | null;
  rating: number | null;
  genre: string[];
  trailer: string | null;
  embeds: Embed[];
  downloads: Download[];
}

export interface MovieFilters {
  search?: string;
  genre?: string;
  year?: string;
  page?: number;
}

export interface PaginatedMovies {
  movies: Partial<Movie>[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchMovie {
  slug: string;
  title: string;
  original_title: string | null;
  year: string | null;
  poster: string | null;
  rating: number | null;
}

export interface HomeMovie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  backdrop: string | null;
  rating: number | null;
  genre: string[];
  trailer: string | null;
}

export interface HomeMovies {
  trending: HomeMovie[];
  topRated: HomeMovie[];
  recent: HomeMovie[];
  action: HomeMovie[];
  drama: HomeMovie[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 60;
const HOME_SELECT = 'slug,title,year,poster,backdrop,rating,genre';
const LIST_SELECT = 'slug,title,original_title,year,poster,rating,genre';

// ── Repository functions ──────────────────────────────────────────────────────

export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('getMovieBySlug error:', error);
      return null;
    }

    return data as Movie ?? null;
  } catch (err) {
    console.error('getMovieBySlug unexpected error:', err);
    return null;
  }
}

export async function getMovies(filters?: MovieFilters): Promise<PaginatedMovies> {
  const empty: PaginatedMovies = { movies: [], total: 0, page: 1, pageSize: PAGE_SIZE };
  try {
    const supabase = createServerClient();
    const page = !filters?.page || filters.page <= 0 ? 1 : filters.page;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('movies')
      .select(LIST_SELECT, { count: 'exact' });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.genre) {
      query = query.contains('genre', [filters.genre]);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('getMovies error:', error);
      return empty;
    }

    return {
      movies: (data ?? []) as Partial<Movie>[],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    };
  } catch (err) {
    console.error('getMovies unexpected error:', err);
    return empty;
  }
}

export async function getAllGenres(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('movies').select('genre');

    if (error) {
      console.error('getAllGenres error:', error);
      return [];
    }

    const genres = new Set<string>();
    data?.forEach(row => row.genre?.forEach((g: string) => genres.add(g)));
    return Array.from(genres).sort();
  } catch (err) {
    console.error('getAllGenres unexpected error:', err);
    return [];
  }
}

export async function getAllYears(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('movies')
      .select('year')
      .not('year', 'is', null);

    if (error) {
      console.error('getAllYears error:', error);
      return [];
    }

    const years = [...new Set<string>(data?.map(r => r.year).filter(Boolean))];
    return years.sort((a, b) => b.localeCompare(a));
  } catch (err) {
    console.error('getAllYears unexpected error:', err);
    return [];
  }
}

export async function getMoviesForHome(): Promise<HomeMovies> {
  const empty: HomeMovies = { trending: [], topRated: [], recent: [], action: [], drama: [] };
  try {
    const supabase = createServerClient();

    const [trending, topRated, recent, action, drama] = await Promise.all([
      supabase
        .from('movies')
        .select(HOME_SELECT)
        .gte('rating', 7)
        .order('rating', { ascending: false })
        .limit(20),
      supabase
        .from('movies')
        .select(HOME_SELECT)
        .order('rating', { ascending: false })
        .limit(20),
      supabase
        .from('movies')
        .select(HOME_SELECT)
        .order('year', { ascending: false })
        .limit(20),
      supabase
        .from('movies')
        .select(HOME_SELECT)
        .contains('genre', ['Acción'])
        .limit(20),
      supabase
        .from('movies')
        .select(HOME_SELECT)
        .contains('genre', ['Drama'])
        .limit(20),
    ]);

    if (trending.error) console.error('getMoviesForHome trending error:', trending.error);
    if (topRated.error) console.error('getMoviesForHome topRated error:', topRated.error);
    if (recent.error) console.error('getMoviesForHome recent error:', recent.error);
    if (action.error) console.error('getMoviesForHome action error:', action.error);
    if (drama.error) console.error('getMoviesForHome drama error:', drama.error);

    return {
      trending: (trending.data ?? []) as HomeMovie[],
      topRated: (topRated.data ?? []) as HomeMovie[],
      recent: (recent.data ?? []) as HomeMovie[],
      action: (action.data ?? []) as HomeMovie[],
      drama: (drama.data ?? []) as HomeMovie[],
    };
  } catch (err) {
    console.error('getMoviesForHome unexpected error:', err);
    return empty;
  }
}

export async function getMoviesForSearch(): Promise<SearchMovie[]> {
  try {
    const supabase = createServerClient();
    const all: SearchMovie[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('movies')
        .select('slug,title,original_title,year,poster,rating')
        .range(from, from + pageSize - 1);
      if (error || !data || data.length === 0) break;
      all.push(...(data as SearchMovie[]));
      from += pageSize;
      if (data.length < pageSize) break;
    }
    return all;
  } catch (err) {
    console.error('getMoviesForSearch unexpected error:', err);
    return [];
  }
}

export async function getRelatedMovies(slug: string, genres: string[], title: string, limit = 12): Promise<HomeMovie[]> {
  try {
    const supabase = createServerClient();
    if (!genres.length) return [];

    // Extraer primera palabra clave del título (>4 chars)
    const titleWords = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);

    const [sagaResult, genreResult] = await Promise.all([
      // Saga: mismo título Y mismo género (ambas condiciones)
      titleWords.length > 0
        ? supabase
            .from('movies')
            .select(HOME_SELECT)
            .ilike('title', `%${titleWords[0]}%`)
            .overlaps('genre', genres)  // debe compartir género
            .neq('slug', slug)
            .order('rating', { ascending: false })
            .limit(limit)
        : Promise.resolve({ data: [] }),
      // Género: mismo género, ordenado por rating
      supabase
        .from('movies')
        .select(HOME_SELECT)
        .contains('genre', [genres[0]])  // debe tener el género principal
        .neq('slug', slug)
        .order('rating', { ascending: false })
        .limit(limit * 2),
    ]);

    const combined = [
      ...((sagaResult as any).data ?? []),
      ...((genreResult as any).data ?? []),
    ];
    const seen = new Set<string>();
    const unique = combined.filter((m: any) => {
      if (seen.has(m.slug)) return false;
      seen.add(m.slug);
      return true;
    });

    return unique.slice(0, limit) as HomeMovie[];
  } catch {
    return [];
  }
}

export async function getWatchHistory(userId: string, limit = 12): Promise<HomeMovie[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('watch_history')
      .select(`watched_at, movies(${HOME_SELECT})`)
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(limit);
    return ((data ?? []).map((r: any) => r.movies).filter(Boolean)) as HomeMovie[];
  } catch {
    return [];
  }
}
