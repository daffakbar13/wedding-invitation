'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { Tilt } from '@/components/kit/useTilt';

const COUNT = 28;
const COLORS = ['#EBD3C8', '#EBD3C8', '#E7D7B8']; // blush, blush, gold-soft

interface Petal {
  x: number; y: number; z: number;
  fall: number; sway: number; phase: number;
  rx: number; ry: number; vx: number; vy: number;
  /** How strongly the finger's wind moves it: nearer petals move more. */
  k: number;
}

function PetalField({ tilt }: { tilt: RefObject<Tilt> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { viewport, size } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Spread over width and depth with fixed steps so every visit looks the same.
  const petals = useMemo<Petal[]>(() => Array.from({ length: COUNT }, (_, i) => {
    const z = -2.5 + ((i * 83) % 400) / 100;
    return {
      x: ((i * 37) % 100) / 100 - 0.5,
      y: ((i * 53) % 100) / 100,
      z,
      fall: 0.35 + (i % 5) * 0.08,
      sway: 0.15 + (i % 3) * 0.08,
      phase: i * 1.7,
      rx: i, ry: i * 0.5,
      vx: 1 + (i % 4) * 0.4, vy: 0.8 + (i % 3) * 0.5,
      k: 0.5 + (z + 2.5) / 4,
    };
  }), []);

  useLayoutEffect(() => {
    const color = new THREE.Color();
    petals.forEach((_, i) => mesh.current?.setColorAt(i, color.set(COLORS[i % COLORS.length])));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [petals]);

  useFrame((state, dt) => {
    if (!mesh.current) return;
    const h = viewport.height + 1;
    const w = viewport.width * 1.2;
    const unitsPerPx = viewport.width / size.width;
    const time = state.clock.elapsedTime;
    petals.forEach((p, i) => {
      p.y -= (p.fall * dt) / h;
      if (p.y < 0) p.y += 1;
      p.rx += p.vx * dt;
      p.ry += p.vy * dt;
      const x = p.x * w + Math.sin(time * 0.6 + p.phase) * p.sway + tilt.current.wind * p.k * unitsPerPx;
      dummy.position.set(x, (p.y - 0.5) * h, p.z);
      dummy.rotation.set(p.rx, p.ry, 0);
      dummy.scale.set(1.3, 0.9, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <circleGeometry args={[0.032, 10]} />
      <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.85} />
    </instancedMesh>
  );
}

/** Petals falling at real depths through the hero, pushed sideways by the finger. */
export default function Petals({ tilt }: { tilt: RefObject<Tilt> }) {
  return (
    <div className="petals" aria-hidden="true">
      {/* flat: no tone mapping, so the petals keep the theme's exact blush and gold */}
      <Canvas flat dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        <PetalField tilt={tilt} />
      </Canvas>
    </div>
  );
}
