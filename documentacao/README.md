# Documentação do Projeto Drive Vale SIS

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [API REST](#api-rest)
- [Frontend](#frontend)
- [Integração](#integração)
- [Segurança](#segurança)
- [Deploy](#deploy)

## Visão Geral

O Drive Vale SIS é um sistema de gerenciamento de arquivos desenvolvido pela M-Software, que combina:

- Um frontend React com interface moderna e tema cyberpunk
- Uma API REST para comunicação entre o frontend e o banco de dados
- Um banco de dados PostgreSQL para armazenamento de dados estruturados
- Uma estratégia de conexão robusta adaptada para ambientes Docker

O sistema permite o upload, download, compartilhamento e controle de acesso a arquivos, com autenticação e autorização baseadas em perfis de usuário.

## Arquitetura

O projeto segue uma arquitetura em camadas:

1. **Frontend (React)**: Interface de usuário
2. **API REST (Node.js/Express)**: Camada de negócios e comunicação
3. **PostgreSQL**: Armazenamento de dados

### Diagrama de Arquitetura

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Frontend     │ ──> │  API REST     │ ──> │  PostgreSQL   │
│  React        │     │  Node.js      │     │  Supabase     │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

## Banco de Dados

O banco de dados utiliza PostgreSQL gerenciado pelo Supabase, configurado com as seguintes tabelas principais:

- **cad_emp_user**: Usuários do sistema
- **perfil_acesso**: Perfis de acesso (admin, user)
- **arquivos**: Metadados dos arquivos
- **categoria_arquivo**: Categorias para arquivos
- **compartilhamento**: Registros de compartilhamentos

A conexão com o banco de dados é feita através de uma estratégia robusta que utiliza nomes de container Docker com fallback para IPs, garantindo maior resiliência.

Para detalhes completos, consulte a [documentação do banco de dados](../database/README.md).

## API REST

A API REST fornece endpoints para todas as operações do sistema, incluindo:

- Autenticação e gerenciamento de usuários
- Upload, download e gerenciamento de arquivos
- Compartilhamento de arquivos entre usuários

A API implementa autenticação via JWT e autorização baseada em perfis, com tratamento centralizado de erros e validação de dados.

Para detalhes completos, consulte a [documentação da API](../database/api/README.md).

## Frontend

O frontend React foi construído com componentes modernos e um tema cyberpunk, fornecendo:

- Formulários de login e registro
- Dashboard para gerenciamento de arquivos
- Uploads via drag-and-drop
- Interface de compartilhamento
- Visualização de arquivos

O frontend se comunica com a API REST via Axios, utilizando JWT para autenticação.

## Integração

O projeto está integrado através dos seguintes mecanismos:

1. **API <-> Banco de Dados**: Conexão robusta com PostgreSQL utilizando o módulo `db.js`
2. **Frontend <-> API**: Comunicação HTTP com autenticação JWT
3. **Supabase local/nuvem**: Configuração flexível via variáveis de ambiente

## Segurança

O sistema implementa várias camadas de segurança:

1. **Autenticação JWT**: Tokens temporários para acesso autenticado
2. **Row Level Security (RLS)**: Controle de acesso no nível do banco de dados
3. **Validação de dados**: Cada endpoint verifica e valida os dados de entrada
4. **Autorização baseada em perfis**: Controle de acesso diferenciado para usuários e administradores
5. **HTTPS**: Comunicação criptografada (em produção)

## Deploy

As instruções para deploy estão disponíveis no diretório [deploy](./deploy).
