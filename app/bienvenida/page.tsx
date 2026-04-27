'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Logo from '@/components/Logo';

export default function BienvenidaPage() {
  const [mode, setMode] = useState<'login' | 'register' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Email o contraseña incorrectos');
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('¡Cuenta creada! Revisa tu email para confirmar.');
      }
    }
    setLoading(false);
  };

  const openMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    setMessage('');
    setEmail('');
    setPassword('');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="mb-6 flex justify-center">
          <span className="text-5xl tracking-wider" style={{ fontFamily: 'var(--font-bebas), sans-serif' }}>
            <span className="text-white">CINE</span><span className="text-blue-500">MANÍA</span>
          </span>
        </div>
        <p className="text-gray-400 text-lg mb-10">
          Tu plataforma de películas. Regístrate gratis para acceder al catálogo completo.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => openMode('register')}
            onKeyDown={e => e.key === 'Enter' && openMode('register')}
            tabIndex={0}
            className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition text-base outline-none focus:ring-4 focus:ring-blue-400"
          >
            Crear cuenta
          </button>
          <button
            onClick={() => openMode('login')}
            onKeyDown={e => e.key === 'Enter' && openMode('login')}
            tabIndex={0}
            className="bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition text-base outline-none focus:ring-4 focus:ring-blue-400"
          >
            Ingresar
          </button>
        </div>
      </div>

      {/* Modal */}
      {mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm relative">
            <button
              onClick={() => setMode(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
            <div className="flex justify-center mb-6">
              <span className="text-4xl tracking-wider" style={{ fontFamily: 'var(--font-bebas), sans-serif' }}>
                <span className="text-white">CINE</span><span className="text-blue-500">MANÍA</span>
              </span>
            </div>
            <h2 className="text-xl font-bold mb-6 text-center">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                onClick={() => openMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-400 hover:underline"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
