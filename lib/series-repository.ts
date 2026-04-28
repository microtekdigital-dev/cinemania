import { createServerClient } from './supabase';

export interface Serie {
  slug: string;
  title: string;
  original_title: string | null;
  year: string | null;
  poster: string | null;
  backdrop: string | null;
  overview: string | null;
  rating: number | null;
  genre: string[];
  country: string[];
  trailer: string | null;
  tmdb_id: number | null;
  seasons: number;
  status: string | null;
  embeds: Array<{ url: string; server: string; lang?: string; quality?: string }>;
}

export async function getSerieBySlug(slug: string): Promise<Serie | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('series').select('*').eq('slug', slug).single();
    return data as Serie ?? null;
  } catch { return null; }
}

export async function getSeriesForHome(limit = 20): Promise<Serie[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('series')
      .select('slug,title,original_title,year,poster,backdrop,rating,genre,trailer,tmdb_id,seasons,status')
      .order('rating', { ascending: false })
      .limit(limit);
    return (data ?? []) as Serie[];
  } catch { return []; }
}

export async function searchSeries(query: string, limit = 8): Promise<Serie[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('series')
      .select('slug,title,original_title,year,poster,rating')
      .or(`title.ilike.%${query}%,original_title.ilike.%${query}%`)
      .limit(limit);
    return (data ?? []) as Serie[];
  } catch { return []; }
}

export async function getAllSeriesForSearch(): Promise<Pick<Serie, 'slug'|'title'|'original_title'|'year'|'poster'|'rating'>[]> {
  try {
    const supabase = createServerClient();
    const all: any[] = [];
    let from = 0;
    while (true) {
      const { data } = await supabase
        .from('series')
        .select('slug,title,original_title,year,poster,rating')
        .range(from, from + 999);
      if (!data || data.length === 0) break;
      all.push(...data);
      from += 1000;
      if (data.length < 1000) break;
    }
    return all;
  } catch { return []; }
}

export async function getAllSeriesCountries(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('series').select('country').not('country', 'is', null);
    const countries = new Set<string>();
    data?.forEach(row => row.country?.forEach((c: string) => countries.add(c)));
    return Array.from(countries).sort();
  } catch { return []; }
}

export async function getSeriesByCountry(country: string, limit = 50): Promise<Serie[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('series')
      .select('slug,title,original_title,year,poster,backdrop,rating,genre,trailer,tmdb_id,seasons,status,country')
      .contains('country', [country])
      .order('rating', { ascending: false })
      .limit(limit);
    return (data ?? []) as Serie[];
  } catch { return []; }
}
