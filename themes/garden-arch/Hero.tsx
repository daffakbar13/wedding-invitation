import { lazy, Suspense, type RefObject } from 'react';
import type { Tilt } from '@/components/kit/useTilt';
import { formatDayLong } from '@/lib/i18n';
import type { ThemeProps } from '@/lib/theme';
import { photoStyle } from './photo';
import { SplitText } from './SplitText';

const Petals = lazy(() => import('./three/Petals'));
const Rings = lazy(() => import('./three/Rings'));

const ASSETS = '/themes/garden-arch';
// Garlands hanging from the valance: [left %, height px, centre strands drop away on open]
const GARLANDS: [number, number, boolean][] = [
  [14, 306, false], [19, 198, false], [26, 252, true], [34, 162, true], [44, 216, true],
  [56, 144, true], [66, 234, true], [74, 180, true], [81, 234, false], [86, 324, false],
];

interface Props extends Pick<ThemeProps, 'invitation' | 'guest' | 'lang' | 't' | 'has3d'> {
  tilt: RefObject<Tilt>;
}

/** Non-3D rings: 30 static gold plates per band in CSS (no WebGL needed). */
function FlatRings({ label }: { label: string }) {
  const plates = Array.from({ length: 30 }, (_, i) => (
    <span key={i} className="seg" style={{ '--a': `${i * 12}deg` } as React.CSSProperties} />
  ));
  return (
    <div className="rings" role="img" aria-label={label}>
      <div className="rings-flat">
        <div className="rings-spin">
          <div className="ring r1">{plates}</div>
          <div className="ring r2">{plates}</div>
        </div>
      </div>
    </div>
  );
}

/** The stage the curtains open onto: couple photo, petals, curtains, and the arch with rings. */
export function Hero({ invitation, guest, lang, t, has3d, tilt }: Props) {
  const { groom, bride, photos } = invitation;
  const rings = <FlatRings label={t('ringsLabel')} />;

  return (
    <section className="sec sec-hero">
      {/* Layers at real depths; the camera dollies forward on open */}
      <div className="scene">
        <div
          className={`hero-photo${photos.hero ? ' photo' : ''}`}
          style={photoStyle(photos.hero)}
          role="img"
          aria-label={t('coverPhoto', { couple: `${groom.shortName} & ${bride.shortName}` })}
        >
          {!photos.hero && <span className="photo-hint">{t('heroHint')}</span>}
        </div>
        <div className="curtains" aria-hidden="true">
          <div className="curtain curtain-left" />
          <div className="curtain curtain-right" />
          <div className="garlands">
            {GARLANDS.map(([left, height, mid]) => (
              <span key={left} className={mid ? 'mid' : undefined} style={{ left: `${left}%`, height }} />
            ))}
          </div>
          <div className="valance" />
        </div>
      </div>
      {has3d && (
        <Suspense fallback={null}>
          <Petals tilt={tilt} />
        </Suspense>
      )}
      <div className="hero-frame">
        <img src={`${ASSETS}/frame.svg`} alt="" className="frame-art" />
        <div className="blooms" aria-hidden="true">
          <span className="bloom b-top"><img src={`${ASSETS}/rose.svg`} alt="" /></span>
          <span className="bloom b-l"><img src={`${ASSETS}/bloom.svg`} alt="" /></span>
          <span className="bloom b-r"><img src={`${ASSETS}/bloom.svg`} alt="" /></span>
          <span className="bloom b-bl"><img src={`${ASSETS}/bloom.svg`} alt="" /></span>
          <span className="bloom b-br"><img src={`${ASSETS}/bloom.svg`} alt="" /></span>
        </div>
        <div className="frame-inner">
          {has3d ? (
            <Suspense fallback={rings}>
              <Rings label={t('ringsLabel')} />
            </Suspense>
          ) : rings}
          <p className="monogram-text">{groom.shortName[0]}<i>&amp;</i>{bride.shortName[0]}</p>
          <SplitText className="date-long in" text={formatDayLong(invitation.events[0].start, lang, invitation.timeZone)} />
          <p className="to-guest">{t('for')} <strong>{guest.name}</strong></p>
        </div>
      </div>
    </section>
  );
}
