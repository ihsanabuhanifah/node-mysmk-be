# Image slim: lebih kecil & jauh lebih sedikit kerentanan dibanding node:20-bookworm penuh
FROM node:20-bookworm-slim

# Zona waktu WIB (jadwal cron mengikuti jam sistem)
ENV TZ=Asia/Jakarta \
    NODE_ENV=production

RUN apt-get update \
 && apt-get install -y --no-install-recommends tzdata ca-certificates \
 && apt-get upgrade -y \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependency dulu agar layer ini di-cache selama package*.json tidak berubah
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Folder upload (di-mount sebagai volume oleh docker-compose)
RUN mkdir -p public/data/uploads

EXPOSE 8080
CMD ["node", "index.js"]
