-- Esquema de la tabla movies para Cinemanía
-- Ejecutar este script en el SQL Editor de Supabase antes de migrar datos

CREATE TABLE IF NOT EXISTS public.movies (
  slug            text PRIMARY KEY,
  title           text NOT NULL,
  original_title  text,
  year            text,
  poster          text,
  backdrop        text,
  overview        text,
  rating          numeric(3,1),
  genre           text[]   DEFAULT '{}',
  trailer         text,
  country         text[]   DEFAULT '{}',
  embeds          jsonb    DEFAULT '[]',
  downloads       jsonb    DEFAULT '[]'
);

-- Índice para filtrar por año
CREATE INDEX IF NOT EXISTS idx_movies_year   ON public.movies (year);

-- Índice para ordenar por rating descendente
CREATE INDEX IF NOT EXISTS idx_movies_rating ON public.movies (rating DESC);

-- Índice GIN para filtrar por género (array contains)
CREATE INDEX IF NOT EXISTS idx_movies_genre  ON public.movies USING gin (genre);

-- Índice GIN para búsqueda full-text en español sobre el título
CREATE INDEX IF NOT EXISTS idx_movies_title  ON public.movies USING gin (to_tsvector('spanish', title));

-- Tabla de favoritos por usuario
CREATE TABLE IF NOT EXISTS public.favorites (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_slug text NOT NULL REFERENCES public.movies(slug) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_slug)
);

-- RLS: cada usuario solo ve y modifica sus propios favoritos
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Historial de reproducción
CREATE TABLE IF NOT EXISTS public.watch_history (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_slug text NOT NULL REFERENCES public.movies(slug) ON DELETE CASCADE,
  watched_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_slug)
);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own history" ON public.watch_history FOR ALL USING (auth.uid() = user_id);

-- Reseñas y calificaciones
CREATE TABLE IF NOT EXISTS public.reviews (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_slug text NOT NULL REFERENCES public.movies(slug) ON DELETE CASCADE,
  rating     smallint CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_slug)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- Tabla de series
CREATE TABLE IF NOT EXISTS public.series (
  slug            text PRIMARY KEY,
  title           text NOT NULL,
  original_title  text,
  year            text,
  poster          text,
  backdrop        text,
  overview        text,
  rating          numeric(3,1),
  genre           text[]   DEFAULT '{}',
  trailer         text,
  tmdb_id         integer,
  seasons         integer  DEFAULT 1,
  status          text,    -- 'Ended', 'Returning Series', etc.
  embeds          jsonb    DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_series_rating ON public.series (rating DESC);
CREATE INDEX IF NOT EXISTS idx_series_genre  ON public.series USING gin (genre);
CREATE INDEX IF NOT EXISTS idx_series_title  ON public.series USING gin (to_tsvector('spanish', title));

-- RLS: series son públicas para lectura
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Series are public" ON public.series FOR SELECT USING (true);
