'use client';
import { useState } from 'react';
import Sidebar, { type CategoryId, CATEGORY_TITLES } from './Sidebar';
import MovieGrid from './MovieGrid';

interface SidebarLayoutProps {
  searchMovies?: any[];
  searchSeries?: any[];
  genres?: string[];
  years?: string[];
  countries?: string[];
  initialMovies?: any[];
  initialTotal?: number;
}

export default function SidebarLayout({
  genres = [],
  years = [],
  countries = [],
  initialMovies = [],
  initialTotal = 0,
}: SidebarLayoutProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('populares');

  return (
    <div className="flex min-h-screen pt-14" style={{ backgroundColor: '#030712' }}>
      {/* Sidebar */}
      <div className="hidden md:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto border-r border-gray-800/50">
        <Sidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 py-4">
        <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-800">
          {CATEGORY_TITLES[activeCategory]}
        </h2>
        <MovieGrid
          category={activeCategory}
          genres={genres}
          years={years}
          countries={countries}
          initialMovies={activeCategory === 'populares' ? initialMovies : []}
          initialTotal={activeCategory === 'populares' ? initialTotal : 0}
        />
      </main>
    </div>
  );
}
