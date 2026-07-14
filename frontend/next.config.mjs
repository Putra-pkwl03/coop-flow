/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },

  turbopack: {},

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Cek perubahan berkas setiap 1 detik
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
