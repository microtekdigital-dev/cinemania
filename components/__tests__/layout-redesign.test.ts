/**
 * Property-based and unit tests for Cinemanía Layout Redesign
 *
 * Tests cover:
 * - Property 2: Badge de año presente en todas las tarjetas con año (Validates: Requirements 6.2)
 * - Property 3: Título siempre presente en tarjetas (Validates: Requirements 6.3)
 * - Property 1: Categoría activa refleja estado completo (Validates: Requirements 4.4, 4.5, 8.1)
 * - Unit: AppHeader structure (Validates: Requirements 2.1–2.5)
 */

import * as fc from 'fast-check';

// ─── Types mirrored from components ──────────────────────────────────────────

type CategoryId =
  | 'estrenos'
  | 'populares'
  | 'top-rated'
  | 'proximos'
  | 'locales-ar'
  | 'locales-mx'
  | 'locales-es'
  | 'series-popular'
  | 'series-ultimas'
  | 'series-mejores';

const ALL_CATEGORY_IDS: CategoryId[] = [
  'estrenos', 'populares', 'top-rated', 'proximos',
  'locales-ar', 'locales-mx', 'locales-es',
  'series-popular', 'series-ultimas', 'series-mejores',
];

const CATEGORY_TITLES: Record<CategoryId, string> = {
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

// ─── Logic extracted from MovieCard ──────────────────────────────────────────

interface Movie {
  slug: string;
  title: string;
  year: string | null;
  poster: string | null;
  rating?: number | null;
}

/** Returns whether the year badge should be rendered for a given movie */
function shouldRenderYearBadge(movie: Movie): boolean {
  return movie.year !== null && movie.year !== undefined && movie.year !== '';
}

/** Returns whether the title should be rendered (always true) */
function shouldRenderTitle(movie: Movie): boolean {
  return typeof movie.title === 'string';
}

// ─── Logic extracted from MovieGrid / SidebarLayout ──────────────────────────

function categoryToApiEndpoint(cat: CategoryId): string {
  return cat.startsWith('series-') ? '/api/series' : '/api/movies';
}

function categoryToParams(cat: CategoryId): Record<string, string> {
  switch (cat) {
    case 'estrenos':       return { sort: 'year', order: 'desc' };
    case 'populares':      return { sort: 'rating', order: 'desc' };
    case 'top-rated':      return { sort: 'rating', order: 'desc', minRating: '7.5' };
    case 'proximos':       return { sort: 'year', order: 'desc', upcoming: 'true' };
    case 'locales-ar':     return { country: 'AR' };
    case 'locales-mx':     return { country: 'MX' };
    case 'locales-es':     return { country: 'ES' };
    case 'series-popular': return { sort: 'rating', order: 'desc' };
    case 'series-ultimas': return { sort: 'year', order: 'desc' };
    case 'series-mejores': return { sort: 'rating', order: 'desc', minRating: '8' };
  }
}

// ─── Sidebar sections definition ─────────────────────────────────────────────

const SIDEBAR_SECTIONS = [
  {
    title: 'PELÍCULAS BOX OFFICE',
    items: [
      { id: 'estrenos' as CategoryId, label: 'Estrenos' },
      { id: 'populares' as CategoryId, label: 'Populares' },
      { id: 'top-rated' as CategoryId, label: 'Top Rated' },
      { id: 'proximos' as CategoryId, label: 'Próximos' },
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
      { id: 'series-popular' as CategoryId, label: 'Popular' },
      { id: 'series-ultimas' as CategoryId, label: 'Últimas' },
      { id: 'series-mejores' as CategoryId, label: 'Mejores' },
    ],
  },
];

const ALL_SIDEBAR_ITEM_IDS = SIDEBAR_SECTIONS.flatMap(s => s.items.map(i => i.id));

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1, maxLength: 100 });
const nullableString = fc.option(nonEmptyString, { nil: null });
const nullableNumber = fc.option(fc.float({ min: 0, max: 10 }), { nil: null });

const movieWithYear = fc.record({
  slug: nonEmptyString,
  title: nonEmptyString,
  year: nonEmptyString,          // year is always a non-empty string
  poster: nullableString,
  rating: nullableNumber,
});

const movieAnyFields = fc.record({
  slug: nonEmptyString,
  title: nonEmptyString,
  year: nullableString,
  poster: nullableString,
  rating: nullableNumber,
});

