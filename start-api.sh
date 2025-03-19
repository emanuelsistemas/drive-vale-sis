#!/bin/bash

# Definir variáveis de ambiente
export PORT=3001
export POSTGRES_HOST=drive-vale-sis_supabase-db-1
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=postgres
export JWT_SECRET=valeterm-secret-key
export JWT_EXPIRES_IN=24h
export NODE_ENV=development

# Iniciar a API
cd /root/m-software/drive-vale-sis/database/api
node server.js
