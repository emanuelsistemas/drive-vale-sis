# Usando PostgreSQL com TypeScript no React

Este guia demonstra como usar o PostgreSQL com TypeScript em um projeto React, usando a estrutura de tabelas do Drive Vale-Sis como exemplo.

## 1. Configuração do TypeScript

### 1.1. Instalação das Dependências

```bash
npm install --save-dev typescript @types/node @types/pg
npm install pg dotenv
```

### 1.2. Tipos para as Tabelas

```typescript
// src/types/database.ts

// Enum para tipos de perfil
export enum TipoPerfil {
  ADMIN = 'admin',
  USER = 'user'
}

// Interface para a tabela perfil_acesso
export interface PerfilAcesso {
  id: string;
  tipo: TipoPerfil;
  descricao: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para a tabela cad_emp_user
export interface Usuario {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  perfil_id: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}
```

## 2. Configuração da Conexão

```typescript
// src/config/database.ts
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração da pool de conexões
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: false
});

// Interface para resultados paginados
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Classe para gerenciar conexões e queries
export class Database {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Executa uma query com parâmetros
  async query<T>(text: string, params?: any[]): Promise<T[]> {
    const { rows } = await this.pool.query(text, params);
    return rows as T[];
  }

  // Obtém um cliente da pool para transações
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // Exemplo de query paginada
  async queryPaginated<T>(
    text: string,
    page: number = 1,
    pageSize: number = 10,
    params: any[] = []
  ): Promise<PaginatedResult<T>> {
    const countText = text.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const offset = (page - 1) * pageSize;

    const [{ count }] = await this.query(countText, params);
    const data = await this.query<T>(
      `${text} LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    return {
      data,
      total: parseInt(count as string),
      page,
      pageSize
    };
  }
}

// Exporta uma instância única
export const db = new Database();
```

## 3. Exemplo de Repositório

```typescript
// src/repositories/UsuarioRepository.ts
import { Usuario } from '../types/database';
import { db, PaginatedResult } from '../config/database';

export class UsuarioRepository {
  // Busca um usuário por ID
  async findById(id: string): Promise<Usuario | null> {
    const [usuario] = await db.query<Usuario>(
      'SELECT * FROM cad_emp_user WHERE id = $1',
      [id]
    );
    return usuario || null;
  }

  // Lista usuários com paginação
  async listar(
    page: number = 1,
    pageSize: number = 10,
    filtroAtivo: boolean = true
  ): Promise<PaginatedResult<Usuario>> {
    return await db.queryPaginated<Usuario>(
      'SELECT * FROM cad_emp_user WHERE ativo = $1 ORDER BY nome',
      page,
      pageSize,
      [filtroAtivo]
    );
  }

  // Cria um novo usuário
  async criar(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const [novoUsuario] = await db.query<Usuario>(
      `INSERT INTO cad_emp_user 
       (auth_id, nome, email, telefone, empresa, cargo, perfil_id, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        usuario.auth_id,
        usuario.nome,
        usuario.email,
        usuario.telefone,
        usuario.empresa,
        usuario.cargo,
        usuario.perfil_id,
        usuario.ativo
      ]
    );
    return novoUsuario;
  }

  // Atualiza um usuário
  async atualizar(id: string, usuario: Partial<Usuario>): Promise<Usuario | null> {
    const campos = Object.keys(usuario)
      .map((campo, index) => `${campo} = $${index + 2}`)
      .join(', ');

    const valores = Object.values(usuario);

    const [usuarioAtualizado] = await db.query<Usuario>(
      `UPDATE cad_emp_user 
       SET ${campos}, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, ...valores]
    );

    return usuarioAtualizado || null;
  }

  // Desativa um usuário
  async desativar(id: string): Promise<boolean> {
    const [usuario] = await db.query<Usuario>(
      'UPDATE cad_emp_user SET ativo = false WHERE id = $1 RETURNING *',
      [id]
    );
    return !!usuario;
  }
}

// Exporta uma instância única
export const usuarioRepository = new UsuarioRepository();
```

## 4. Uso em Componentes React

```typescript
// src/components/ListaUsuarios.tsx
import React, { useEffect, useState } from 'react';
import { Usuario } from '../types/database';
import { usuarioRepository } from '../repositories/UsuarioRepository';

export const ListaUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const resultado = await usuarioRepository.listar(1, 10);
      setUsuarios(resultado.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Usuários</h2>
      <ul>
        {usuarios.map(usuario => (
          <li key={usuario.id}>
            {usuario.nome} - {usuario.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## 5. Boas Práticas com TypeScript

1. **Tipos Explícitos**: Sempre defina interfaces para suas tabelas
2. **Generics**: Use para reutilizar código mantendo type safety
3. **Null Safety**: Trate casos onde dados podem ser null
4. **Validação**: Use bibliotecas como Zod ou Yup para validar dados
5. **Error Handling**: Crie tipos específicos para erros

## 6. Dicas de Performance

1. **Prepared Statements**: O pg já usa por padrão
2. **Connection Pooling**: Use a classe Pool
3. **Paginação**: Implemente em queries que retornam muitos dados
4. **Índices**: Crie índices para campos frequentemente consultados
5. **Transações**: Use quando precisar de consistência em múltiplas operações
