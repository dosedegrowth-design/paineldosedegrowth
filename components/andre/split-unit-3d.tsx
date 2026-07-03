"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";

export function SplitUnit3D({
  autoSpin = 0.15,
  fanSpeed = 4,
}: {
  autoSpin?: number;
  fanSpeed?: number;
}) {
  const group = useRef<Group>(null);
  const fan = useRef<Group>(null);
  const led = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * autoSpin;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
    }
    if (fan.current) fan.current.rotation.z += delta * fanSpeed;
    if (led.current) {
      const mat = led.current.material as MeshStandardMaterial;
      mat.emissiveIntensity =
        1.5 + Math.sin(state.clock.elapsedTime * 2.5) * 0.5;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Wall backing (subtle) */}
      <mesh position={[0, 0, -0.6]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial
          color="#0a1120"
          transparent
          opacity={0.0}
        />
      </mesh>

      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 1.3, 0.9]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.15}
          roughness={0.35}
        />
      </mesh>

      {/* Top bezel */}
      <mesh position={[0, 0.7, 0.05]}>
        <boxGeometry args={[4.55, 0.08, 0.85]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.25} />
      </mesh>

      {/* Bottom bezel */}
      <mesh position={[0, -0.7, 0.05]}>
        <boxGeometry args={[4.55, 0.08, 0.85]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.25} />
      </mesh>

      {/* Front intake grid lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.5 - i * 0.12, 0.46]}
        >
          <boxGeometry args={[4.3, 0.02, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Louver (horizontal blade tilted down for airflow) */}
      <group position={[0, -0.55, 0.42]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.2, 0.18, 0.06]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0.35}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* LED strip / display */}
      <mesh position={[1.6, -0.15, 0.46]}>
        <boxGeometry args={[0.5, 0.14, 0.02]} />
        <meshStandardMaterial color="#020617" roughness={0.4} />
      </mesh>
      <mesh position={[1.6, -0.15, 0.475]} ref={led}>
        <boxGeometry args={[0.44, 0.09, 0.005]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#7dd3fc"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Brand plate */}
      <mesh position={[-1.7, -0.15, 0.46]}>
        <boxGeometry args={[0.5, 0.1, 0.01]} />
        <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Right vent group with spinning fan */}
      <group position={[1.9, 0, 0.44]}>
        {/* Circular vent frame */}
        <mesh>
          <torusGeometry args={[0.32, 0.06, 12, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Fan hub */}
        <group ref={fan}>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <mesh
                key={i}
                rotation={[0, 0, angle]}
                position={[Math.cos(angle) * 0.14, Math.sin(angle) * 0.14, 0]}
              >
                <boxGeometry args={[0.24, 0.05, 0.02]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  metalness={0.4}
                  roughness={0.3}
                  emissive="#38bdf8"
                  emissiveIntensity={0.4}
                />
              </mesh>
            );
          })}
          {/* Center hub */}
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Left ambient glow sphere (cool air) */}
      <mesh position={[-2.3, -0.4, 0.6]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}
