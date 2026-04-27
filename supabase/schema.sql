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
