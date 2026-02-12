/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Eliminamos la sección de eslint que causaba el warning
};

export default nextConfig;