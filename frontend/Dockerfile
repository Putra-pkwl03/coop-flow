# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]


FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install SEMUA dependencies (dev & prod) agar CLI 'next' tersedia saat build
RUN npm install

# Copy seluruh source code
COPY . .
# ⬇️ 1. Masukkan ARG & ENV untuk URL API Backend
ARG NEXT_PUBLIC_API_URL="https://coop-flow-backend-v1.up.railway.app"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# ⬇️ 2. Tambahkan ARG & ENV untuk Weather API Key ini (PENTING)
ARG NEXT_PUBLIC_WEATHER_API_KEY="580138b622128076fd1b6a3651c6a59d"
ENV NEXT_PUBLIC_WEATHER_API_KEY=$NEXT_PUBLIC_WEATHER_API_KEY

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Set environment runtime
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

# Langsung jalankan server bawaan hasil standalone/next start
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]