import React from 'react';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { SpiralRibbon } from './SpiralRibbon';
import { Decorations } from './Decorations';
import { Star } from './Star';

interface ChristmasSceneProps {
  isExploded?: boolean;
}

export const ChristmasScene: React.FC<ChristmasSceneProps> = ({ isExploded = false }) => {
  return (
    <>
      <group position={[0, -5.05, 0]}>
        {/* The Star Topper */}
        <Star position={[0, 10.1, 0]} />

        {/* The Particle Tree Body */}
        <TreeParticles count={25000} isExploding={isExploded} />

        {/* The Golden Spiral Ribbon */}
        <SpiralRibbon isExploding={isExploded} />

        {/* Large Golden Ornaments - They simply fade out on explosion */}
        <group visible={!isExploded}>
           <Decorations />
        </group>

        {/* Base shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color="#000000" roughness={1} metalness={0} opacity={0.5} transparent />
        </mesh>
      </group>

      {/* Post Processing for Intense Glow/Bloom Effects */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={isExploded ? 4.5 : 2.5} // Increase intensity during explosion
          radius={0.3} 
        />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.1} darkness={1.3} />
      </EffectComposer>
    </>
  );
};