'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-2xl transition-colors ${
            star <= (hover || value) ? 'text-yellow-400' : 'text-gray-600'
          } ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('movie_slug', slug)
      .order('created_at', { ascending: false });
    setReviews(data ?? []);
    if (user) {
      const mine = (data ?? []).find((r: Review) => r.user_id === user.id) ?? null;
      setMyReview(mine);
      if (mine) { setRating(mine.rating); setComment(mine.comment ?? ''); }
    }
  };

  useEffect(() => { load(); }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setLoading(true);
    await supabase.from('reviews').upsert(
      { user_id: userId, movie_slug: slug, rating, comment: comment || null },
      { onConflict: 'user_id,movie_slug' }
    );
    await load();
    setLoading(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold mb-4">
        Reseñas {avgRating && <span className="text-yellow-400 text-base font-normal ml-2">⭐ {avgRating} ({reviews.length})</span>}
      </h2>

      {userId && (
        <form onSubmit={submit} className="bg-gray-900 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400 mb-2">{myReview ? 'Tu reseña' : 'Dejá tu reseña'}</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Comentario opcional..."
            rows={3}
            className="w-full mt-3 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !rating}
            className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition"
          >
            {loading ? 'Guardando...' : myReview ? 'Actualizar' : 'Publicar'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {reviews.filter(r => r.comment).map(r => (
          <div key={r.id} className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <StarRating value={r.rating} />
              <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('es-AR')}</span>
            </div>
            <p className="text-gray-300 text-sm">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-gray-600 text-sm">Todavía no hay reseñas. ¡Sé el primero!</p>
        )}
      </div>
    </div>
  );
}
