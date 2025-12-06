import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Identifica problemas no ciclo de vida dos componentes
  poweredByHeader: false, // Oculta "X-Powered-By: Next.js" (Segurança por obscuridade)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Domínio genérico do Supabase
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*', // Aplica a todas as rotas
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload' // HSTS: HTTPS Obrigatório
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN' // Anti-Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Anti-MIME Sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin' // Privacidade
          },
          {
             key: 'Permissions-Policy',
             value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" // Bloqueio de hardware
          }
        ]
      }
    ];
  },
};

export default nextConfig;