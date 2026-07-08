"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import React, { useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/* Hero com globo wireframe 3D girando ao fundo. O GlobeCanvas é exportado
   separado pra permitir lazy-load só em desktop (three.js pesa ~230KB gzip —
   não deve chegar ao mobile). THREE.Color não resolve var() de CSS, então a
   cor do wireframe é prop concreta em vez de hsl(var(--foreground)). */

interface DotGlobeHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  rotationSpeed?: number;
  globeRadius?: number;
  wireframeColor?: string;
  wireframeOpacity?: number;
  className?: string;
  children?: React.ReactNode;
}

const Globe: React.FC<{
  rotationSpeed: number;
  radius: number;
  color: string;
  opacity: number;
}> = ({ rotationSpeed, radius, color, opacity }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.3;
      groupRef.current.rotation.z += rotationSpeed * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          wireframe
        />
      </mesh>
    </group>
  );
};

/* Só o Canvas — importe via next/dynamic pra não mandar three.js no bundle
   inicial nem pro mobile. */
export function GlobeCanvas({
  rotationSpeed = 0.005,
  globeRadius = 1,
  wireframeColor = "#94a3b8",
  wireframeOpacity = 0.15,
}: Pick<
  DotGlobeHeroProps,
  "rotationSpeed" | "globeRadius" | "wireframeColor" | "wireframeOpacity"
>) {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Globe
        rotationSpeed={rotationSpeed}
        radius={globeRadius}
        color={wireframeColor}
        opacity={wireframeOpacity}
      />
    </Canvas>
  );
}

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  (
    {
      rotationSpeed = 0.005,
      globeRadius = 1,
      wireframeColor = "#94a3b8",
      wireframeOpacity = 0.15,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-screen bg-background overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {children}
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <GlobeCanvas
            rotationSpeed={rotationSpeed}
            globeRadius={globeRadius}
            wireframeColor={wireframeColor}
            wireframeOpacity={wireframeOpacity}
          />
        </div>
      </div>
    );
  }
);

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
