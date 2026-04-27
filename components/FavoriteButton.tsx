'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function FavoriteButton({ slug }: { slug: string }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_slug', slug)
        .maybeSingle();
      setIsFav(!!data);
      setLoading(false);
    };
    check();
  }, [slug]);

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoading(true);
    if (isFav) {
      await supabase.from('favorites').delete()
        .eq('user_id', user.id).eq('movie_slug', slug);
      setIsFav(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, movie_slug: slug });
      setIsFav(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 font-bold px-6 py-3 rounded-lg transition text-sm backdrop-blur disabled:opacity-50 ${
        isFav
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
    >
      {isFav ? '✓ En mi lista' : '+ Mi lista'}
    </button>
  );
}
