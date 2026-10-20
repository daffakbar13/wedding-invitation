'use client';

import { LANGS, type Lang } from '@/lib/types';

interface Props {
  lang: Lang;
  label: string;
  onChange: (lang: Lang) => void;
  hidden?: boolean;
}

/** Always-visible EN/ID switch; changing it re-renders every text in place, no reload. */
export function LanguageSwitch({ lang, label, onChange, hidden }: Props) {
  return (
    <div className="lang-bar" style={hidden ? { visibility: 'hidden' } : undefined}>
      <div className="lang-switch" role="group" aria-label={label}>
        {LANGS.map((l) => (
          <button key={l} type="button" aria-pressed={l === lang} onClick={() => onChange(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
