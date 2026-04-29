'use client';
import { useEffect } from 'react';

export default function WatchHistoryTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('watch_history') || '[]') as string[];
      const updated = [slug, ...history.filter(s => s !== slug)].slice(0, 50);
      localStorage.setItem('watch_history', JSON.stringify(updated));
    } catch {}
  }, [slug]);
  return null;
}
