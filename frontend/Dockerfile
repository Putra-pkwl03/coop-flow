# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]


FROM node:20-alpine

WORKDIR /app

# 1. Copy package management files & install dependencies
COPY package*.json ./
RUN npm ci

# 2. Copy seluruh source code
COPY . .

# 3. Environment Variables saat Build Time
ARG NEXT_PUBLIC_API_URL="https://coop-flow-backend-v1.up.railway.app"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_WEATHER_API_KEY="580138b622128076fd1b6a3651c6a59d"
ENV NEXT_PUBLIC_WEATHER_API_KEY=$NEXT_PUBLIC_WEATHER_API_KEY

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 4. Build Next.js & Generate PWA Service Worker
RUN npm run build

# 5. 🌟 KOPI ASET PUBLIK & STATIS KE FOLDER STANDALONE
# Langkah ini memastikan sw.js, manifest, dan gambar-gambar dibaca oleh PWA
RUN cp -r public .next/standalone/public
RUN cp -r .next/static .next/standalone/.next/static

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

# 6. 🌟 Eksekusi server standalone secara eksplisit dengan path lengkap
CMD ["node", ".next/standalone/server.js"]