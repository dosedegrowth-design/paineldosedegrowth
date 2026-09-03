#!/usr/bin/env node
/**
 * Sobe os PNGs das lanchas pro Google Drive da DDG.
 *
 * Existe porque o conector de Drive do Claude passa o conteúdo do arquivo por
 * dentro da conversa, e são 230 MB — não cabe. Este script fala direto com a
 * API, então o byte vai da sua máquina pro Drive sem intermediário.
 *
 * Sem dependência de npm: usa fetch e o servidor HTTP do próprio Node.
 *
 *   node subir-drive.mjs --auth      uma vez, abre o navegador e guarda o token
 *   node subir-drive.mjs             sobe tudo que ainda não está lá
 *   node subir-drive.mjs --lancha=24-pes
 *   node subir-drive.mjs --seco      só lista o que subiria
 *
 * O token fica em ~/.config/ddg-drive.json, fora do repositório.
 */
import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(MOTOR, '..');
const CONF = path.join(os.homedir(), '.config', 'ddg-drive.json');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

/* As pastas já existem no Drive da DDG, criadas pelo Claude. Se você apagar
   alguma, o script recria pelo nome dentro da pasta-mãe. */
const PASTA_RAIZ = '1G7lcbA7DAtt0qdTOEfKUlGifxQLBAAvd'; // Vem Pra Paraty — Criativos
const LANCHAS = {
  '18-pes': { drive: '1ReUDcN_4uxEE6BCjbYBoKs6lxo4P85xp', nome: '18 pés — Mestra 180' },
  '24-pes': { drive: '1iTp58AcNj0cWGvv45VT-IT2OpHSflQmz', nome: '24 pés — 12 lugares' },
  '33-pes': { drive: '1XteInnweUem0D5uRvaSOVwxYqNfYQiqv', nome: '33 pés — banheiro e suíte' },
};
const SUB = {
  'out/feed-1080x1350': 'Feed 1080x1350',
  'out/story-1080x1920': 'Story 1080x1920',
  fotos: 'Fotos originais',
};

// ─────────────────────────────────────────────────────────── autenticação

async function lerConf() {
  try {
    return JSON.parse(await readFile(CONF, 'utf8'));
  } catch {
    return null;
  }
}

async function gravarConf(c) {
  await mkdir(path.dirname(CONF), { recursive: true });
  await writeFile(CONF, JSON.stringify(c, null, 2), { mode: 0o600 });
}

function abrirNavegador(url) {
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(cmd, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' }).unref();
}

/** Fluxo OAuth de aplicativo instalado: sobe um servidor no 127.0.0.1, manda o
 *  navegador pro consentimento do Google e troca o código por refresh token. */
async function autenticar() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(`
Faltam as credenciais. No console do Google Cloud:

  1. console.cloud.google.com → APIs e serviços → Ativar API do Google Drive
  2. Credenciais → Criar credenciais → ID do cliente OAuth
     Tipo: Aplicativo para computador
  3. Copie o ID e a chave secreta e exporte no terminal:

     export GOOGLE_OAUTH_CLIENT_ID="...apps.googleusercontent.com"
     export GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-..."

  4. node subir-drive.mjs --auth

Se a conta dosedegrowth@gmail.com não for a dona do projeto no Cloud, adicione
ela em "Público-alvo" → Usuários de teste, senão o Google recusa o consentimento.
`);
    process.exit(1);
  }

  const porta = 53682;
  const redirect = `http://127.0.0.1:${porta}`;
  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive',
      access_type: 'offline',
      prompt: 'consent',
    });

  const codigo = await new Promise((ok, erro) => {
    const s = createServer((req, res) => {
      const u = new URL(req.url, redirect);
      const c = u.searchParams.get('code');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        `<body style="font:16px system-ui;padding:60px;background:#071A26;color:#E7EDF0">` +
          (c ? 'Autorizado. Pode fechar e voltar pro terminal.' : 'Deu ruim: ' + u.search) +
          '</body>'
      );
      s.close();
      c ? ok(c) : erro(new Error('sem código: ' + u.search));
    });
    s.listen(porta, '127.0.0.1', () => {
      console.log('Abrindo o navegador pra autorizar…\nSe não abrir, cole:\n' + url + '\n');
      abrirNavegador(url);
    });
  });

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: codigo,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirect,
      grant_type: 'authorization_code',
    }),
  });
  const t = await r.json();
  if (!t.refresh_token) throw new Error('Google não devolveu refresh_token: ' + JSON.stringify(t));
  await gravarConf({ clientId, clientSecret, refresh_token: t.refresh_token });
  console.log(`Token guardado em ${CONF}. Agora é só rodar: node subir-drive.mjs`);
}

let tokenCache = { valor: null, expira: 0 };
async function token() {
  if (tokenCache.valor && Date.now() < tokenCache.expira - 60_000) return tokenCache.valor;
  const c = await lerConf();
  if (!c) {
    console.error('Sem token. Rode primeiro:  node subir-drive.mjs --auth');
    process.exit(1);
  }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      refresh_token: c.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const t = await r.json();
  if (!t.access_token) throw new Error('refresh falhou: ' + JSON.stringify(t));
  tokenCache = { valor: t.access_token, expira: Date.now() + t.expires_in * 1000 };
  return t.access_token;
}

// ─────────────────────────────────────────────────────────────── Drive API

