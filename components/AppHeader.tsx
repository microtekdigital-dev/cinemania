import Link from 'next/link';
import Logo from './Logo';
import SearchBar from './SearchBar';

interface AppHeaderProps {
  movies?: any[];
  series?: any[];
  activePage?: 'home' | 'peliculas' | 'series';
}

export default function AppHeader({ movies = [], series = [], activePage }: AppHeaderProps) {
  const navLinks = [
    { href: '/', label: 'Inicio', page: 'home' },
    { href: '/', label: 'Películas', page: 'peliculas' },
    { href: '/series', label: 'Series', page: 'series' },
  ];

  return (
    <header
      className="fixed top-0 w-full z-[100] border-b border-gray-800"
      style={{ backgroundColor: '#030712' }}
    >
      <div className="flex items-center gap-3 px-4 py-2 h-14" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Logo />
        <nav className="hidden sm:flex items-center gap-1 ml-2">
          {navLinks.map(({ href, label, page }) => (
            <Link
              key={label}
              href={href}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                activePage === page
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 min-w-0 max-w-md ml-auto">
          <a
            href="/buscar"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '24px',
              padding: '10px 18px',
              gap: '10px',
              textDecoration: 'none',
              color: '#9ca3af',
              fontSize: '15px',
            }}
          >
            <svg style={{ width: '18px', height: '18px', minWidth: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <span>Buscar películas y series...</span>
          </a>
        </div>
      </div>
    </header>
  );
}
