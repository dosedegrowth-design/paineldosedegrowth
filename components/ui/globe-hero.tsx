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
  segments: number;
}> = ({ rotationSpeed, radius, color, opacity, segments }) => {
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
        <sphereGeometry args={[radius, segments, segments]} />
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
   inicial. `segments`, `dpr` e `frameloop` permitem baratear em telas
   fracas e PAUSAR a renderização quando o hero sai da viewport. */
export function GlobeCanvas({
  rotationSpeed = 0.005,
  globeRadius = 1,
  wireframeColor = "#94a3b8",
  wireframeOpacity = 0.15,
  segments = 64,
  dpr,
  frameloop = "always",
}: Pick<
  DotGlobeHeroProps,
  "rotationSpeed" | "globeRadius" | "wireframeColor" | "wireframeOpacity"
> & {
  segments?: number;
  dpr?: number | [number, number];
  frameloop?: "always" | "never";
}) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Globe
        rotationSpeed={rotationSpeed}
        radius={globeRadius}
        color={wireframeColor}
        opacity={wireframeOpacity}
        segments={segments}
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