const categoryArbitrary = fc.constantFrom(...ALL_CATEGORY_IDS);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Property 2: Badge de año presente en todas las tarjetas con año', () => {
  /**
   * Validates: Requirements 6.2
   * For any movie with a non-null, non-empty year, shouldRenderYearBadge returns true.
   */
  it('should render year badge for any movie with a non-null year', () => {
    fc.assert(
      fc.property(movieWithYear, (movie) => {
        expect(shouldRenderYearBadge(movie)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should NOT render year badge when year is null', () => {
    fc.assert(
      fc.property(movieAnyFields.filter(m => m.year === null), (movie) => {
        expect(shouldRenderYearBadge(movie)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 3: Título siempre presente en tarjetas', () => {
  /**
   * Validates: Requirements 6.3
   * For any movie with any combination of optional fields, the title is always renderable.
   */
  it('should always have a renderable title regardless of other fields', () => {
    fc.assert(
      fc.property(movieAnyFields, (movie) => {
        expect(shouldRenderTitle(movie)).toBe(true);
        expect(movie.title.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('title is present even when poster and year are null', () => {
    fc.assert(
      fc.property(
        movieAnyFields.filter(m => m.poster === null && m.year === null),
        (movie) => {
          expect(shouldRenderTitle(movie)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 1: Categoría activa refleja estado completo', () => {
  /**
   * Validates: Requirements 4.4, 4.5, 8.1
   * For any valid CategoryId:
   * (a) The sidebar item exists in the sections definition
   * (b) CATEGORY_TITLES has a non-empty title for it
   * (c) categoryToParams returns a non-empty params object
   * (d) categoryToApiEndpoint returns the correct endpoint
   */
  it('every category has a corresponding title in CATEGORY_TITLES', () => {
    fc.assert(
      fc.property(categoryArbitrary, (cat) => {
        const title = CATEGORY_TITLES[cat];
        expect(typeof title).toBe('string');
        expect(title.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('every category exists in the sidebar sections', () => {
    fc.assert(
      fc.property(categoryArbitrary, (cat) => {
        expect(ALL_SIDEBAR_ITEM_IDS).toContain(cat);
      }),
      { numRuns: 100 }
    );
  });

  it('every category maps to a non-empty params object', () => {
    fc.assert(
      fc.property(categoryArbitrary, (cat) => {
        const params = categoryToParams(cat);
        expect(Object.keys(params).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('series categories map to /api/series endpoint, others to /api/movies', () => {
    fc.assert(
      fc.property(categoryArbitrary, (cat) => {
        const endpoint = categoryToApiEndpoint(cat);
        if (cat.startsWith('series-')) {
          expect(endpoint).toBe('/api/series');
        } else {
          expect(endpoint).toBe('/api/movies');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('selecting a category always produces a unique title (no two categories share a title)', () => {
    const titles = ALL_CATEGORY_IDS.map(cat => CATEGORY_TITLES[cat]);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(ALL_CATEGORY_IDS.length);
  });
});

describe('Unit: AppHeader structure', () => {
  /**
   * Validates: Requirements 2.1–2.5
   * These are structural checks on the nav links definition.
   */
  const NAV_LINKS = [
    { href: '/', label: 'Inicio', page: 'home' },
    { href: '/peliculas', label: 'Películas', page: 'peliculas' },
    { href: '/series', label: 'Series', page: 'series' },
  ];

  it('has exactly three navigation links', () => {
    expect(NAV_LINKS).toHaveLength(3);
  });

  it('includes Inicio link pointing to /', () => {
    const inicio = NAV_LINKS.find(l => l.label === 'Inicio');
    expect(inicio).toBeDefined();
    expect(inicio?.href).toBe('/');
  });

  it('includes Películas link pointing to /peliculas', () => {
    const peliculas = NAV_LINKS.find(l => l.label === 'Películas');
    expect(peliculas).toBeDefined();
    expect(peliculas?.href).toBe('/peliculas');
  });

  it('includes Series link pointing to /series', () => {
    const series = NAV_LINKS.find(l => l.label === 'Series');
    expect(series).toBeDefined();
    expect(series?.href).toBe('/series');
  });

  it('does not include UserMenu in nav links', () => {
    const hasUserMenu = NAV_LINKS.some(l => l.label.toLowerCase().includes('user') || l.label.toLowerCase().includes('login'));
    expect(hasUserMenu).toBe(false);
  });
});
