// import axios from 'axios';

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('access_token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from 'axios';

// 1. Tentukan fallback default jika env bernilai undefined saat build
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://coop-flow-backend-v1.up.railway.app';

// 2. Bersihkan trailing slash di akhir agar tidak double slash
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${cleanBaseUrl}/api`,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;