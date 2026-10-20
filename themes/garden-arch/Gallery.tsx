import { useEffect, useRef, useState } from 'react';
import type { ThemeProps } from '@/lib/theme';
import { photoStyle } from './photo';
import { SplitText } from './SplitText';

type Props = Pick<ThemeProps, 'invitation' | 't' | 'has3d'>;

const PLACEHOLDERS = 6;
const CARD_WIDTH = 150;
// Fallback grid shape for the first six photos
const GRID = ['wide', '', '', 'tall', '', ''];

/** Placeholder gradient class for photo i (used until the couple adds photos). */
const ph = (i: number) => `ph-${(i % PLACEHOLDERS) + 1}`;

/** 3D ring of photos (swipe or arrows to turn, tap to open); a flat grid without 3D. */
export function Gallery({ invitation, t, has3d }: Props) {
  const photos: (string | undefined)[] = invitation.photos.gallery.length
    ? invitation.photos.gallery
    : Array.from({ length: PLACEHOLDERS }, () => undefined);
  const n = photos.length;
  const step = 360 / n;
  const radius = Math.round(CARD_WIDTH / 2 / Math.tan(Math.PI / n)) + 10;

  const [rot, setRot] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startX: 0, startRot: 0, moved: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const snap = (deg: number) => Math.round(deg / step) * step;
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    setRot(snap(rot));
  };
  const show = (i: number) => setOpen(((i % n) + n) % n);
  const openAt = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    show(i);
  };
  const close = () => {
    setOpen(null);
    lastFocus.current?.focus();
  };

  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        lastFocus.current?.focus();
      }
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + n) % n));
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % n));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, n]);

  return (
    <section className="sec sec-gallery">
      <SplitText as="h2" className="reveal" text={t('galleryTitle')} />
      <p className="muted small sec-sub reveal">{t('gallerySub')}</p>
      {has3d ? (
        <>
          <div
            className="carousel reveal"
            aria-roledescription="carousel"
            aria-label={t('photos')}
            onPointerDown={(e) => {
              drag.current = { startX: e.clientX, startRot: rot, moved: 0 };
              setDragging(true);
            }}
            onPointerMove={(e) => {
              if (!dragging) return;
              drag.current.moved = Math.abs(e.clientX - drag.current.startX);
              setRot(drag.current.startRot + (e.clientX - drag.current.startX) * 0.5);
            }}
            // No pointer capture: a tap must still reach the photo card under the finger.
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
          >
            <div className={`car-ring${dragging ? ' dragging' : ''}`} style={{ transform: `translateZ(-${radius}px) rotateY(${rot}deg)` }}>
              {photos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`card-ph photo ${ph(i)}`}
                  style={{ ...photoStyle(src), transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
                  aria-label={t('photo', { n: i + 1 })}
                  onClick={() => { if (drag.current.moved < 6) openAt(i); }}
                />
              ))}
            </div>
          </div>
          <div className="car-controls reveal">
            <button type="button" className="car-btn" aria-label={t('prevPhoto')} onClick={() => setRot(snap(rot + step))}>‹</button>
            <span className="muted small">{t('galleryHint')}</span>
            <button type="button" className="car-btn" aria-label={t('nextPhoto')} onClick={() => setRot(snap(rot - step))}>›</button>
          </div>
        </>
      ) : (
        <div className="gallery">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`ph photo ${ph(i)} ${GRID[i] ?? ''}`}
              style={photoStyle(src)}
              aria-label={t('photo', { n: i + 1 })}
              onClick={() => openAt(i)}
            />
          ))}
        </div>
      )}
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={t('photo', { n: open + 1 })}>
          <button ref={closeBtn} type="button" className="lb-btn lb-close" aria-label={t('close')} onClick={close}>✕</button>
          <button type="button" className="lb-btn lb-prev" aria-label={t('prevPhoto')} onClick={() => show(open - 1)}>‹</button>
          <div className={`lb-photo photo ${ph(open)}`} style={photoStyle(photos[open])} />
          <button type="button" className="lb-btn lb-next" aria-label={t('nextPhoto')} onClick={() => show(open + 1)}>›</button>
          <p className="lb-count">{t('photoOf', { n: open + 1, t: n })}</p>
        </div>
      )}
    </section>
  );
}
