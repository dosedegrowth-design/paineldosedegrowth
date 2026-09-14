// Baixa as fotos reais (public/photos e public/brand) do repositório público
// quando elas não vieram junto do código — é o caso do deploy de preview, em
// que só o fonte sobe e os binários ficam no Git do painel.
//
// Rodando local (as fotos já estão na pasta), o script não faz nada.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const publico = join(raiz, "public");
const destinos = ["photos", "brand"];

mkdirSync(publico, { recursive: true });

const faltando = destinos.filter((pasta) => {
  const alvo = join(publico, pasta);
  return !existsSync(alvo) || readdirSync(alvo).length === 0;
});

if (faltando.length === 0) {
  console.log("[assets] fotos já presentes, nada a baixar");
  process.exit(0);
}

const REPO = process.env.VIVA_ASSETS_REPO ?? "dosedegrowth-design/paineldosedegrowth";
const REF = process.env.VIVA_ASSETS_REF ?? "claude/sweet-cori-tutfes";
const url = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${REF}`;

console.log(`[assets] baixando ${faltando.join(", ")} de ${REPO}@${REF}`);

const resposta = await fetch(url);
if (!resposta.ok) {
  throw new Error(`[assets] download falhou: ${resposta.status} ${resposta.statusText}`);
}

// O tarball fica dentro do projeto: /tmp costuma ser outro dispositivo e o
// tar extrai direto no destino, sem mover arquivo entre discos (EXDEV).
const tarball = join(raiz, ".assets.tar.gz");
await writeFile(tarball, Buffer.from(await resposta.arrayBuffer()));

try {
  execFileSync(
    "tar",
    [
      "-xzf",
      tarball,
      "-C",
      publico,
      "--strip-components=3",
      "--wildcards",
      ...faltando.map((pasta) => `*/viva-extintores/public/${pasta}/*`),
    ],
    { stdio: "inherit" },
  );
} finally {
  rmSync(tarball, { force: true });
}

for (const pasta of faltando) {
  const alvo = join(publico, pasta);
  if (!existsSync(alvo)) throw new Error(`[assets] public/${pasta} não veio no tarball`);
  console.log(`[assets] public/${pasta}: ${readdirSync(alvo).length} itens`);
}
