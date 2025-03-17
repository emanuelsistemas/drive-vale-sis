#!/bin/bash

# Script para executar a criação das tabelas de teste
# Autor: Cascade
# Data: 2025-03-16

# Configurações
PG_HOST="10.11.0.24"
PG_PORT="5432"
PG_DATABASE="bd_drive_react"
PG_USER="postgres"
PG_PASSWORD="XDJ8cnWtyyiU@YScB2-j"

echo "=== Criando tabelas de teste no PostgreSQL ==="
echo "Host: $PG_HOST"
echo "Database: $PG_DATABASE"
echo ""

# Verificar se o psql está instalado
if ! command -v psql &> /dev/null; then
  echo "O comando psql não foi encontrado. Instalando..."
  apt update && apt install -y postgresql-client
fi

# Executar o script SQL
echo "Executando script SQL para criar as tabelas..."
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -f "src/scripts/criar_tabelas_teste.sql"

if [ $? -eq 0 ]; then
  echo "✅ Tabelas criadas com sucesso!"
  
  # Verificar se as tabelas foram criadas
  echo ""
  echo "Verificando tabelas criadas:"
  PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -c "\dt"
  
  echo ""
  echo "Verificando usuário administrador criado:"
  PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -c "SELECT u.id, u.nome_user, u.email_user, p.perfil FROM \"user\" u JOIN perfil p ON u.id = p.usuario"
else
  echo "❌ Erro ao criar as tabelas!"
  exit 1
fi

echo ""
echo "=== Tabelas criadas com sucesso! ==="
echo "Agora você pode usar o componente de teste para interagir com as tabelas."
