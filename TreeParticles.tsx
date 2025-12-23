import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeParticlesProps {
  count: number;
  isExploding?: boolean;
}

export const TreeParticles: React.FC<TreeParticlesProps> = ({ count, isExploding = false }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const explosionTimeRef = useRef(0);
  const initialPositions = useRef<Float32Array | null>(null);
  const velocities = useRef<Float32Array | null>(null);
  const randomSeeds = useRef<Float32Array | null>(null);
  const explosionPhases = useRef<Float32Array | null>(null);

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const phases = new Float32Array(count);
    
    const height = 10;
    const baseRadius = 4.2;

    for (let i = 0; i < count; i++) {
      const h = Math.random() * height;
      const progress = h / height;
      const radiusAtHeight = baseRadius * (1 - progress);
      
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radiusAtHeight;
      
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = h;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // 增强爆炸效果：更多样化的速度和方向
      const dir = new THREE.Vector3(x, (Math.random() - 0.1) * 3, z).normalize();
      const baseSpeed = 1.5 + Math.random() * 4.0;
      
      // 根据高度调整爆炸强度 - 顶部粒子飞得更远
      const heightFactor = 1 + progress * 2;
      const speed = baseSpeed * heightFactor;
      
      vels[i * 3] = dir.x * speed;
      vels[i * 3 + 1] = dir.y * speed + Math.random() * 2; // 增加向上的随机分量
      vels[i * 3 + 2] = dir.z * speed;

      seeds[i] = Math.random() * 30; // 增加更多相位差异
      phases[i] = Math.random() * Math.PI * 2; // 爆炸相位

      const rand = Math.random();
      let color;
      if (rand > 0.92) {
        color = new THREE.Color('#ffffff'); // 更多星光色
      } else if (rand > 0.75) {
        color = new THREE.Color('#fbbf24'); // 金色粒子
      } else if (rand > 0.6) {
        color = new THREE.Color('#34d399'); // 薄荷绿
      } else if (rand > 0.3) {
        color = new THREE.Color('#059669'); // 祖母绿
      } else {
        color = new THREE.Color('#064e3b'); // 深森绿
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    initialPositions.current = new Float32Array(pos);
    velocities.current = vels;
    randomSeeds.current = seeds;
    explosionPhases.current = phases;
    return { pos, colors };
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
    const time = state.clock.getElapsedTime();
    
    if (isExploding) {
      explosionTimeRef.current += delta;
      const t = explosionTimeRef.current;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const vels = velocities.current!;
      const initials = initialPositions.current!;
      const seeds = randomSeeds.current!;
      const phases = explosionPhases.current!;

      // 多阶段爆炸效果
      const explosionFactor = (1 - Math.exp(-t * 0.6)) * 8;
      const turbulenceFactor = Math.sin(t * 2) * 0.5 + 0.5;

      for (let i = 0; i < count; i++) {
        // 基础爆炸运动
        const baseX = initials[i * 3] + vels[i * 3] * explosionFactor;
        const baseY = initials[i * 3 + 1] + vels[i * 3 + 1] * explosionFactor;
        const baseZ = initials[i * 3 + 2] + vels[i * 3 + 2] * explosionFactor;

        // 增强的湍流效果
        const turbulenceX = Math.sin(t * 2.5 + seeds[i] + phases[i]) * turbulenceFactor * 0.8;
        const turbulenceY = Math.cos(t * 1.8 + seeds[i] * 0.7) * turbulenceFactor * 0.6 + t * 0.5;
        const turbulenceZ = Math.sin(t * 2.2 + seeds[i] * 1.3 + phases[i]) * turbulenceFactor * 0.8;

        // 螺旋运动效果
        const spiralRadius = t * 0.3;
        const spiralAngle = t * 3 + seeds[i];
        const spiralX = Math.cos(spiralAngle) * spiralRadius * 0.2;
        const spiralZ = Math.sin(spiralAngle) * spiralRadius * 0.2;

        positions[i * 3] = baseX + turbulenceX + spiralX;
        positions[i * 3 + 1] = baseY + turbulenceY;
        positions[i * 3 + 2] = baseZ + turbulenceZ + spiralZ;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // 动态透明度变化
      const opacityPulse = Math.sin(t * 4) * 0.1 + 0.9;
      // @ts-ignore
      pointsRef.current.material.opacity = Math.max(0, (0.85 - t * 0.12) * opacityPulse);
      
      // 动态大小变化
      // @ts-ignore
      pointsRef.current.material.size = 0.045 + Math.sin(t * 6) * 0.02;
    } else {
      pointsRef.current.rotation.y = time * 0.05;
      if (pointsRef.current.material) {
        // @ts-ignore
        pointsRef.current.material.opacity = 0.75;
        // @ts-ignore
        pointsRef.current.material.size = 0.045;
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
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};