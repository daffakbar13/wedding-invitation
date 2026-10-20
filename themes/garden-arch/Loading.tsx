import type { ThemeProps } from '@/lib/theme';

export function Loading({ invitation, t }: Pick<ThemeProps, 'invitation' | 't'>) {
  return (
    <div className="ga">
      <section className="ga-screen ga-loading" aria-label={t('loading')}>
        <div className="monogram monogram-pulse" aria-hidden="true">
          <span>{invitation.groom.shortName[0]}</span><i>&amp;</i><span>{invitation.bride.shortName[0]}</span>
        </div>
        <p className="muted">{t('loading')}</p>
      </section>
    </div>
  );
}
