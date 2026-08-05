// import withPWAInit from '@ducanh2912/next-pwa';

// const withPWA = withPWAInit({
//   dest: 'public',
// disable: process.env.NODE_ENV === "development" && process.env.ENABLE_PWA_DEV !== "true",
//   register: true,
//   skipWaiting: true,
//   swMinify: false, 
  
//   // Custom Workbox runtime caching untuk navigasi offline
//   workboxOptions: {
//     disableDevLogs: true,
//     runtimeCaching: [
//       {
//         // Cache semua halaman HTML / dokumen navigasi
//         urlPattern: ({ request }) => request.mode === 'navigate',
//         handler: 'NetworkFirst',
//         options: {
//           cacheName: 'pages-cache',
//           expiration: {
//             maxEntries: 32,
//             maxAgeSeconds: 24 * 60 * 60 * 30, // 30 Hari
//           },
//           networkTimeoutSeconds: 3,
//         },
//       },
//       {
//         // Cache file statis Next.js (_next/static/...)
//         urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
//         handler: 'CacheFirst',
//         options: {
//           cacheName: 'next-static-assets',
//           expiration: {
//             maxEntries: 64,
//             maxAgeSeconds: 24 * 60 * 60 * 30,
//           },
//         },
//       },
//     ],
//   },
// });

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true, 
//   },

//   webpack: (config, { dev }) => {
//     if (dev) {
//       config.devtool = 'source-map';
//     }
//     return config;
//   },

//   async redirects() {
//     return [
//       {
//         source: '/dashboard',
//         destination: '/auth/login',
//         permanent: true,
//       },
//     ];
//   },
// };

// export default withPWA(nextConfig);





import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === "development" && process.env.ENABLE_PWA_DEV !== "true",
  register: true,
  skipWaiting: true,
  swMinify: false, 
  
  // Custom Workbox runtime caching untuk navigasi offline
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Cache semua halaman HTML / dokumen navigasi
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 * 30, // 30 Hari
          },
          networkTimeoutSeconds: 3,
        },
      },
      {
        // Cache file statis Next.js (_next/static/...)
        urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60 * 30,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🌟 SANGAT KRUSIAL UNTUK RAILWAY DEPLOYMENT:
  // Menghasilkan build minimalis (ringan memory/RAM)
  output: 'standalone',

  // Membatasi penggunaan CPU saat build di server Railway agar tidak OOM
  experimental: {
    cpus: 1,
  },

  typescript: {
    ignoreBuildErrors: true, 
  },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = 'source-map';
      
      if (!isServer) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
    }
    return config;
  },

  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);