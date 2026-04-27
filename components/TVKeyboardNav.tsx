'use client';
import { useEffect } from 'react';

export default function TVKeyboardNav() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const el = document.activeElement as HTMLElement;
        if (el && (el.tagName === 'A' || el.tagName === 'BUTTON')) {
          el.click();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return null;
}
