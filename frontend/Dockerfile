# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]



# ==========================================
# 1. BASE IMAGE & DEPENDENCIES
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ==========================================
# 2. BUILDER STAGE
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment Variables saat Build Time
ARG NEXT_PUBLIC_API_URL="https://coop-flow-backend-v1.up.railway.app"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_WEATHER_API_KEY="580138b622128076fd1b6a3651c6a59d"
ENV NEXT_PUBLIC_WEATHER_API_KEY=$NEXT_PUBLIC_WEATHER_API_KEY

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build Next.js & Generate PWA Service Worker (sw.js)
RUN npm run build

# ==========================================
# 3. RUNNER STAGE (Production Standalone)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Buat user non-root demi keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 🌟 KRUSIAL UNTUK PWA & STANDALONE:
# Copy file public (sw.js & workbox-*.js) & static assets ke folder standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# 🌟 Jalankan server standalone langsung (sangat cepat & ramah RAM Railway)
CMD ["node", "server.js"]