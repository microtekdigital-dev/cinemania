import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// solo letras, números, guiones — previene SSRF/path traversal
const SLUG_REGEX = /^[a-z0-9-]+$/;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json({ embeds: [], downloads: [] });
  }

  try {
    const res = await fetch(`https://www.luvana.pro/peliculas/${slug}`, {
      headers: { 'user-agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 }
    });
    const html = await res.text();

    const postIdMatch = html.match(/"postId"\s*:\s*(\d+)/);
    if (!postIdMatch) return NextResponse.json({ embeds: [], downloads: [] });

    const playerRes = await fetch(
      `https://www.luvana.pro/api/media/player?postId=${postIdMatch[1]}`,
      { headers: { referer: `https://www.luvana.pro/peliculas/${slug}`, 'user-agent': 'Mozilla/5.0' } }
    );
    const player = await playerRes.json();

    return NextResponse.json({
      embeds: player.data?.embeds || [],
      downloads: player.data?.downloads || [],
    });
  } catch {
    return NextResponse.json({ embeds: [], downloads: [] });
  }
}