const COMUM = { supportsAllDrives: 'true', includeItemsFromAllDrives: 'true' };

async function api(caminho, params = {}, init = {}) {
  const u = new URL('https://www.googleapis.com/drive/v3/' + caminho);
  for (const [k, v] of Object.entries({ ...COMUM, ...params })) u.searchParams.set(k, v);
  const r = await fetch(u, {
    ...init,
    headers: { Authorization: `Bearer ${await token()}`, ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`${caminho} ${r.status}: ${await r.text()}`);
  return r.json();
}

/** Nomes dos arquivos já presentes na pasta, pra não subir duas vezes. */
async function listar(pastaId) {
  const nomes = new Map();
  let pageToken;
  do {
    const r = await api('files', {
      q: `'${pastaId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, size)',
      pageSize: '1000',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const f of r.files) nomes.set(f.name, f);
    pageToken = r.nextPageToken;
  } while (pageToken);
  return nomes;
}

async function acharOuCriarPasta(nome, paiId) {
  const r = await api('files', {
    q:
      `'${paiId}' in parents and trashed = false and ` +
      `mimeType = 'application/vnd.google-apps.folder' and name = '${nome.replace(/'/g, "\\'")}'`,
    fields: 'files(id, name)',
  });
  if (r.files[0]) return r.files[0].id;
  const novo = await api(
    'files',
    { fields: 'id' },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nome,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [paiId],
      }),
    }
  );
  console.log(`  + pasta "${nome}"`);
  return novo.id;
}

const TIPOS = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.txt': 'text/plain', '.md': 'text/markdown' };

/** Upload resumível: o Drive devolve uma URL e o corpo vai em streaming, então
 *  um PNG de 2 MB nunca fica inteiro na memória. */
async function enviar(abs, nome, pastaId) {
  const tamanho = (await stat(abs)).size;
  const tipo = TIPOS[path.extname(abs).toLowerCase()] || 'application/octet-stream';

  const u = new URL('https://www.googleapis.com/upload/drive/v3/files');
  u.searchParams.set('uploadType', 'resumable');
  u.searchParams.set('supportsAllDrives', 'true');
  const inicio = await fetch(u, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await token()}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': tipo,
      'X-Upload-Content-Length': String(tamanho),
    },
    body: JSON.stringify({ name: nome, parents: [pastaId] }),
  });
  if (!inicio.ok) throw new Error(`início ${inicio.status}: ${await inicio.text()}`);
  const destino = inicio.headers.get('location');

  const r = await fetch(destino, {
    method: 'PUT',
    headers: { 'Content-Type': tipo, 'Content-Length': String(tamanho) },
    body: Readable.toWeb(createReadStream(abs)),
    duplex: 'half',
  });
  if (!r.ok) throw new Error(`envio ${r.status}: ${await r.text()}`);
}

// ────────────────────────────────────────────────────────────────── rotina

if (args.auth) {
  await autenticar();
  process.exit(0);
}

const alvos = args.lancha ? [String(args.lancha)] : Object.keys(LANCHAS);
let enviados = 0;
let pulados = 0;
let bytes = 0;

for (const pasta of alvos) {
  const l = LANCHAS[pasta];
  if (!l) {
    console.error(`lancha desconhecida: ${pasta}`);
    process.exit(1);
  }
  console.log(`\n${l.nome}`);

  /* se a pasta da lancha sumiu do Drive, recria pelo nome */
  let raizLancha = l.drive;
  try {
    await api(`files/${raizLancha}`, { fields: 'id' });
  } catch {
    raizLancha = await acharOuCriarPasta(l.nome, PASTA_RAIZ);
  }

  for (const [local, nomeDrive] of Object.entries(SUB)) {
    const dir = path.join(RAIZ, pasta, local);
    if (!existsSync(dir)) continue;
    const arquivos = (await readdir(dir)).filter((a) => TIPOS[path.extname(a).toLowerCase()]);
    if (!arquivos.length) continue;

    const destino = await acharOuCriarPasta(nomeDrive, raizLancha);
    const existentes = await listar(destino);
    console.log(`  ${nomeDrive}: ${arquivos.length} local, ${existentes.size} no Drive`);

    for (const arq of arquivos.sort()) {
      const abs = path.join(dir, arq);
      const tam = (await stat(abs)).size;
      const ja = existentes.get(arq);
      if (ja && Number(ja.size) === tam) {
        pulados++;
        continue;
      }
      if (args.seco) {
        console.log(`    subiria ${arq}`);
        enviados++;
        continue;
      }
      process.stdout.write(`    ${arq} … `);
      await enviar(abs, arq, destino);
      bytes += tam;
      enviados++;
      console.log('ok');
    }
  }

  /* o índice de campanha vai solto na pasta da lancha */
  const indice = path.join(RAIZ, pasta, 'INDICE-CRIATIVOS.txt');
  if (existsSync(indice) && !args.seco) {
    const existentes = await listar(raizLancha);
    if (!existentes.has('INDICE-CRIATIVOS.txt')) {
      await enviar(indice, 'INDICE-CRIATIVOS.txt', raizLancha);
      console.log('  INDICE-CRIATIVOS.txt ok');
      enviados++;
    }
  }
}

console.log(
  `\n${enviados} enviados, ${pulados} já estavam lá` +
    (bytes ? `, ${(bytes / 1048576).toFixed(0)} MB` : '')
);
