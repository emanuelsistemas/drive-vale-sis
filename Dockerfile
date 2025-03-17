# Use uma versão específica do Node.js
FROM node:20-alpine as build

WORKDIR /app

# Copiar arquivos do projeto
COPY package*.json ./

# Instalar dependências usando --legacy-peer-deps para evitar problemas
RUN npm install --legacy-peer-deps

# Copiar todo o código fonte
COPY . .

# Remover pasta build existente e criar nova
RUN rm -rf build && npm run build

# Stage de produção com Nginx
FROM nginx:stable-alpine

# Copiar arquivos gerados para o diretório do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
