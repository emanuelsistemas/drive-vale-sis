#!/bin/bash

# Script para aplicar as mudanças no PostgreSQL
# Autor: Cascade
# Data: 2025-03-16

# Configurações
PG_HOST="10.11.0.24"
PG_PORT="5432"
PG_DATABASE="bd_drive_react"
PG_USER="postgres"
PG_PASSWORD="XDJ8cnWtyyiU@YScB2-j"

echo "=== Iniciando aplicação das mudanças no PostgreSQL ==="
echo "Host: $PG_HOST"
echo "Database: $PG_DATABASE"
echo ""

# Função para executar scripts SQL
executar_sql() {
  local arquivo="$1"
  echo "Executando script: $arquivo"
  
  PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -f "$arquivo"
  
  if [ $? -eq 0 ]; then
    echo "✅ Script executado com sucesso!"
  else
    echo "❌ Erro ao executar o script!"
    exit 1
  fi
  echo ""
}

# Verificar se o psql está instalado
if ! command -v psql &> /dev/null; then
  echo "O comando psql não foi encontrado. Instalando..."
  apt update && apt install -y postgresql-client
fi

# Executar scripts
echo "1. Criando estrutura do banco..."
executar_sql "src/scripts/criar_banco.sql"

echo "2. Migrando dados do Supabase (se existirem)..."
executar_sql "src/scripts/migrar_dados.sql"

echo "=== Mudanças aplicadas com sucesso! ==="
echo "O banco de dados PostgreSQL foi configurado e está pronto para uso."
echo "Agora você pode usar os novos serviços authService.ts e databaseService.ts"
echo "em vez dos serviços do Supabase."
