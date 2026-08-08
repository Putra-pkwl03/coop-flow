import withPWAInit from 'next-pwa';
import defaultCache from 'next-pwa/cache.js';

const isDev = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
  dest: 'public',
  disable: isDev, 
  register: !isDev,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // 1. Cache Tile Peta Spasial
    {
      urlPattern: /^https?:\/\/(server\.arcgisonline\.com|.*\.tile\.openstreetmap\.org|.*\.basemaps\.cartocdn\.com|.*\.google\.com\/vt\/lyrs=.*)\/.*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'spatial-map-tiles',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 2. Caching Halaman Navigasi
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    ...defaultCache,
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Catatan: output: 'standalone' bisa di-comment saat dev jika terasa berat
  // output: 'standalone', 
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


// import withPWAInit from 'next-pwa';
// import defaultCache from 'next-pwa/cache.js';

// const withPWA = withPWAInit({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
//   fallbacks: {
//     document: '/offline', // Hanya sebagai cadangan TERAKHIR jika halaman belum pernah dibuka sama sekali
//   },
//   runtimeCaching: [
//     // 1. Cache Tile Peta Spasial (Gunakan CacheFirst)
//     {
//       urlPattern: /^https?:\/\/(server\.arcgisonline\.com|.*\.tile\.openstreetmap\.org|.*\.basemaps\.cartocdn\.com|.*\.google\.com\/vt\/lyrs=.*)\/.*$/i,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'spatial-map-tiles',
//         expiration: {
//           maxEntries: 1000,
//           maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
//         },
//         cacheableResponse: {
//           statuses: [0, 200],
//         },
//       },
//     },

//     // 2. 🌟 PERBAIKAN UTAMA: Caching Halaman / Dokumen Navigasi
//     // Gunakan 'NetworkFirst' agar saat offline, halaman yang PERNAH dibuka akan diambil dari Cache!
//     {
//       urlPattern: ({ request }) => request.mode === 'navigate',
//       handler: 'NetworkFirst', // 👈 Diubah dari StaleWhileRevalidate ke NetworkFirst
//       options: {
//         cacheName: 'pages-cache',
//         networkTimeoutSeconds: 3, // Jika koneksi lambat dalam 3 detik, langsung tampilkan versi cache
//         expiration: {
//           maxEntries: 64,
//           maxAgeSeconds: 30 * 24 * 60 * 60,
//         },
//         cacheableResponse: {
//           statuses: [0, 200],
//         },
//       },
//     },

//     // 3. Gabungkan Aturan Bawaan next-pwa (menangani JS, CSS, _next/data, dll.)
//     ...defaultCache,
//   ],
// });

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'standalone',
//   experimental: {
//     cpus: 1,
//   },
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