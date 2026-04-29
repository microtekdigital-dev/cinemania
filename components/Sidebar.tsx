'use client';

export type CategoryId =
  | 'estrenos' | 'populares' | 'top-rated' | 'proximos'
  | 'locales-ar' | 'locales-mx' | 'locales-es'
  | 'series-popular' | 'series-ultimas' | 'series-mejores';

export const CATEGORY_TITLES: Record<CategoryId, string> = {
  'estrenos':        'Estrenos',
  'populares':       'Películas Populares',
  'top-rated':       'Top Rated',
  'proximos':        'Próximos Estrenos',
  'locales-ar':      'Películas Argentinas',
  'locales-mx':      'Películas Mexicanas',
  'locales-es':      'Películas Españolas',
  'series-popular':  'Series Populares',
  'series-ultimas':  'Últimas Series',
  'series-mejores':  'Mejores Series',
};

const SECTIONS = [
  {
    title: 'PELÍCULAS BOX OFFICE',
    items: [
      { id: 'estrenos' as CategoryId,  label: 'Estrenos' },
      { id: 'populares' as CategoryId, label: 'Populares' },
      { id: 'top-rated' as CategoryId, label: 'Top Rated' },
      { id: 'proximos' as CategoryId,  label: 'Próximos' },
    ],
  },
  {
    title: 'PELÍCULAS LOCALES',
    items: [
      { id: 'locales-ar' as CategoryId, label: 'Argentina' },
      { id: 'locales-mx' as CategoryId, label: 'México' },
      { id: 'locales-es' as CategoryId, label: 'España' },
    ],
  },
  {
    title: 'SERIES',
    items: [
      { id: 'series-popular' as CategoryId,  label: 'Popular' },
      { id: 'series-ultimas' as CategoryId,  label: 'Últimas' },
      { id: 'series-mejores' as CategoryId,  label: 'Mejores' },
    ],
  },
];

interface SidebarProps {
  activeCategory: CategoryId;
  onCategoryChange: (cat: CategoryId) => void;
}

export default function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  return (
    <aside
      className="w-[220px] shrink-0 py-4 pr-2 overflow-y-auto"
      style={{ backgroundColor: '#030712' }}
    >
      {SECTIONS.map(section => (
        <div key={section.title} className="mb-5">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3 mb-2">
            {section.title}
          </p>
          {section.items.map(item => (
            <button
              key={item.id}
              onClick={() => onCategoryChange(item.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2 ${
                activeCategory === item.id
                  ? 'text-blue-400 bg-white/5 font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-gray-500">◆</span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
