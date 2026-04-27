'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/bienvenida');
    router.refresh();
  };

  if (!user) return null;

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition"
      >
        <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
          {initials}
        </span>
        <span className="text-sm text-white hidden sm:block max-w-32 truncate">{displayName}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-xs text-gray-400">Conectado como</p>
              <p className="text-sm text-white truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
