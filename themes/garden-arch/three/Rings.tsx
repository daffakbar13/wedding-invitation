'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';

const BASE_SPEED = 0.35; // degrees per frame at 60 fps, like the approved prototype
const DEG = Math.PI / 180;

interface Spin { angle: number; speed: number; dragging: boolean; lastX: number }

function Band({ x, rx, ry }: { x: number; rx: number; ry: number }) {
  return (
    <mesh position={[x, 0, 0]} rotation={[rx * DEG, ry * DEG, 0]}>
      <torusGeometry args={[0.72, 0.11, 24, 72]} />
      <meshStandardMaterial color="#D9B56E" emissive="#4A3612" metalness={0.75} roughness={0.28} />
    </mesh>
  );
}

function RingPair({ spin }: { spin: React.RefObject<Spin> }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const s = spin.current;
    if (!s.dragging) s.speed += (BASE_SPEED - s.speed) * 0.02;
    s.angle += s.speed * dt * 60;
    if (group.current) group.current.rotation.y = s.angle * DEG;
  });
  return (
    <group rotation={[-10 * DEG, 0, 0]}>
      <group ref={group}>
        <Band x={-0.5} rx={14} ry={-10} />
        <Band x={0.5} rx={-12} ry={50} />
      </group>
    </group>
  );
}

/** Two linked gold rings that spin on their own; drag sideways to spin them faster. */
export default function Rings({ label }: { label: string }) {
  const spin = useRef<Spin>({ angle: 20, speed: BASE_SPEED, dragging: false, lastX: 0 });
  return (
    <div
      className="rings"
      role="img"
      aria-label={label}
      onPointerDown={(e) => {
        spin.current.dragging = true;
        spin.current.lastX = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!spin.current.dragging) return;
        spin.current.speed = (e.clientX - spin.current.lastX) * 0.8;
        spin.current.lastX = e.clientX;
      }}
      onPointerUp={() => { spin.current.dragging = false; }}
      onPointerCancel={() => { spin.current.dragging = false; }}
    >
      <Canvas dpr={[1, 2]} orthographic camera={{ position: [0, 0, 10], zoom: 30 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 4]} intensity={2.4} />
        <pointLight position={[-3, -1, 3]} intensity={18} color="#FFF3D6" />
        <RingPair spin={spin} />
      </Canvas>
    </div>
  );
}
