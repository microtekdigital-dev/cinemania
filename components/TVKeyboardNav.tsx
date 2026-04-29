'use client';
import { useEffect } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

function getFocusable(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => el.offsetParent !== null && !el.closest('[hidden]')
  );
}

export default function TVKeyboardNav() {
  useEffect(() => {
    // Asegurar que el primer elemento tenga foco al cargar
    const first = document.querySelector<HTMLElement>(FOCUSABLE);
    if (first && document.activeElement === document.body) {
      first.focus();
    }

    const handler = (e: KeyboardEvent) => {
      const key = e.key;

      // Enter / OK
      if (key === 'Enter') {
        const el = document.activeElement as HTMLElement;
        if (el && (el.tagName === 'A' || el.tagName === 'BUTTON')) {
          el.click();
          return;
        }
      }

      // Back / Escape
      if (key === 'Escape' || key === 'GoBack' || key === 'BrowserBack') {
        window.history.back();
        return;
      }

      // Navegación con flechas
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

      e.preventDefault();
      const focusable = getFocusable();
      const current = document.activeElement as HTMLElement;
      const idx = focusable.indexOf(current);

      if (idx === -1) {
        focusable[0]?.focus();
        return;
      }

      const currentRect = current.getBoundingClientRect();
      let best: HTMLElement | null = null;
      let bestScore = Infinity;

      for (const el of focusable) {
        if (el === current) continue;
        const rect = el.getBoundingClientRect();

        let dx = 0, dy = 0;
        if (key === 'ArrowRight') { dx = rect.left - currentRect.right; dy = Math.abs(rect.top - currentRect.top); }
        if (key === 'ArrowLeft')  { dx = currentRect.left - rect.right; dy = Math.abs(rect.top - currentRect.top); }
        if (key === 'ArrowDown')  { dy = rect.top - currentRect.bottom; dx = Math.abs(rect.left - currentRect.left); }
        if (key === 'ArrowUp')    { dy = currentRect.top - rect.bottom; dx = Math.abs(rect.left - currentRect.left); }

        if (dx < 0 || dy < 0) continue; // dirección incorrecta

        const score = dy * 3 + dx; // penalizar más la distancia vertical
        if (score < bestScore) { bestScore = score; best = el; }
      }

      if (best) {
        best.focus();
        best.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        // Si no hay elemento en esa dirección, ir al siguiente/anterior en el DOM
        if (key === 'ArrowDown' || key === 'ArrowRight') focusable[Math.min(idx + 1, focusable.length - 1)]?.focus();
        if (key === 'ArrowUp' || key === 'ArrowLeft') focusable[Math.max(idx - 1, 0)]?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return null;
}
