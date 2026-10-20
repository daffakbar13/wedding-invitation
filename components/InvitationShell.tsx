'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { coreTexts } from '@/lib/core-texts';
import { detect3d } from '@/lib/has3d';
import { translator } from '@/lib/i18n';
import type { Guest, Invitation, Lang } from '@/lib/types';
import { getTheme } from '@/themes/registry';
import { Column } from './Column';
import { LanguageSwitch } from './LanguageSwitch';

interface Props {
  invitation: Invitation;
  guest: Guest;
}

/**
 * Core around every theme: the column with the outside colour, the language switch
 * (default language from settings) and the 3D check. The theme renders the rest.
 */
export function InvitationShell({ invitation, guest }: Props) {
  const theme = getTheme(invitation.settings.theme);
  const [lang, setLang] = useState<Lang>(invitation.settings.defaultLang);
  // Unknown until mounted: WebGL and reduced motion can only be checked in the browser.
  const [has3d, setHas3d] = useState<boolean | null>(null);

  useEffect(() => setHas3d(detect3d()), []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => translator(theme.texts, lang), [theme, lang]);
  const { Component, Loading } = theme;

  return (
    <Column outsideColor={invitation.settings.outsideColor} className={`theme-${theme.id}`}>
      <LanguageSwitch
        lang={lang}
        label={coreTexts[lang].language}
        onChange={setLang}
        hidden={has3d === null}
      />
      {has3d === null ? (
        <Loading invitation={invitation} t={t} />
      ) : (
        <Suspense fallback={<Loading invitation={invitation} t={t} />}>
          <Component invitation={invitation} guest={guest} lang={lang} t={t} has3d={has3d} />
        </Suspense>
      )}
    </Column>
  );
}
