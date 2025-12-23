import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarProps {
  position: [number, number, number];
}

export const Star: React.FC<StarProps> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.45;
    const innerRadius = 0.22; // Slightly deeper valley for better curve definition

    // We use more segments to define a rounded star path
    const totalPoints = points * 2;
    const step = (Math.PI * 2) / totalPoints;
    const rotationOffset = Math.PI / 2;

    // Helper to get point on star
    const getStarPoint = (i: number) => {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step + rotationOffset;
      return new THREE.Vector2(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    };

    // To make it rounded, we use quadraticCurveTo
    // We move to the midpoint between the last valley and first tip to start the loop smoothly
    const firstPoint = getStarPoint(0);
    const lastPoint = getStarPoint(totalPoints - 1);
    const startX = (firstPoint.x + lastPoint.x) / 2;
    const startY = (firstPoint.y + lastPoint.y) / 2;
    
    shape.moveTo(startX, startY);

    for (let i = 0; i < totalPoints; i++) {
      const current = getStarPoint(i);
      const next = getStarPoint((i + 1) % totalPoints);
      
      // Control point is the actual vertex, end point is the midpoint to the next vertex
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      shape.quadraticCurveTo(current.x, current.y, midX, midY);
    }
    
    shape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.15, // Increased for roundness
      bevelSize: 0.12,      // Increased for roundness
      bevelOffset: 0,
      bevelSegments: 16     // More segments for smoother roundness
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Rotation on Y axis
    meshRef.current.rotation.y = t * 1.2;
    
    // Breathing light: slower, more cinematic pulse
    if (meshRef.current.material) {
      // @ts-ignore
      meshRef.current.material.emissiveIntensity = 2.5 + Math.sin(t * 1.0) * 1.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={starGeometry} castShadow>
        <meshStandardMaterial 
          color="#FFB000" // Deep golden yellow
          emissive="#FF8C00" // Darker orange-gold for depth in glow
          emissiveIntensity={4} 
          metalness={1} 
          roughness={0.05} 
        />
      </mesh>
      
      {/* Central bright golden light source */}
      <pointLight intensity={6} color="#FFD700" distance={6} />
      
      {/* Bright core sphere to give the star a hot center */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};