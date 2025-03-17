# Build stage com cache otimizado
FROM node:20-alpine as build

WORKDIR /app

# Copiar apenas os arquivos de dependência para aproveitar o cache
COPY package*.json ./

# Instalar dependências com cache
RUN npm ci --silent

# Copiar arquivos do projeto
COPY . .

# Construir em modo de produção
RUN npm run build

# Stage de produção - minimal
FROM nginx:alpine

# Copiar apenas os arquivos de build necessários
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
