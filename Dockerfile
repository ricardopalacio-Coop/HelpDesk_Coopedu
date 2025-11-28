# 1. Usar uma imagem base do Node.js
FROM node:20-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# 2. Copiar arquivos de dependências E A PASTA PATCHES
# (Aqui estava o erro: precisávamos copiar a pasta patches antes de instalar)
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar dependências
RUN pnpm install

# 3. Copiar o resto do código fonte
COPY . .

# 4. Definir variáveis de ambiente para build
ENV NODE_ENV=production

# 5. Construir o projeto
RUN pnpm build

# 6. Expor a porta 3000
EXPOSE 3000

# 7. Comando para iniciar
CMD ["pnpm", "start"]
