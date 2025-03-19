# Drive Vale-SIS

Sistema de gerenciamento de arquivos com conexão robusta ao PostgreSQL e API REST.

## Visão Geral

Drive Vale-SIS é um sistema de gerenciamento de arquivos com frontend React e backend Node.js, utilizando PostgreSQL para armazenamento de dados.

## Componentes Principais

O projeto é composto por:

1. **Frontend React** - Interface de usuário moderna com tema cyberpunk
2. **API REST** - Backend para comunicação com o banco de dados
3. **Banco de Dados PostgreSQL** - Armazenamento de dados estruturados

## Documentação

- [Banco de Dados](./database/README.md) - Configuração e scripts do PostgreSQL
- [API REST](./database/api/README.md) - Endpoints e integração com frontend
- [Documentação Geral](./documentacao/README.md) - Informações adicionais

## Configuração e Inicialização

1. Configure as variáveis de ambiente:
   ```
   cp .env.example .env
   ```

2. Inicie o ambiente Docker:
   ```
   docker-compose up -d
   ```

3. Inicialize o banco de dados:
   ```
   cd database/scripts
   node criar-schema-drive.js
   node inserir-dados-exemplo.js
   ```

4. Inicie a API:
   ```
   cd database/api
   npm install
   npm start
   ```

5. Inicie o frontend:
   ```
   npm install
   npm start
   ```

## Arquitetura de Conexão

O sistema utiliza uma arquitetura de conexão robusta com o PostgreSQL, que:

1. Tenta conectar usando nomes de container Docker
2. Possui fallback para endereços IP
3. Mantém uma única conexão para melhor performance
4. Suporta transações para operações complexas

## Licença

Copyright 2025 M-Software
