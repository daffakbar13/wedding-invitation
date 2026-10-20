import type { ComponentType, LazyExoticComponent } from 'react';
import type { Dictionary } from './i18n.ts';
import type { Guest, Invitation, Lang } from './types.ts';

/** What the core hands to a theme. The theme renders everything inside the mobile column. */
export interface ThemeProps {
  invitation: Invitation;
  guest: Guest;
  lang: Lang;
  /** The theme's own texts in the current language; {name} placeholders filled from vars. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** False when the device has no WebGL or asks for reduced motion: render the non-3D fallback. */
  has3d: boolean;
}

/** One entry in themes/registry.ts. */
export interface ThemeDefinition {
  /** Folder name and the value of settings.theme, e.g. "garden-arch". */
  id: string;
  name: string;
  /** Every UI text the theme shows, in every language (same keys in each). */
  texts: Record<Lang, Dictionary>;
  /** Shown while the theme loads; keep it light (no three.js). */
  Loading: ComponentType<Pick<ThemeProps, 'invitation' | 't'>>;
  /** The invitation itself, loaded lazily so each theme's 3D code is its own chunk. */
  Component: LazyExoticComponent<ComponentType<ThemeProps>>;
}
