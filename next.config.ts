import type { NextConfig } from "next";

// o Storage do projeto Supabase configurado (produção, preview ou banco local
// de teste): as fotos que a Tayssa sobe passam pelo otimizador de imagem
const storage = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return { protocol: u.protocol.replace(":", "") as "http" | "https", hostname: u.hostname, port: u.port };
  } catch {
    return null;
  }
})();
const storageLocal = storage ? ["localhost", "127.0.0.1"].includes(storage.hostname) : false;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // fotos da Tayssa Lash (Supabase Storage, bucket público)
      { protocol: "https", hostname: "hkjukobqpjezhpxzplpj.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(storage ? [{ ...storage, pathname: "/storage/v1/object/public/**" }] : []),
    ],
    // só o banco local de teste mora em IP local; produção nunca liga isto
    dangerouslyAllowLocalIP: storageLocal,
  },
  experimental: {
    serverActions: {
      // fotos e vídeos sobem direto para o Storage (URL assinada); o corpo
      // da server action fica pequeno. O teto continua para quem chamar antigo.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
