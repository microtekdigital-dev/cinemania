'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function WatchTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const track = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('watch_history').upsert(
        { user_id: user.id, movie_slug: slug, watched_at: new Date().toISOString() },
        { onConflict: 'user_id,movie_slug' }
      );
    };
    track();
  }, [slug]);

  return null;
}
