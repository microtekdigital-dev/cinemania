import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const s = searchParams.get('s') || '1';
  const e = searchParams.get('e') || '1';

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const url = `https://cuevana3.st/serie/${slug}/episodio-${s}x${e}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
      next: { revalidate: 3600 }, // cache 1 hora
    });

    if (!res.ok) return NextResponse.json({ embeds: [] });

    const html = await res.text();

    // Extraer data-server
    const serverMatches = [...html.matchAll(/data-server="([^"]+)"/g)].map(m => m[1]);

    // Extraer langs del HTML — buscar tab-video-item con su nombre
    const tabMatches = [...html.matchAll(/tab-video-item[^>]*>[\s\S]*?tab-video-name[^>]*>([^<]+)<[\s\S]*?data-server="([^"]+)"/g)];

    const embeds = serverMatches.map((url, i) => {
      // Intentar extraer lang del contexto
      const langMatch = html.match(new RegExp(`([^<]{3,50})</[^>]+>\\s*[^<]*<[^>]+>[^<]*<[^>]+data-server="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      return {
        url,
        server: 'Cuevana',
        lang: 'Latino',
        quality: 'HD',
      };
    });

    // Intentar extraer langs correctamente
    const tabBlocks = html.split('tab-video-item');
    const embedsWithLang = tabBlocks.slice(1).map(block => {
      const urlMatch = block.match(/data-server="([^"]+)"/);
      const langMatch = block.match(/tab-video-name[^>]*>([^<]+)</);
      if (!urlMatch) return null;
      return {
        url: urlMatch[1],
        server: 'Cuevana',
        lang: langMatch?.[1]?.trim() || 'Latino',
        quality: 'HD',
      };
    }).filter(Boolean);

    return NextResponse.json({ embeds: embedsWithLang.length ? embedsWithLang : embeds });
  } catch (err) {
    return NextResponse.json({ embeds: [] });
  }
}
