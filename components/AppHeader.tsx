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
      <div className="flex items-center gap-3 px-4 py-2 h-14">
        <Logo />
        <nav className="hidden sm:flex items-center gap-1 ml-2">
          {navLinks.map(({ href, label, page }) => (
            <Link
              key={href}
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
          <SearchBar movies={movies} series={series} />
        </div>
      </div>
    </header>
  );
}
