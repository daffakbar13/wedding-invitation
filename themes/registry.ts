import type { ThemeDefinition } from '@/lib/theme';
import gardenArch from './garden-arch';

// Every selectable theme. Adding a theme = one folder under themes/ plus one line here
// (see CLAUDE.md, "Adding a theme"); the core never changes.
export const themes: Record<string, ThemeDefinition> = {
  [gardenArch.id]: gardenArch,
};

export const DEFAULT_THEME = gardenArch.id;

export function getTheme(id: string): ThemeDefinition {
  const theme = themes[id];
  if (!theme) {
    console.error(`Unknown theme "${id}", showing "${DEFAULT_THEME}". Register it in themes/registry.ts.`);
    return themes[DEFAULT_THEME];
  }
  return theme;
}
