# Documentação de Deploy - Drive Vale SIS

## Introdução

Este documento descreve o processo de deploy da aplicação React no EasyPanel usando Docker e Nginx. Após vários testes e ajustes, conseguimos estabelecer uma configuração estável e eficiente.

## Problemas Encontrados

Durante o processo de deploy, enfrentamos os seguintes desafios:

1. **Erro de imagem não encontrada**: `No such image: easypanel/drive-vale-sis/drive-vale-sis:latest`
2. **Tela branca após deploy**: O site carregava, mas exibia apenas uma tela em branco
3. **Tempo de build excessivo**: O primeiro build demorou mais de 12 minutos (769 segundos)

## Solução Final

A solução que resolveu todos os problemas foi uma abordagem simplificada:

### Dockerfile Otimizado

```dockerfile
# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Configuração direta do Nginx sem arquivo externo
RUN echo \\
"server {\\
    listen 80;\\
    location / {\\
        root /usr/share/nginx/html;\\
        index index.html;\\
        try_files $uri $uri/ /index.html;\\
    }\\
}" > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Principais Alterações

1. **Remoção do arquivo nginx.conf externo**
   - Em vez de usar um arquivo separado, a configuração do Nginx foi incorporada diretamente no Dockerfile
   - Isso elimina possíveis problemas de caminho ou permissão de arquivo

2. **Configuração mínima do Nginx**
   - Apenas as configurações essenciais foram mantidas
   - A configuração `try_files $uri $uri/ /index.html` é crucial para aplicações SPA como React

3. **Uso da imagem `nginx:stable-alpine`**
   - Versão estável e leve do Nginx

## Boas Práticas para Futuros Deploys

### Otimizar o Tempo de Build

1. **Utilizar .dockerignore**
   - Crie um arquivo `.dockerignore` para excluir arquivos desnecessários do contexto de build
   - Exemplo: `node_modules`, `.git`, arquivos temporários, logs

2. **Organizar as camadas Docker**
   - Coloque as operações que mudam com menos frequência no início do Dockerfile
   - As dependências devem ser instaladas antes de copiar o código fonte

3. **Usar npm ci em vez de npm install**
   - Para builds de produção, `npm ci` é mais rápido e determinístico

```dockerfile
RUN npm ci --silent  # Em vez de npm install
```

### Configuração do React

1. **Configuração do Router**
   - Certifique-se de que o React Router esteja configurado corretamente para funcionar em produção
   - Use `<BrowserRouter basename="/">` se o aplicativo não estiver na raiz

2. **Path Base**
   - Se a aplicação não estiver na raiz, configure o `homepage` no `package.json`:

```json
{
  "homepage": "https://drive.appbr.io"
}
```

### Lembrete sobre os Tempos de Build

- **Primeiro build**: Sempre será mais lento (12+ minutos)
- **Builds subsequentes**: Significativamente mais rápidos devido ao cache das camadas Docker
- **Após mudanças no package.json**: O tempo aumentará devido à reinstalação de dependências

## Teste de Funcionamento

Após o deploy, verifique:

1. Acesso à URL principal: https://drive.appbr.io/
2. Navegação entre páginas usando o router
3. Funcionalidades que dependem de chamadas API
4. Comportamento responsivo em diferentes dispositivos

## Troubleshooting

Se ocorrerem problemas no futuro:

1. **Tela branca**:
   - Verifique o console do navegador para erros JavaScript
   - Confirme que a configuração do Nginx inclui `try_files $uri $uri/ /index.html`
   - Adicione uma página de teste estática (`test.html`) para verificar se o Nginx está funcionando

2. **Erro de imagem não encontrada**:
   - Verifique se o nome do repositório e branch estão corretos no EasyPanel
   - Confirme que o Dockerfile está na raiz do projeto
   - Tente um rebuild manual no EasyPanel

---

Documentação criada em: 17/03/2025
Última atualização: 17/03/2025
