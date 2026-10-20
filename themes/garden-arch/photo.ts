import type { CSSProperties } from 'react';

/** Background style for a photo URL; undefined keeps the theme's gradient placeholder. */
export function photoStyle(src?: string): CSSProperties | undefined {
  return src ? { backgroundImage: `url("${encodeURI(src)}")` } : undefined;
}
