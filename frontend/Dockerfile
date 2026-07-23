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

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

# Build Next.js untuk produksi
RUN npm run build

EXPOSE 3000

# Jalankan server Next.js mode produksi di port dinamis Railway
CMD ["npm", "run", "start", "--", "-p", "3000", "-H", "0.0.0.0"]