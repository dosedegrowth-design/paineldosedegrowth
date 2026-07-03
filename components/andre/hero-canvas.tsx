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
import { MathUtils } from "three";
import type { Group, Mesh, MeshStandardMaterial, MeshBasicMaterial } from "three";
import { MistJet, makePuffTexture } from "./mist-jet";

/* câmera estável: o canvas agora vive no meio da página (palco dos
   serviços) — dolly por scroll não faz mais sentido aqui. */
function CameraRig() {
  useFrame((state, delta) => {
    const cam = state.camera;
    cam.position.z = MathUtils.damp(cam.position.z, 5.6, 2.5, delta);
    cam.position.y = MathUtils.damp(cam.position.y, 0.2, 2.5, delta);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/* linhas de fluxo de vento — elegantes, quase subliminares */
function WindLines() {
  const group = useRef<Group>(null);
  const texture = useMemo(() => makePuffTexture(), []);
  const lines = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        y: -1.1 - i * 0.28,
        z: 0.6 + i * 0.12,
        speed: 0.5 + (i % 3) * 0.22,
        offset: (i * 1.7) % 6,
        scale: 2.6 + (i % 2) * 1.1,
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const cfg = lines[i];
      const x = ((t * cfg.speed + cfg.offset) % 7) - 3.5;
      c.position.x = x;
      const m = (c as Mesh).material as MeshBasicMaterial;
      m.opacity = Math.sin(((x + 3.5) / 7) * Math.PI) * 0.1;
    });
  });

  return (
    <group ref={group}>
      {lines.map((l, i) => (
        <mesh key={i} position={[0, l.y, l.z]} scale={[l.scale, 0.07, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.08}
            depthWrite={false}
            color="#bfe6fb"
          />
        </mesh>
      ))}
    </group>
  );
}

function SplitUnit() {
  const group = useRef<Group>(null);
  const fan = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  const louver = useRef<Group>(null);
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
    /* aleta abre nos primeiros segundos — o aparelho "liga" em cena */
    if (louver.current) {
      const open = MathUtils.clamp((t - 0.7) / 1.6, 0, 1);
      const eased = 1 - Math.pow(1 - open, 3);
      louver.current.rotation.x = -0.04 - eased * 0.5;
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

      {/* louver — abre quando o aparelho entra em cena */}
      <group ref={louver} position={[0, -0.58, 0.34]} rotation={[-0.04, 0, 0]}>
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

      {/* névoa de ar frio realista, dirigida pelo scroll */}
      <MistJet
        count={
          typeof window !== "undefined" && window.innerWidth < 768 ? 130 : 220
        }
      />
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
        <CameraRig />
        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.4}>
          <group scale={0.82}>
            <SplitUnit />
          </group>
        </Float>
        <WindLines />
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
