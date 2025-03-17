#!/bin/bash

# Instalar dependências
echo "Instalando dependências..."
npm install

# Criar estrutura de pastas se não existirem
mkdir -p public/fonts
mkdir -p src/assets/images
mkdir -p src/components
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/styles
mkdir -p src/types
mkdir -p src/utils

echo "Configuração concluída com sucesso!"
