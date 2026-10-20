'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Adds the class "in" to every `.reveal` element inside root once it scrolls into view.
 * Elements already on screen get it at once. Styling of .reveal / .reveal.in is the theme's.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !root.current) return;
    const els = [...root.current.querySelectorAll<HTMLElement>('.reveal:not(.in)')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [root, active]);
}
