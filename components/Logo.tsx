import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="shrink-0 select-none">
      <span
        className="text-2xl tracking-wider"
        style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}
      >
        <span className="text-white">CINE</span>
        <span className="text-blue-500">MANÍA</span>
      </span>
    </Link>
  );
}
