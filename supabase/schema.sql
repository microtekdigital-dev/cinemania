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
