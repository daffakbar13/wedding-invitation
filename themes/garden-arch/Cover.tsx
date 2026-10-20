import { formatDateShort } from '@/lib/i18n';
import type { ThemeProps } from '@/lib/theme';
import { photoStyle } from './photo';

interface Props extends Pick<ThemeProps, 'invitation' | 'guest' | 't'> {
  opening: boolean;
  onOpen: () => void;
}

const BLOOM = '/themes/garden-arch/bloom.svg';

/** Cover: photo, the couple's names, and the 3D envelope addressed to the attendee. */
export function Cover({ invitation, guest, t, opening, onOpen }: Props) {
  const { groom, bride, photos } = invitation;
  const couple = `${groom.shortName} & ${bride.shortName}`;
  const initials = `${groom.shortName[0]}${bride.shortName[0]}`;

  return (
    <section className="ga-screen ga-cover">
      <div
        className={`cover-photo${photos.cover ? ' photo' : ''}`}
        style={photoStyle(photos.cover)}
        role="img"
        aria-label={t('coverPhoto', { couple })}
      >
        {!photos.cover && <span className="photo-hint">{t('coverHint')}</span>}
      </div>
      <div className="cover-titles">
        <p className="eyebrow">{t('weddingOf')}</p>
        <h1 className="names names-cover">
          <span>{groom.shortName}</span> <i>&amp;</i> <span>{bride.shortName}</span>
        </h1>
        <p className="date-short">{formatDateShort(invitation.events[0].start, invitation.timeZone)}</p>
      </div>
      <div className="cover-envelope">
        <div className="env-scene">
          <div className="env-float">
            <div className="env">
              <div className="env-back" />
              <div className="env-card">
                <p className="monogram-text">{groom.shortName[0]}<i>&amp;</i>{bride.shortName[0]}</p>
                <p className="small">{t('invitedLine')}</p>
              </div>
              <div className="env-front">
                <p className="muted small">{t('dear')}</p>
                <p className="guest-name">{guest.name}</p>
              </div>
              <div className="env-flap" />
              <div className="env-seal" aria-hidden="true">
                <span className="seal-half l" />
                <span className="seal-half r" />
                <b>{initials}</b>
              </div>
            </div>
          </div>
          <div className="blooms" aria-hidden="true">
            <span className="bloom e-tl"><img src={BLOOM} alt="" /></span>
            <span className="bloom e-br"><img src={BLOOM} alt="" /></span>
          </div>
        </div>
        <button type="button" className="btn btn-primary open-btn" onClick={onOpen} disabled={opening}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <span>{t('open')}</span>
        </button>
      </div>
    </section>
  );
}
