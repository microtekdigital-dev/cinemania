import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

interface RawSerie {
  slug: string;
  title: string;
  originalTitle?: string;
  year?: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  rating?: string | number;
  genre?: string[];
  trailer?: string;
  tmdb_id?: number;
  seasons?: number;
  status?: string;
  embeds?: unknown[];
  [key: string]: unknown;
}

interface SerieRow {
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
  tmdb_id: number | null;
  seasons: number;
  status: string | null;
  embeds: unknown[];
}

export function transformSerie(raw: RawSerie): SerieRow {
  return {
    slug:           raw.slug,
    title:          raw.title,
    original_title: raw.originalTitle != null ? raw.originalTitle : null,
    year:           raw.year != null ? raw.year : null,
    poster:         raw.poster != null ? raw.poster : null,
    backdrop:       raw.backdrop != null ? raw.backdrop : null,
    overview:       raw.overview != null ? raw.overview : null,
    rating:         parseFloat(String(raw.rating)) || null,
    genre:          Array.isArray(raw.genre) ? raw.genre : [],
    trailer:        raw.trailer != null ? raw.trailer : null,
    tmdb_id:        raw.tmdb_id != null ? raw.tmdb_id : null,
    seasons:        raw.seasons != null ? raw.seasons : 1,
    status:         raw.status != null ? raw.status : null,
    embeds:         Array.isArray(raw.embeds) ? raw.embeds : [],
  };
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL en .env.local');
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en .env.local');

  const supabase = createClient(url, key);

  const seriesPath = path.resolve(__dirname, '../lib/series.json');
  if (!fs.existsSync(seriesPath)) {
    throw new Error('Archivo no encontrado: ' + seriesPath);
  }

  let raw: RawSerie[];
  try {
    raw = JSON.parse(fs.readFileSync(seriesPath, 'utf-8'));
  } catch (e: any) {
    throw new Error('Error al parsear series.json: ' + e.message);
  }

  const total = raw.length;
  console.log('Total de series a migrar: ' + total);

  const BATCH_SIZE = 500;
  let processed = 0;
  let errors = 0;

  const batches = chunk(raw, BATCH_SIZE);
  for (const batch of batches) {
    const rows = batch.map(transformSerie);
    const { error } = await supabase.from('series').upsert(rows);

    if (error) {
      console.error('Error en lote (' + processed + '-' + (processed + batch.length - 1) + '): ' + error.message);
      errors++;
    } else {
      processed += batch.length;
      console.log('Procesadas ' + processed + '/' + total + ' series');
    }
  }

  console.log('\nResumen: ' + processed + ' procesadas, ' + errors + ' lote(s) con error.');
}

main().catch(function(err) {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
