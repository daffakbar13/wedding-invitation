'use client';

import { useEffect, useRef, type RefObject } from 'react';

export interface Tilt {
  /** Smoothed tilt, -1…1 on each axis. */
  x: number;
  y: number;
  /** Horizontal pointer speed, decays to 0; for "wind" effects. */
  wind: number;
}

/**
 * Tilt from the phone's motion sensor, or from the pointer on desktop. While enabled it writes
 * --tx / --ty (-1…1) on target every frame for CSS, and returns a ref the 3D scenes can read.
 * On iOS the sensor needs requestMotionPermission() from a tap.
 */
export function useTilt(target: RefObject<HTMLElement | null>, enabled: boolean) {
  const tilt = useRef<Tilt>({ x: 0, y: 0, wind: 0 });

  useEffect(() => {
    if (!enabled) return;
    const goal = { x: 0, y: 0 };
    let lastX: number | null = null;
    let frame = 0;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const onPointer = (e: PointerEvent) => {
      const box = target.current?.getBoundingClientRect();
      if (!box) return;
      goal.x = clamp((e.clientX - (box.left + box.width / 2)) / (box.width / 2));
      goal.y = clamp((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2));
      if (lastX !== null) tilt.current.wind = Math.max(-60, Math.min(60, tilt.current.wind + (e.clientX - lastX) * 1.5));
      lastX = e.clientX;
    };
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      goal.x = clamp(e.gamma / 30);
      goal.y = clamp((e.beta - 45) / 30);
    };
    const loop = () => {
      const t = tilt.current;
      t.x += (goal.x - t.x) * 0.08;
      t.y += (goal.y - t.y) * 0.08;
      t.wind *= 0.95;
      target.current?.style.setProperty('--tx', t.x.toFixed(3));
      target.current?.style.setProperty('--ty', t.y.toFixed(3));
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onPointer);
    window.addEventListener('deviceorientation', onOrientation);
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
      cancelAnimationFrame(frame);
    };
  }, [target, enabled]);

  return tilt;
}

/** iOS asks once for the motion sensor, and only from a user tap. Elsewhere this is a no-op. */
export function requestMotionPermission() {
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<unknown> } | undefined;
  DOE?.requestPermission?.().catch(() => {});
}
