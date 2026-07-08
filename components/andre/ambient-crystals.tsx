"use client";

/* Campo 3D de cristais de gelo flutuando atrás do site inteiro.
   Parallax de scroll (reversível) + parallax de mouse. Canvas único
   fixo, leve (1 material compartilhado, ~30 meshes low-poly). */

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, MeshStandardMaterial } from "three";
import type { Group, Mesh } from "three";

function CrystalField({ count, pointer }: { count: number; pointer: boolean }) {
  const group = useRef<Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scroll = useRef({ last: 0, vel: 0 });

  const crystals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 137.5) % 100) / 100 * 16 - 8,
        y: (((i * 73.3) % 100) / 100) * 12 - 6,
        z: -1.5 - (((i * 41.7) % 100) / 100) * 3,
        scale: 0.06 + (((i * 29.1) % 100) / 100) * 0.16,
        rotSpeed: 0.15 + (((i * 17.3) % 100) / 100) * 0.4,
        drift: 0.4 + (((i * 53.9) % 100) / 100) * 0.8,
        octa: i % 3 !== 0,
      })),
    [count]
  );

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#7dd3fc",
        emissive: "#38bdf8",
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.2,
        transparent: true,
        opacity: 0.4,
        flatShading: true,
      }),
    []
  );

  useMemo(() => {
    if (typeof window === "undefined" || !pointer) return;
    window.addEventListener(
      "pointermove",
      (e) => {
        mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }, [pointer]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const y = window.scrollY;
    const rawVel = (y - scroll.current.last) / Math.max(dt, 0.016);
    scroll.current.last = y;
    scroll.current.vel = MathUtils.damp(scroll.current.vel, rawVel, 4, dt);

    if (group.current) {
      /* o campo sobe conforme você desce a página — e volta se você voltar */
      group.current.position.y = y * 0.0016;
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        mouse.current.x * 0.12,
        2,
        dt
      );
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        mouse.current.y * 0.06,
        2,
        dt
      );

      const t = state.clock.elapsedTime;
      const spin = 1 + Math.min(2.5, Math.abs(scroll.current.vel) * 0.002);
      group.current.children.forEach((c, i) => {
        const cfg = crystals[i];
        const m = c as Mesh;
        m.rotation.x += dt * cfg.rotSpeed * spin;
        m.rotation.y += dt * cfg.rotSpeed * 0.7 * spin;
        m.position.x = cfg.x + Math.sin(t * 0.2 * cfg.drift + i) * 0.35;
        /* wrap vertical pro campo ser infinito nos dois sentidos */
        const worldY = cfg.y + Math.cos(t * 0.15 * cfg.drift + i) * 0.3;
        m.position.y = ((worldY + 6 + ((y * 0.0016 * -0) % 12)) % 12) - 6;
      });
    }
  });

  return (
    <group ref={group}>
      {crystals.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, c.y, c.z]}
          scale={c.scale}
          material={material}
        >
          {c.octa ? (
            <octahedronGeometry args={[1, 0]} />
          ) : (
            <icosahedronGeometry args={[1, 0]} />
          )}
        </mesh>
      ))}
    </group>
  );
}

export function AmbientCrystals({ lite = false }: { lite?: boolean }) {
  /* mobile roda a versão lite: menos meshes, DPR 1, sem parallax de mouse —
     a ambiência fica, o custo cai */
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={lite ? 1 : [1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} color="#dbeafe" />
        <directionalLight position={[3, 4, 5]} intensity={0.8} color="#7dd3fc" />
        <CrystalField count={lite ? 16 : 30} pointer={!lite} />
      </Canvas>
    </div>
  );
}
