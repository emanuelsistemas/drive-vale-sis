# Documentação do Drive-React

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Integração com Supabase](#integração-com-supabase)
4. [Fluxo de Autenticação](#fluxo-de-autenticação)
5. [Políticas de Segurança (RLS)](#políticas-de-segurança-rls)
6. [Estrutura de Dados](#estrutura-de-dados)
7. [Componentes Principais](#componentes-principais)
8. [Serviços](#serviços)
9. [Variáveis de Ambiente](#variáveis-de-ambiente)
10. [Solução de Problemas](#solução-de-problemas)

## Visão Geral

O Drive-React é uma aplicação front-end desenvolvida em React para o sistema Drive Vale-Sis. Ela se comunica com o Supabase para autenticação de usuários, armazenamento de dados e gerenciamento de permissões. A aplicação utiliza um sistema de autenticação baseado em JWT (JSON Web Tokens) e implementa políticas de segurança Row Level Security (RLS) para controle de acesso aos dados.

## Arquitetura

A aplicação segue uma arquitetura baseada em componentes React com gerenciamento de estado através de contextos (Context API). Os principais elementos da arquitetura são:

- **Componentes**: Elementos de UI reutilizáveis (Button, Input, etc.)
- **Contextos**: Gerenciamento de estado global (AuthContext, SupabaseContext, ToastContext)
- **Serviços**: Lógica de negócio e comunicação com o Supabase (UserService)
- **Páginas**: Componentes de nível superior que representam rotas da aplicação

```
drive-react/
├── public/                  # Arquivos estáticos
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/            # Contextos para gerenciamento de estado
│   ├── pages/               # Páginas/rotas da aplicação
│   ├── routes/              # Configuração de rotas
│   ├── services/            # Serviços para lógica de negócio
│   ├── styles/              # Estilos globais
│   ├── App.tsx              # Componente raiz
│   └── index.tsx            # Ponto de entrada
└── .env                     # Variáveis de ambiente
```

## Integração com Supabase

### Inicialização do Cliente Supabase

A integração com o Supabase é feita através do `SupabaseContext`, que inicializa o cliente Supabase usando as variáveis de ambiente:

```typescript
// src/contexts/SupabaseContext.tsx
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_DRIVE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_DRIVE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

O contexto fornece o cliente Supabase para todos os componentes da aplicação:

```typescript
export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
```

### Hierarquia de Contextos

É importante que o `SupabaseProvider` esteja posicionado acima do `AuthProvider` na hierarquia de componentes, pois o `AuthProvider` depende do cliente Supabase:

```typescript
// src/App.tsx
function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ToastProvider>
          {/* Resto da aplicação */}
        </ToastProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}
```

## Fluxo de Autenticação

### Registro de Usuários

O processo de registro de usuários envolve:

1. Validação dos dados do formulário (nome, email, senha)
2. Verificação da senha de autorização (REACT_APP_ADMIN_PASSWORD)
3. Criação do usuário no sistema de autenticação do Supabase
4. Criação do registro do usuário na tabela `cad_emp_user`
5. Atribuição de um perfil de acesso (admin para o primeiro usuário, user para os demais)

```typescript
// src/contexts/AuthContext.tsx
const signUp = async (email: string, password: string, nome: string, empresa?: string) => {
  // Validações...
  
  try {
    const userParams: CreateUserParams = {
      email,
      password,
      nome,
      empresa
    };
    
    await userService.createUser(userParams);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message || 'Erro ao criar usuário' } };
  }
};
```

O `UserService` implementa a lógica de criação do usuário:

```typescript
// src/services/UserService.ts
async createUser(params: CreateUserParams): Promise<CadEmpUser | null> {
  // 1. Criar usuário na autenticação
  const { data: authData } = await this.supabase.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true
  });
  
  // 2. Determinar o perfil (admin para o primeiro usuário)
  // ...
  
  // 3. Criar registro na tabela cad_emp_user
  const { data: userData } = await this.supabase
    .from('cad_emp_user')
    .insert([
      {
        auth_id: authData.user.id,
        nome: params.nome,
        email: params.email,
        empresa: params.empresa,
        // ...
      }
    ])
    .select('*')
    .single();
  
  return userData;
}
```

### Login de Usuários

O processo de login envolve:

1. Autenticação com email e senha no Supabase
2. Carregamento dos dados do usuário da tabela `cad_emp_user`
3. Verificação do status de administrador
4. Armazenamento da sessão e dados do usuário no contexto

```typescript
// src/contexts/AuthContext.tsx
const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
};

// Carregar dados do usuário após autenticação
const loadUserData = async (currentSession: Session | null) => {
  if (!currentSession) return;
  
  try {
    // Verificar se é admin
    const adminStatus = await userService.isAdmin();
    setIsAdmin(adminStatus);
    
    // Carregar dados do usuário
    const currentUserData = await userService.getCurrentUser();
    setUserData(currentUserData);
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
};
```

### Gerenciamento de Sessão

O `AuthProvider` configura um listener para mudanças no estado de autenticação:

```typescript
useEffect(() => {
  // Obter sessão atual
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    loadUserData(session);
    setLoading(false);
  });

  // Configurar listener para mudanças na autenticação
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadUserData(session);
      setLoading(false);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

## Políticas de Segurança (RLS)

### Problema de Recursão Infinita

O sistema utiliza políticas Row Level Security (RLS) no Supabase para controlar o acesso aos dados. Um problema comum é a recursão infinita nas políticas, que ocorre quando uma política faz referência a si mesma.

Por exemplo, a política "Administradores podem ver todos os usuários" verifica se o usuário atual é administrador, mas essa verificação pode envolver consultar a tabela `cad_emp_user`, que por sua vez está protegida pela mesma política.

### Solução

A solução para o problema de recursão infinita envolve a criação de uma função segura para verificar o status de administrador sem depender das políticas RLS:

```sql
-- Criar função segura para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS BOOLEAN AS $$
DECLARE
  user_id TEXT;
  admin_profile_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Obter o ID do usuário atual
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Obter o ID do perfil 'admin'
  SELECT id INTO admin_profile_id FROM perfil_acesso WHERE tipo = 'admin';
  
  -- Verificar diretamente se o usuário tem perfil de admin
  EXECUTE 'SELECT EXISTS (
    SELECT 1 
    FROM cad_emp_user 
    WHERE auth_id = $1 
    AND perfil_id = $2
  )' INTO is_admin USING user_id, admin_profile_id;
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Esta função é marcada como `SECURITY DEFINER`, o que significa que ela é executada com as permissões do usuário que a criou (geralmente um superusuário), ignorando as políticas RLS.

### Implementação das Políticas

As políticas RLS são implementadas da seguinte forma:

```sql
-- Política para usuários verem seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON "cad_emp_user" 
FOR SELECT 
USING (auth.uid() = auth_id);

-- Política para administradores verem todos os usuários
CREATE POLICY "Administradores podem ver todos os usuários" 
ON "cad_emp_user" 
FOR SELECT 
USING (is_admin_safe());

-- Política para administradores inserirem usuários
CREATE POLICY "Administradores podem inserir usuários" 
ON "cad_emp_user" 
FOR INSERT 
WITH CHECK (is_admin_safe() OR auth.uid() IS NULL);

-- Política para administradores atualizarem usuários
CREATE POLICY "Administradores podem atualizar usuários" 
ON "cad_emp_user" 
FOR UPDATE 
USING (is_admin_safe());

-- Política para administradores excluírem usuários
CREATE POLICY "Administradores podem excluir usuários" 
ON "cad_emp_user" 
FOR DELETE 
USING (is_admin_safe());
```

## Estrutura de Dados

### Tabelas Principais

#### cad_emp_user

Tabela para cadastro de usuários do sistema:

- `id`: UUID (chave primária)
- `auth_id`: UUID (referência à tabela auth.users do Supabase)
- `nome`: TEXT (obrigatório)
- `email`: TEXT (único, obrigatório)
- `telefone`: TEXT
- `empresa`: TEXT
- `cargo`: TEXT
- `perfil_id`: UUID (referência à tabela perfil_acesso)
- `ativo`: BOOLEAN (padrão: true)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### perfil_acesso

Tabela para gerenciar os perfis de acesso ao sistema:

- `id`: UUID (chave primária)
- `tipo`: ENUM ('admin', 'user')
- `descricao`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Interfaces TypeScript

As interfaces TypeScript correspondentes são definidas em `src/services/UserService.ts`:

```typescript
export interface PerfilAcesso {
  id: string;
  tipo: 'admin' | 'user';
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CadEmpUser {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  perfil_id: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  perfil?: PerfilAcesso;
}
```

## Componentes Principais

### AuthContext

O `AuthContext` gerencia o estado de autenticação e fornece métodos para login, registro e logout:

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: CadEmpUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string, empresa?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
```

### SupabaseContext

O `SupabaseContext` inicializa e fornece o cliente Supabase:

```typescript
interface SupabaseContextType {
  supabase: SupabaseClient;
}
```

### Formulário de Autenticação

O formulário de autenticação (`src/pages/Auth/index.tsx`) permite login e registro de usuários. No caso do registro, ele inclui um campo para a senha de autorização, que é validada contra o valor definido em `REACT_APP_ADMIN_PASSWORD`.

```typescript
const validateAdminPassword = () => {
  if (!adminPassword) {
    setAdminPasswordError('A senha de autorização é obrigatória');
    return false;
  } else if (adminPassword !== 'admin123') { // Valor da variável REACT_APP_ADMIN_PASSWORD
    setAdminPasswordError('Senha de autorização inválida');
    return false;
  } else {
    setAdminPasswordError('');
    return true;
  }
};
```

## Serviços

### UserService

O `UserService` implementa a lógica de negócio relacionada aos usuários:

```typescript
export class UserService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // Métodos para gerenciar usuários
  async isAdmin(): Promise<boolean> { /* ... */ }
  async getPerfis(): Promise<PerfilAcesso[]> { /* ... */ }
  async getUsers(): Promise<CadEmpUser[]> { /* ... */ }
  async getCurrentUser(): Promise<CadEmpUser | null> { /* ... */ }
  async createUser(params: CreateUserParams): Promise<CadEmpUser | null> { /* ... */ }
  async updateUser(id: string, params: UpdateUserParams): Promise<CadEmpUser | null> { /* ... */ }
  async deleteUser(id: string): Promise<boolean> { /* ... */ }
}
```

## Variáveis de Ambiente

As variáveis de ambiente são definidas no arquivo `.env`:

```
# Configuração para Supabase
REACT_APP_DRIVE_SUPABASE_URL=https://drive-vale-sis-supabase.h6gsxu.easypanel.host
REACT_APP_DRIVE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_DRIVE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Outras configurações
REACT_APP_ADMIN_PASSWORD=admin123

# Configuração ativa (true = usar Supabase local, false = usar Supabase na nuvem)
REACT_APP_USE_LOCAL_SUPABASE=true

# Configuração da porta do servidor de desenvolvimento
PORT=3001
```

## Solução de Problemas

### Erro de Recursão Infinita em Políticas RLS

Se ocorrer o erro "infinite recursion detected in policy for relation 'cad_emp_user'", execute o SQL fornecido na seção [Políticas de Segurança (RLS)](#políticas-de-segurança-rls) para corrigir o problema.

### Problemas de Autenticação

Se ocorrerem problemas de autenticação:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique se o `SupabaseProvider` está posicionado acima do `AuthProvider` na hierarquia
3. Verifique se as políticas RLS estão configuradas corretamente
4. Verifique os logs do console para erros específicos

### Problemas com Componentes Styled-Components

Se ocorrerem avisos relacionados a props desconhecidas em componentes styled-components, use props transientes (prefixadas com `$`) para evitar que as props sejam passadas para o DOM:

```typescript
// Antes
const StyledButton = styled.button<ButtonProps>`
  background-color: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
`;

// Depois
const StyledButton = styled.button<ButtonProps>`
  background-color: ${props => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
`;
```
