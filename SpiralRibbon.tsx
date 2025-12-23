import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpiralRibbonProps {
  isExploding?: boolean;
}

export const SpiralRibbon: React.FC<SpiralRibbonProps> = ({ isExploding = false }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 12000;
  const explosionTimeRef = useRef(0);
  const initialPositions = useRef<Float32Array | null>(null);
  const velocities = useRef<Float32Array | null>(null);

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const height = 10;
    const baseRadius = 4.5;
    const loops = 6;

    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const h = height * (1 - progress);
      const r = baseRadius * progress;
      const angle = progress * Math.PI * 2 * loops;

      const widthSpread = 0.2;
      const radialOffset = (Math.random() - 0.5) * widthSpread;
      const heightOffset = (Math.random() - 0.5) * 0.1;
      
      const x = Math.cos(angle) * (r + radialOffset);
      const y = h + heightOffset;
      const z = Math.sin(angle) * (r + radialOffset);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // 丝带粒子爆炸：比树叶粒子稍快，但同样带有缓慢阻尼
      const dir = new THREE.Vector3(x, (Math.random() - 0.3) * 2, z).normalize();
      const speed = 1.2 + Math.random() * 3.8;
      vels[i * 3] = dir.x * speed;
      vels[i * 3 + 1] = dir.y * speed;
      vels[i * 3 + 2] = dir.z * speed;
    }
    initialPositions.current = new Float32Array(pos);
    velocities.current = vels;
    return { pos };
  }, [count]);

  useEffect(() => {
    if (isExploding) {
      explosionTimeRef.current = 0;
    } else {
      if (pointsRef.current && initialPositions.current) {
        pointsRef.current.geometry.attributes.position.array.set(initialPositions.current);
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  }, [isExploding]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current) {
      if (isExploding) {
        explosionTimeRef.current += delta;
        const et = explosionTimeRef.current;
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const vels = velocities.current!;
        const initials = initialPositions.current!;

        // 梦幻衰减因子
        const factor = (1 - Math.exp(-et * 0.5)) * 10;

        for (let i = 0; i < count; i++) {
          positions[i * 3] = initials[i * 3] + vels[i * 3] * factor;
          positions[i * 3 + 1] = initials[i * 3 + 1] + vels[i * 3 + 1] * factor + et * 0.2; // 缓慢漂升
          positions[i * 3 + 2] = initials[i * 3 + 2] + vels[i * 3 + 2] * factor;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        
        // @ts-ignore
        pointsRef.current.material.opacity = Math.max(0, 0.9 - et * 0.2);
      } else {
        pointsRef.current.rotation.y = t * 0.15;
        // @ts-ignore
        pointsRef.current.material.opacity = 0.6 + Math.sin(t * 1.0) * 0.4;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.pos.length / 3}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fbbf24"
        size={0.055}
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};