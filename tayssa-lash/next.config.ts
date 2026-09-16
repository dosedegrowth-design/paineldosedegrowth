import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // fotos da Tayssa Lash (Supabase Storage, bucket público)
      { protocol: "https", hostname: "hkjukobqpjezhpxzplpj.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: {
    serverActions: {
      // fotos da Tayssa sobem por server action (bucket do Supabase)
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
