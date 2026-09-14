// Baixa as fotos reais (public/photos e public/brand) do repositório público
// quando elas não vieram junto do código — é o caso de um deploy por upload
// de arquivos, em que só o fonte sobe e os binários ficam no Git.
//
// Rodando local (as fotos já estão na pasta), o script não faz nada.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
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

const temp = mkdtempSync(join(tmpdir(), "viva-assets-"));
const tarball = join(temp, "repo.tar.gz");

console.log(`[assets] baixando ${faltando.join(", ")} de ${REPO}@${REF}`);

const resposta = await fetch(url);
if (!resposta.ok) {
  throw new Error(`[assets] download falhou: ${resposta.status} ${resposta.statusText}`);
}
const { writeFile } = await import("node:fs/promises");
await writeFile(tarball, Buffer.from(await resposta.arrayBuffer()));

execFileSync(
  "tar",
  [
    "-xzf",
    tarball,
    "-C",
    temp,
    "--wildcards",
    ...faltando.map((pasta) => `*/viva-extintores/public/${pasta}/*`),
  ],
  { stdio: "inherit" },
);

const extraido = readdirSync(temp).find((nome) => nome.startsWith("paineldosedegrowth-"));
if (!extraido) throw new Error("[assets] tarball sem a pasta esperada");

for (const pasta of faltando) {
  const origem = join(temp, extraido, "viva-extintores", "public", pasta);
  const alvo = join(publico, pasta);
  rmSync(alvo, { recursive: true, force: true });
  renameSync(origem, alvo);
  console.log(`[assets] public/${pasta}: ${readdirSync(alvo).length} itens`);
}

rmSync(temp, { recursive: true, force: true });
