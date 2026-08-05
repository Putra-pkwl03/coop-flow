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


import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // swMinify: false,
  
  // Halaman fallback jika pengguna offline & halaman belum ada di cache
  fallbacks: {
    document: '/~offline',
  },

  // Konfigurasi Workbox Runtime Caching
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 Hari
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 24 * 60 * 60 * 30,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'source-map';
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