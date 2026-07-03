"use client";

/* Névoa de ar frio realista emitida pelo louver do split.
   - Sprites com textura procedural de vapor (blobs irregulares), não
     bolinhas com glow — nada de cara de "partícula de jogo"
   - Rotação individual por sprite + blending normal (vapor difuso)
   - Dirigida pelo scroll: descer sopra; subir faz o ar VOLTAR pela
     mesma trajetória e ficar guardado no aparelho */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, MathUtils, NormalBlending } from "three";
import type { Points, ShaderMaterial } from "three";

function makePuffTexture(): CanvasTexture {
  const s = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const ctx = cv.getContext("2d")!;
  /* blobs irregulares sobrepostos = vapor, não círculo perfeito */
  for (let i = 0; i < 16; i++) {
    const x = s / 2 + (Math.random() - 0.5) * s * 0.5;
    const y = s / 2 + (Math.random() - 0.5) * s * 0.5;
    const r = s * (0.1 + Math.random() * 0.22);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.14)");
    g.addColorStop(0.6, "rgba(255,255,255,0.05)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  /* máscara radial pra borda nunca cortar seca */
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createRadialGradient(s / 2, s / 2, s * 0.05, s / 2, s / 2, s * 0.5);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(0.7, "rgba(0,0,0,0.8)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, s, s);
  const tex = new CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aRot;
  varying float vAlpha;
  varying float vRot;
  void main() {
    vAlpha = aAlpha;
    vRot = aRot;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uGlobal;
  varying float vAlpha;
  varying float vRot;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float cs = cos(vRot);
    float sn = sin(vRot);
    vec2 uv = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs) + vec2(0.5);
    vec4 tex = texture2D(uMap, uv);
    /* vapor frio: branco levemente azulado, difuso, sem neon */
    vec3 col = mix(vec3(1.0), vec3(0.78, 0.91, 1.0), 0.55);
    float a = tex.a * vAlpha * uGlobal;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
  }
`;

export function MistJet({ count = 220 }: { count?: number }) {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);
  const texture = useMemo(() => makePuffTexture(), []);

  const sim = useMemo(() => {
    const origins = new Float32Array(count * 3);
    const dirs = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const speeds = new Float32Array(count);
    const progress = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const rots = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      origins[i * 3] = (Math.random() - 0.5) * 3.4;
      origins[i * 3 + 1] = -0.62;
      origins[i * 3 + 2] = 0.4;

      const spread = (Math.random() - 0.5) * 0.5;
      const dx = spread;
      const dy = -(0.7 + Math.random() * 0.35);
      const dz = 0.55 + Math.random() * 0.35;
      const len = Math.hypot(dx, dy, dz);
      dirs[i * 3] = dx / len;
      dirs[i * 3 + 1] = dy / len;
      dirs[i * 3 + 2] = dz / len;

      seeds[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 0.7;
      progress[i] = Math.random();
      rots[i] = Math.random() * Math.PI * 2;
    }
    return { origins, dirs, seeds, speeds, progress, positions, sizes, alphas, rots };
  }, [count]);

  const scroll = useRef({ last: 0, vel: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    const rawVel = (y - scroll.current.last) / Math.max(dt, 0.016);
    scroll.current.last = y;
    scroll.current.vel = MathUtils.damp(scroll.current.vel, rawVel, 4, dt);

    const flow = MathUtils.clamp(0.2 + scroll.current.vel * 0.0011, -2.2, 2.4);
    const t = state.clock.elapsedTime;

    const { origins, dirs, seeds, speeds, progress, positions, sizes, alphas, rots } =
      sim;

    for (let i = 0; i < count; i++) {
      let p = progress[i] + dt * flow * speeds[i];
      if (flow >= 0) {
        if (p > 1) p -= 1;
      } else {
        if (p < 0) p = 0;
        if (p > 1) p = 1;
      }
      progress[i] = p;

      const dist = p * 3.2;
      const sway = Math.sin(p * 6 + seeds[i]) * 0.12 * p;
      const swirl = Math.cos(p * 4.5 + seeds[i]) * 0.08 * p;

      positions[i * 3] = origins[i * 3] + dirs[i * 3] * dist + sway;
      positions[i * 3 + 1] =
        origins[i * 3 + 1] + dirs[i * 3 + 1] * dist - 0.85 * p * p;
      positions[i * 3 + 2] = origins[i * 3 + 2] + dirs[i * 3 + 2] * dist + swirl;

      /* nasce denso e pequeno, expande e dissipa — curva de vapor real */
      const fadeIn = MathUtils.clamp(p / 0.08, 0, 1);
      const fadeOut = 1 - MathUtils.clamp((p - 0.55) / 0.45, 0, 1);
      alphas[i] = fadeIn * fadeOut * 0.32;
      sizes[i] = 0.5 + p * 2.6;
      rots[i] += dt * (0.2 + Math.sin(seeds[i]) * 0.15);
    }

    if (points.current) {
      const g = points.current.geometry;
      (g.attributes.position.array as Float32Array).set(positions);
      (g.attributes.aAlpha.array as Float32Array).set(alphas);
      (g.attributes.aSize.array as Float32Array).set(sizes);
      (g.attributes.aRot.array as Float32Array).set(rots);
      g.attributes.position.needsUpdate = true;
      g.attributes.aAlpha.needsUpdate = true;
      g.attributes.aSize.needsUpdate = true;
      g.attributes.aRot.needsUpdate = true;
    }
    if (material.current) {
      material.current.uniforms.uGlobal.value = MathUtils.damp(
        material.current.uniforms.uGlobal.value,
        0.75 + Math.min(0.9, Math.abs(flow) * 0.45),
        3,
        dt
      );
      material.current.uniforms.uMap.value = texture;
    }
    void t;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={sim.positions}
          itemSize={3}
          args={[sim.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sim.sizes}
          itemSize={1}
          args={[sim.sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aAlpha"
          count={count}
          array={sim.alphas}
          itemSize={1}
          args={[sim.alphas, 1]}
        />
        <bufferAttribute
          attach="attributes-aRot"
          count={count}
          array={sim.rots}
          itemSize={1}
          args={[sim.rots, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{ uGlobal: { value: 0.7 }, uMap: { value: texture } }}
        transparent
        depthWrite={false}
        blending={NormalBlending}
      />
    </points>
  );
}
