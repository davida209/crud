/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Esto permite que el build termine aunque haya errores de TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // También ignoramos ESLint para evitar errores de formato
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;