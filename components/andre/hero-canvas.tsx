"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  OrbitControls,
  ContactShadows,
} from "@react-three/drei";
import type { Points, Group } from "three";
import { SplitUnit3D } from "./split-unit-3d";

function ScrollRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const scroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scroll.current = Math.min(1, Math.max(0, window.scrollY / 900));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((_, delta) => {
    const target = scroll.current;
    if (ref.current) {
      // Explode / rotate / lift as scroll progresses
      const targetRotY = target * Math.PI * 0.9;
      const targetRotX = -target * 0.35;
      const targetScale = 0.95 + target * 0.15;
      ref.current.rotation.y += (targetRotY - ref.current.rotation.y) * delta * 4;
      ref.current.rotation.x += (targetRotX - ref.current.rotation.x) * delta * 4;
      ref.current.scale.setScalar(
        ref.current.scale.x + (targetScale - ref.current.scale.x) * delta * 4
      );
      ref.current.position.y += (target * 0.4 - ref.current.position.y) * delta * 4;
    }
    // Camera dolly forward
    const camZ = 6.5 - target * 1.5;
    camera.position.z += (camZ - camera.position.z) * delta * 4;
  });

  return <group ref={ref}>{children}</group>;
}

function ColdParticles({ count = 80 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const positions = useRef<Float32Array>(new Float32Array(count * 3));

  if (positions.current[0] === 0) {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 10;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
  }

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= delta * 0.4;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + i) * delta * 0.05;
      if (arr[i * 3 + 1] < -2.6) arr[i * 3 + 1] = 2.6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#bae6fd"
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function HeroCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-auto">
      <Canvas
        shadows
        camera={{ position: [0, 0.4, 6.5], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} color="#e0f2fe" />
        <directionalLight
          position={[4, 5, 3]}
          intensity={1.6}
          color="#7dd3fc"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-5, 2, 2]}
          intensity={0.7}
          color="#38bdf8"
        />
        <pointLight
          position={[0, -1, 2]}
          intensity={0.6}
          color="#22d3ee"
          distance={6}
        />

        <Suspense fallback={null}>
          <ScrollRig>
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
              <group rotation={[-0.05, 0.35, 0]}>
                <SplitUnit3D />
              </group>
            </Float>
          </ScrollRig>

          <ColdParticles count={120} />

          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.35}
            scale={8}
            blur={2.6}
            far={2}
            color="#38bdf8"
          />

          <Environment preset="night" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          rotateSpeed={0.5}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
