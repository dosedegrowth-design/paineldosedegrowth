"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import { MathUtils } from "three";
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  Points,
  PointLight,
} from "three";
import { HeroScene } from "./hero-scene";

/* Progresso 0..1 dentro da janela [a,b] com suavização cúbica */
function phase(p: number, a: number, b: number) {
  const t = MathUtils.clamp((p - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/* Partículas de ar frio                                               */
/* ------------------------------------------------------------------ */
function ColdAir({ count = 130 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= delta * 0.35;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.8 + i) * delta * 0.06;
      if (arr[i * 3 + 1] < -4) arr[i * 3 + 1] = 4;
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
        opacity={0.7}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Etiqueta técnica HUD presa a uma peça                               */
/* ------------------------------------------------------------------ */
function PartLabel({
  text,
  visible,
  offset = [0, 0.35, 0] as [number, number, number],
}: {
  text: string;
  visible: boolean;
  offset?: [number, number, number];
}) {
  return (
    <Html
      position={offset}
      center
      zIndexRange={[8, 1]}
      style={{
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
        whiteSpace: "nowrap",
      }}
    >
      <span className="tech-stamp" style={{ fontSize: 10 }}>
        {text}
      </span>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* Cidade 3D (fase cobertura)                                          */
/* ------------------------------------------------------------------ */
function City({ groupRef }: { groupRef: React.RefObject<Group | null> }) {
  const blocks = useMemo(() => {
    const out: {
      x: number;
      z: number;
      h: number;
      w: number;
      tower: boolean;
    }[] = [];
    for (let gx = -5; gx <= 5; gx++) {
      for (let gz = -3; gz <= 2; gz++) {
        const seed = Math.abs(Math.sin(gx * 37.7 + gz * 91.3));
        if (seed < 0.18) continue;
        out.push({
          x: gx * 0.92 + (seed - 0.5) * 0.3,
          z: gz * 0.92 + (seed - 0.5) * 0.3,
          h: 0.3 + seed * 2.1,
          w: 0.42 + seed * 0.25,
          tower: seed > 0.86,
        });
      }
    }
    return out;
  }, []);

  const pings = useRef<Group>(null);

  useFrame((state) => {
    if (!pings.current) return;
    pings.current.children.forEach((ring, i) => {
      const t = (state.clock.elapsedTime * 0.5 + i * 0.33) % 1;
      ring.scale.setScalar(0.3 + t * 2.2);
      const mat = (ring as Mesh).material as MeshStandardMaterial;
      mat.opacity = (1 - t) * 0.7;
    });
  });

  return (
    <group ref={groupRef} position={[0, -1.45, -0.5]} visible={false}>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial
            color={b.tower ? "#10304d" : "#0c1526"}
            emissive={b.tower ? "#38bdf8" : "#12324f"}
            emissiveIntensity={b.tower ? 1.4 : 0.22}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
      {/* Pings de atendimento */}
      <group ref={pings}>
        {[
          [-2.6, 0.03, 0.8],
          [1.8, 0.03, -1.2],
          [0.2, 0.03, 1.6],
        ].map((pos, i) => (
          <mesh
            key={i}
            position={pos as [number, number, number]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.3, 0.36, 40]} />
            <meshStandardMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={2}
              transparent
              opacity={0.6}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {/* Piso refletivo escuro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial
          color="#05070f"
          metalness={0.75}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cena principal — split explodido + coreografia de scroll            */
/* ------------------------------------------------------------------ */
function Scene() {
  const unit = useRef<Group>(null);
  const chassis = useRef<Group>(null);
  const front = useRef<Group>(null);
  const filterL = useRef<Group>(null);
  const filterR = useRef<Group>(null);
  const barrel = useRef<Group>(null);
  const barrelSpin = useRef<Group>(null);
  const louver = useRef<Group>(null);
  const coil = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);
  const burstLight = useRef<PointLight>(null);
  const city = useRef<Group>(null);
  const shadows = useRef<Group>(null);

  const [labelsOn, setLabelsOn] = useState(false);
  const smooth = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  const { camera } = useThree();

  useFrame((state, delta) => {
    /* progresso de scroll global (0..1 no documento) */
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const target = MathUtils.clamp(window.scrollY / max, 0, 1);
    smooth.current = MathUtils.damp(smooth.current, target, 3.2, delta);
    const p = smooth.current;

    /* fases */
    const intro = 1 - phase(p, 0.05, 0.14);          // hero
    const explode =
      phase(p, 0.1, 0.2) * (1 - phase(p, 0.3, 0.4)); // vista explodida
    const cityK =
      phase(p, 0.44, 0.55) * (1 - phase(p, 0.76, 0.85)); // cidade
    const burst = phase(p, 0.88, 0.97);               // final

    const vp = state.viewport;
    const narrow = vp.width < 5;
    /* escala contida: nunca invade a coluna de texto */
    const baseScale = narrow ? 0.42 : Math.min(0.62, vp.width * 0.068);
    /* desktop: canal direito; mobile: faixa do spacer abaixo do texto */
    const heroX = narrow ? 0 : Math.min(2.6, vp.width * 0.25);
    const heroY = narrow ? -1.3 : 1.05;

    const t = state.clock.elapsedTime;

    if (unit.current) {
      /* hero (lado direito) → centro sereno → recuo p/ cidade → centro no burst */
      const midX = narrow ? 0 : heroX * 0.55;
      const cx =
        heroX * intro +
        midX * (1 - intro) * (1 - cityK) +
        (-vp.width * 0.26) * cityK * (1 - burst);
      const cy =
        heroY * intro +
        0.15 * (1 - intro) +
        0.95 * cityK * (1 - burst) +
        Math.sin(t * 0.9) * 0.05;
      unit.current.position.x = cx;
      unit.current.position.y = cy;

      const s =
        baseScale * (1 - 0.5 * cityK) * (1 + 0.1 * burst) +
        0.04 * explode;
      unit.current.scale.setScalar(s);

      unit.current.rotation.y =
        0.35 + p * 2.6 + explode * 0.25;
      unit.current.rotation.x = -0.06 - explode * 0.18 + cityK * 0.1;
    }

    /* vista explodida — cada peça viaja pra seu offset */
    if (front.current) {
      front.current.position.z = explode * 1.25;
      front.current.position.y = explode * 0.3;
    }
    if (filterL.current) {
      filterL.current.position.y = 0.42 + explode * 0.85;
      filterL.current.position.z = 0.1 + explode * 0.55;
      filterL.current.position.x = -0.95 - explode * 0.35;
    }
    if (filterR.current) {
      filterR.current.position.y = 0.42 + explode * 1.15;
      filterR.current.position.z = 0.1 + explode * 0.75;
      filterR.current.position.x = 0.95 + explode * 0.35;
    }
    if (barrel.current) {
      barrel.current.position.z = explode * 0.55;
      barrel.current.position.y = -0.1 - explode * 0.15;
    }
    if (louver.current) {
      louver.current.position.y = -0.62 - explode * 0.55;
      louver.current.position.z = 0.38 + explode * 0.45;
      louver.current.rotation.x = -0.35 - explode * 0.5;
    }
    if (coil.current) {
      coil.current.position.z = -0.05 - explode * 0.15;
      coil.current.position.y = 0.05 + explode * 0.3;
    }
    if (chassis.current) {
      chassis.current.position.z = -explode * 0.45;
    }

    /* turbina sempre girando */
    if (barrelSpin.current) barrelSpin.current.rotation.x += delta * 5;

    /* LED pulsando */
    if (led.current) {
      (led.current.material as MeshStandardMaterial).emissiveIntensity =
        1.4 + Math.sin(t * 2.4) * 0.5 + burst * 2;
    }

    /* glow de saída de ar (some no explode, explode no burst) */
    if (glow.current) {
      const g = (1 - explode) * 0.5 + burst * 1.6;
      glow.current.scale.setScalar(0.4 + g);
      (glow.current.material as MeshStandardMaterial).opacity =
        0.25 + 0.3 * (1 - explode) + 0.35 * burst;
    }
    if (burstLight.current) {
      burstLight.current.intensity = 0.5 + burst * 5;
    }

    /* cidade sobe */
    if (city.current) {
      city.current.visible = cityK > 0.02;
      city.current.scale.y = Math.max(0.001, cityK);
      city.current.scale.x = 0.85 + cityK * 0.15;
      city.current.scale.z = 0.85 + cityK * 0.15;
      city.current.rotation.y = t * 0.04;
    }

    if (shadows.current) {
      shadows.current.visible = cityK < 0.4;
    }

    /* câmera: dolly + parallax de mouse + lookAt coreografado */
    const camZ = 6.5 - explode * 1.1 - burst * 0.6 + cityK * 0.4;
    camera.position.z = MathUtils.damp(camera.position.z, camZ, 3, delta);
    camera.position.x = MathUtils.damp(
      camera.position.x,
      mouse.current.x * 0.4,
      2.5,
      delta
    );
    camera.position.y = MathUtils.damp(
      camera.position.y,
      0.35 + mouse.current.y * 0.25 - cityK * 0.6,
      2.5,
      delta
    );
    const lookY = 0.1 - cityK * 1.0;
    camera.lookAt(0, lookY, 0);

    /* liga/desliga etiquetas HUD */
    const shouldLabel = explode > 0.55;
    if (shouldLabel !== labelsOn) setLabelsOn(shouldLabel);
  });

  /* parallax do mouse */
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

  return (
    <>
      <ambientLight intensity={0.45} color="#dbeafe" />
      <directionalLight
        position={[4, 5, 4]}
        intensity={1.4}
        color="#93c5fd"
        castShadow
      />
      <directionalLight position={[-5, 2, 2]} intensity={0.6} color="#38bdf8" />
      <pointLight
        ref={burstLight}
        position={[0, -0.5, 2.5]}
        intensity={0.5}
        color="#22d3ee"
        distance={8}
      />

      <Suspense fallback={null}>
        {/* ============ UNIDADE SPLIT EXPLODÍVEL ============ */}
        <group ref={unit} position={[2.2, 0.15, 0]}>
          {/* chassis traseiro */}
          <group ref={chassis}>
            <RoundedBox args={[4.6, 1.3, 0.55]} radius={0.09} smoothness={4}
              position={[0, 0, -0.18]} castShadow receiveShadow>
              <meshStandardMaterial color="#e2e8f0" metalness={0.25} roughness={0.35} />
            </RoundedBox>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[4.25, 1.05, 0.42]} />
              <meshStandardMaterial color="#0b1220" roughness={0.8} />
            </mesh>
            <PartLabel text="CHASSI_TERMICO" visible={labelsOn} offset={[-1.6, -0.85, 0]} />
          </group>

          {/* serpentina de cobre */}
          <group ref={coil} position={[0, 0.05, -0.05]} rotation={[0.5, 0, 0]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh
                key={i}
                position={[0, 0.28 - i * 0.14, -i * 0.05]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.045, 0.045, 4.1, 12]} />
                <meshStandardMaterial
                  color="#b87333"
                  metalness={0.9}
                  roughness={0.28}
                />
              </mesh>
            ))}
            <PartLabel text="SERPENTINA_COBRE" visible={labelsOn} offset={[1.9, 0.5, 0]} />
          </group>

          {/* turbina cross-flow */}
          <group ref={barrel} position={[0, -0.1, 0]}>
            <group ref={barrelSpin}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.26, 0.26, 3.7, 20, 1, true]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.6}
                  roughness={0.35}
                  transparent
                  opacity={0.55}
                />
              </mesh>
              {Array.from({ length: 18 }).map((_, i) => {
                const a = (i / 18) * Math.PI * 2;
                return (
                  <mesh
                    key={i}
                    position={[0, Math.cos(a) * 0.24, Math.sin(a) * 0.24]}
                    rotation={[a + 0.5, 0, 0]}
                  >
                    <boxGeometry args={[3.65, 0.015, 0.09]} />
                    <meshStandardMaterial
                      color="#38bdf8"
                      metalness={0.55}
                      roughness={0.3}
                      emissive="#0ea5e9"
                      emissiveIntensity={0.35}
                    />
                  </mesh>
                );
              })}
            </group>
            <PartLabel text="TURBINA_CROSS_FLOW" visible={labelsOn} offset={[0, -0.55, 0.4]} />
          </group>

          {/* filtros */}
          <group ref={filterL} position={[-0.95, 0.42, 0.1]} rotation={[-0.5, 0, 0]}>
            <mesh>
              <planeGeometry args={[1.85, 0.6, 16, 5]} />
              <meshStandardMaterial
                color="#a5e3fa"
                wireframe
                transparent
                opacity={0.75}
                emissive="#38bdf8"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
          <group ref={filterR} position={[0.95, 0.42, 0.1]} rotation={[-0.5, 0, 0]}>
            <mesh>
              <planeGeometry args={[1.85, 0.6, 16, 5]} />
              <meshStandardMaterial
                color="#a5e3fa"
                wireframe
                transparent
                opacity={0.75}
                emissive="#38bdf8"
                emissiveIntensity={0.4}
              />
            </mesh>
            <PartLabel text="FILTRO_ANTIBACTERIANO" visible={labelsOn} offset={[0.3, 0.4, 0]} />
          </group>

          {/* painel frontal */}
          <group ref={front}>
            <RoundedBox args={[4.65, 1.32, 0.18] } radius={0.07} smoothness={4}
              position={[0, 0, 0.3]} castShadow>
              <meshStandardMaterial color="#f8fafc" metalness={0.12} roughness={0.22} />
            </RoundedBox>
            {Array.from({ length: 7 }).map((_, i) => (
              <mesh key={i} position={[0, 0.42 - i * 0.09, 0.41]}>
                <boxGeometry args={[4.2, 0.016, 0.015]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
              </mesh>
            ))}
            {/* LED */}
            <mesh position={[1.62, -0.28, 0.41]}>
              <boxGeometry args={[0.52, 0.15, 0.02]} />
              <meshStandardMaterial color="#020617" roughness={0.4} />
            </mesh>
            <mesh position={[1.62, -0.28, 0.425]} ref={led}>
              <boxGeometry args={[0.45, 0.1, 0.006]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#7dd3fc"
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
            {/* placa da marca */}
            <mesh position={[-1.7, -0.28, 0.41]}>
              <boxGeometry args={[0.5, 0.1, 0.012]} />
              <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.5} />
            </mesh>
            <PartLabel text="PAINEL_FRONTAL" visible={labelsOn} offset={[0, 1.0, 0.4]} />
          </group>

          {/* louver */}
          <group ref={louver} position={[0, -0.62, 0.38]} rotation={[-0.35, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[4.2, 0.16, 0.06]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.35} roughness={0.25} />
            </mesh>
          </group>

          {/* glow de ar frio */}
          <mesh ref={glow} position={[0, -1.0, 0.7]}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={2}
              toneMapped={false}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* ============ CIDADE (cobertura) ============ */}
        <City groupRef={city} />

        <ColdAir count={130} />

        <group ref={shadows}>
          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.35}
            scale={10}
            blur={2.8}
            far={2.4}
            color="#38bdf8"
          />
        </group>

        {/* iluminação de estúdio local — sem fetch externo */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            intensity={2.2}
            color="#7dd3fc"
            position={[0, 3, 4]}
            scale={[7, 3, 1]}
          />
          <Lightformer
            intensity={1.1}
            color="#0ea5e9"
            position={[-5, 0, 2]}
            rotation-y={Math.PI / 2}
            scale={[5, 2, 1]}
          />
          <Lightformer
            intensity={0.8}
            color="#e0f2fe"
            position={[5, 1, -1]}
            rotation-y={-Math.PI / 2}
            scale={[5, 2, 1]}
          />
        </Environment>
      </Suspense>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Wrapper fixo: céu CSS + Canvas 3D atrás do site inteiro             */
/* ------------------------------------------------------------------ */
export function AndreExperience() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <HeroScene />
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [0, 0.35, 6.5], fov: 42 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Scene />
        </Canvas>
      </div>
    </div>
  );
}
