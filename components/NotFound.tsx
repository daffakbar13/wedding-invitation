'use client';

import { useState } from 'react';
import { coreTexts } from '@/lib/core-texts';
import type { Lang } from '@/lib/types';
import { Column } from './Column';
import { LanguageSwitch } from './LanguageSwitch';

/** Unknown or altered link. No invitation is known here, so no theme and no settings apply. */
export function NotFound() {
  const [lang, setLang] = useState<Lang>('en');
  const text = coreTexts[lang];

  return (
    <Column>
      <LanguageSwitch lang={lang} label={text.language} onChange={setLang} />
      <section className="core-screen core-notfound">
        <div className="nf-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <rect x="8" y="16" width="48" height="34" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M8 20l24 17 24-17" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="48" cy="46" r="10" fill="var(--core-paper)" stroke="currentColor" strokeWidth="2.5" />
            <path d="M48 41v6M48 50.5v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="nf-title" lang={lang}>{text.nfTitle}</h1>
        <p className="nf-body" lang={lang}>{text.nfBody}</p>
      </section>
    </Column>
  );
}
