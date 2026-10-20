'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/components/kit/useScrollReveal';
import { requestMotionPermission, useTilt } from '@/components/kit/useTilt';
import type { ThemeProps } from '@/lib/theme';
import { Cover } from './Cover';
import { Gallery } from './Gallery';
import { Hero } from './Hero';
import { Closing, CountdownSection, Couple, Events, Greeting, Quote } from './Sections';

const STEPS = ['intro-start', 'intro-names', 'env-open', 'is-leaving', 'curtain-closed'];

/**
 * Garden Arch: a photo cover with a 3D envelope; "Open Invitation" opens the envelope,
 * then curtains part onto the couple photo with falling petals and spinning gold rings.
 * Motion steps are classes on the root (see garden-arch.css); CSS transitions move between them.
 */
export default function GardenArch({ invitation, guest, lang, t, has3d }: ThemeProps) {
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const playOpen = useRef(false);
  const [screen, setScreen] = useState<'cover' | 'opened'>('cover');
  const [opening, setOpening] = useState(false);

  const tilt = useTilt(root, has3d);
  useScrollReveal(root, screen === 'opened');

  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const classes = () => root.current?.classList;
  /** Apply a step at once, without its transition. */
  const jumpTo = (step: string) => {
    const el = root.current;
    if (!el) return;
    el.classList.add('no-anim', step);
    void el.offsetHeight;
    el.classList.remove('no-anim');
  };

  // Cover intro: names first, then the envelope floats up with the button.
  // The cleanup also cancels the opening's timers when the theme unmounts.
  useLayoutEffect(() => {
    const pending = timers.current;
    if (has3d) {
      jumpTo('intro-start');
      later(60, () => classes()?.replace('intro-start', 'intro-names'));
      later(1500, () => classes()?.remove('intro-names'));
    }
    const el = root.current;
    return () => {
      pending.forEach(clearTimeout);
      timers.current = [];
      el?.classList.remove(...STEPS);
    };
  }, [has3d]);

  // Opened: start at the top; after the envelope, the curtains start closed and part.
  useLayoutEffect(() => {
    if (screen !== 'opened') return;
    window.scrollTo(0, 0);
    if (!playOpen.current) return;
    playOpen.current = false;
    jumpTo('curtain-closed');
    later(150, () => classes()?.remove('curtain-closed'));
  }, [screen]);

  const open = () => {
    setOpening(true);
    requestMotionPermission();
    if (!has3d) {
      setScreen('opened');
      return;
    }
    classes()?.add('env-open');
    later(1700, () => classes()?.add('is-leaving'));
    later(2600, () => {
      classes()?.remove('env-open', 'is-leaving');
      playOpen.current = true;
      setScreen('opened');
    });
  };

  const props = { invitation, lang, t };
  return (
    <div ref={root} className={`ga${has3d ? '' : ' no3d'}`} data-screen={screen}>
      {screen === 'cover' ? (
        <Cover invitation={invitation} guest={guest} t={t} opening={opening} onOpen={open} />
      ) : (
        <div className="invitation">
          <Hero invitation={invitation} guest={guest} lang={lang} t={t} has3d={has3d} tilt={tilt} />
          <Quote {...props} />
          <Greeting {...props} />
          <Couple {...props} />
          <Events {...props} />
          <CountdownSection {...props} />
          <Gallery invitation={invitation} t={t} has3d={has3d} />
          <Closing {...props} />
        </div>
      )}
    </div>
  );
}
