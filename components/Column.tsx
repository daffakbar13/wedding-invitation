'use client';

import { useEffect, type ReactNode } from 'react';

interface Props {
  /** settings.outsideColor; white when the invitation sets none. */
  outsideColor?: string;
  className?: string;
  children: ReactNode;
}

/** The mobile-width column, centred on every screen size, with the outside colour around it. */
export function Column({ outsideColor = '#FFFFFF', className = '', children }: Props) {
  // The body carries the colour too, so overscroll and short pages show it.
  useEffect(() => {
    document.documentElement.style.setProperty('--outside', outsideColor);
  }, [outsideColor]);

  return (
    <div className="stage" style={{ background: outsideColor }}>
      <main className={`phone ${className}`} aria-live="polite">
        {children}
      </main>
    </div>
  );
}
