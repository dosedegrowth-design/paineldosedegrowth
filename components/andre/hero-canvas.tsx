"use client";

/* Cena 3D contida do hero — split flutuando, turbina girando, LED pulsando,
   partículas de ar frio e parallax de mouse. Sem sequestro de scroll. */

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial, Points } from "three";

function ColdAir({ count = 90 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= delta * 0.35;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.9 + i) * delta * 0.05;
      if (arr[i * 3 + 1] < -3) arr[i * 3 + 1] = 3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#bae6fd"
        transparent
        opacity={0.75}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function SplitUnit() {
  const group = useRef<Group>(null);
  const fan = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useMemo(() => {
    if (typeof window === "undefined") return;
    window.addEventListener(
      "pointermove",
      (e) => {
        mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      /* rotação lenta + parallax do mouse */
      const targetY = 0.45 + Math.sin(t * 0.25) * 0.25 + mouse.current.x * 0.22;
      const targetX = -0.08 + mouse.current.y * 0.1;
      group.current.rotation.y += (targetY - group.current.rotation.y) * delta * 2.5;
      group.current.rotation.x += (targetX - group.current.rotation.x) * delta * 2.5;
    }
    if (fan.current) fan.current.rotation.x += delta * 5;
    if (led.current) {
      (led.current.material as MeshStandardMaterial).emissiveIntensity =
        1.5 + Math.sin(t * 2.4) * 0.5;
    }
  });

  return (
    <group ref={group}>
      {/* corpo */}
      <RoundedBox args={[4.4, 1.25, 0.75]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial color="#f8fafc" metalness={0.15} roughness={0.28} />
      </RoundedBox>

      {/* slats frontais */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, 0.4 - i * 0.09, 0.39]}>
          <boxGeometry args={[4.0, 0.015, 0.015]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* louver aberto soprando */}
      <group position={[0, -0.58, 0.34]} rotation={[-0.5, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.95, 0.15, 0.05]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.35} roughness={0.25} />
        </mesh>
      </group>

      {/* display LED */}
      <mesh position={[1.5, -0.25, 0.39]}>
        <boxGeometry args={[0.5, 0.14, 0.02]} />
        <meshStandardMaterial color="#020617" roughness={0.4} />
      </mesh>
      <mesh position={[1.5, -0.25, 0.405]} ref={led}>
        <boxGeometry args={[0.44, 0.09, 0.006]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#7dd3fc"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* turbina cross-flow visível pela grade inferior */}
      <group position={[0, -0.35, 0.1]}>
        <group ref={fan}>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[0, Math.cos(a) * 0.16, Math.sin(a) * 0.16]}
                rotation={[a + 0.5, 0, 0]}
              >
                <boxGeometry args={[3.7, 0.012, 0.07]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  metalness={0.5}
                  roughness={0.3}
                  emissive="#0ea5e9"
                  emissiveIntensity={0.35}
                />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* glow de ar frio saindo */}
      <mesh position={[0, -1.0, 0.55]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.6], fov: 40 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <ambientLight intensity={0.5} color="#dbeafe" />
      <directionalLight position={[4, 5, 4]} intensity={1.5} color="#93c5fd" castShadow />
      <directionalLight position={[-5, 2, 2]} intensity={0.6} color="#38bdf8" />
      <pointLight position={[0, -0.6, 2.4]} intensity={0.6} color="#22d3ee" distance={7} />

      <Suspense fallback={null}>
        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.4}>
          <group scale={0.82}>
            <SplitUnit />
          </group>
        </Float>
        <ColdAir count={90} />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={9}
          blur={2.6}
          far={2.2}
          color="#38bdf8"
        />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2} color="#7dd3fc" position={[0, 3, 4]} scale={[7, 3, 1]} />
          <Lightformer
            intensity={1}
            color="#0ea5e9"
            position={[-5, 0, 2]}
            rotation-y={Math.PI / 2}
            scale={[5, 2, 1]}
          />
          <Lightformer
            intensity={0.7}
            color="#e0f2fe"
            position={[5, 1, -1]}
            rotation-y={-Math.PI / 2}
            scale={[5, 2, 1]}
          />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
