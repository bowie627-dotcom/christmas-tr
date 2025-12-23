import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Decorations: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  const { ornaments } = useMemo(() => {
    const count = 70; // Slightly more count but smaller
    const pos = new Float32Array(count * 3);

    const height = 10;
    const baseRadius = 3.8;

    for (let i = 0; i < count; i++) {
      const h = Math.random() * (height - 1) + 0.5;
      const progress = h / height;
      const radiusAtHeight = baseRadius * (1 - progress);
      const angle = Math.random() * Math.PI * 2;
      const r = radiusAtHeight * 0.95; // Place on the surface

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }

    return { ornaments: pos };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      // Pronounced Breathing oscillation for the yellow spheres
      // 明暗交替 (alternating light and dark)
      // @ts-ignore
      pointsRef.current.material.opacity = 0.5 + Math.sin(time * 0.8) * 0.5;
      
      // Also slightly vary point size for a more dynamic "breathing" feel
      // @ts-ignore
      pointsRef.current.material.size = 0.16 + Math.sin(time * 0.8) * 0.06;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={ornaments.length / 3}
            array={ornaments}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.16} // Base size
          color="#facc15" 
          transparent 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </points>
    </group>
  );
};