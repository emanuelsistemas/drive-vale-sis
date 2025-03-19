// Interfaces para os tipos de dados sem conexão real
export interface PerfilAcesso {
  id: string;
  tipo: 'admin' | 'user';
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilInterface {
  tipo: 'admin' | 'user';
  id?: string;
}

export interface CadEmpUser {
  id: string | number;
  nome: string;
  email: string;
  empresa?: string;
  perfil: string | PerfilInterface;
  telefone?: string;
  cargo?: string;
  perfil_id?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  nome: string;
  empresa?: string;
  telefone?: string;
  cargo?: string;
  perfil_id?: string;
  ativo?: boolean;
}

export interface UpdateUserParams {
  nome?: string;
  empresa?: string;
  telefone?: string;
  cargo?: string;
  perfil_id?: string;
  ativo?: boolean;
}

// Dados mock para simular respostas
const MOCK_PERFIS: PerfilAcesso[] = [
  { id: 'admin-id', tipo: 'admin', descricao: 'Administrador', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'user-id', tipo: 'user', descricao: 'Usuário', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
];

const MOCK_USERS: CadEmpUser[] = [
  {
    id: 'user-1',
    nome: 'Admin Teste',
    email: 'admin@example.com',
    empresa: 'Empresa Teste',
    perfil: 'admin',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    nome: 'Usuário Teste',
    email: 'user@example.com',
    empresa: 'Empresa Teste',
    perfil: 'user',
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-01T00:00:00Z',
  },
];

/**
 * Serviço para gerenciar usuários e perfis de acesso - VERSÃO MOCK SEM CONEXÃO
 */
export class UserService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    console.log('UserService: Inicializado em modo MOCK (sem conexão)');
  }

  /**
   * Verifica se o usuário atual é administrador
   */
  async isAdmin(): Promise<boolean> {
    console.log('UserService.isAdmin: Retornando valor MOCK');
    return true; // Sempre retorna true para fins de mock
  }

  /**
   * Obtém todos os perfis de acesso
   */
  async getPerfis(): Promise<PerfilAcesso[]> {
    console.log('UserService.getPerfis: Retornando dados MOCK');
    return [...MOCK_PERFIS]; // Retorna uma cópia da lista de perfis mock
  }

  /**
   * Obtém todos os usuários com seus perfis
   */
  async getUsers(): Promise<CadEmpUser[]> {
    console.log('UserService.getUsers: Retornando dados MOCK');
    return [...MOCK_USERS]; // Retorna uma cópia da lista de usuários mock
  }

  /**
   * Obtém um usuário pelo ID
   */
  async getUserById(id: string | number): Promise<CadEmpUser> {
    console.log(`UserService.getUserById: Buscando usuário com ID ${id} (MOCK)`);
    const user = MOCK_USERS.find(u => u.id === id);
    
    if (!user) {
      throw new Error(`Usuário com ID ${id} não encontrado`);
    }
    
    return { ...user };
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<CadEmpUser | null> {
    console.log('UserService.getCurrentUser: Retornando usuário atual MOCK');
    return { ...MOCK_USERS[0] }; // Retorna o primeiro usuário como se fosse o atual
  }

  /**
   * Cria um novo usuário
   */
  async createUser(params: CreateUserParams): Promise<CadEmpUser | null> {
    console.log('UserService.createUser: Criando usuário MOCK', params);
    
    // Simular validação de email duplicado
    if (MOCK_USERS.some(u => u.email === params.email)) {
      throw new Error('Já existe um usuário cadastrado com este email.');
    }
    
    // Criar novo usuário mock
    const newUser: CadEmpUser = {
      id: `user-${Date.now()}`,
      nome: params.nome,
      email: params.email,
      empresa: params.empresa,
      perfil: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { ...newUser };
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string | number, params: UpdateUserParams): Promise<CadEmpUser> {
    console.log(`UserService.updateUser: Atualizando usuário ${id} (MOCK)`, params);
    
    const user = MOCK_USERS.find(u => u.id === id);
    if (!user) {
      throw new Error(`Usuário com ID ${id} não encontrado`);
    }
    
    // Criar um objeto atualizado
    const updatedUser: CadEmpUser = {
      ...user,
      nome: params.nome || user.nome,
      empresa: params.empresa || user.empresa,
      updated_at: new Date().toISOString()
    };
    
    return { ...updatedUser };
  }

  /**
   * Exclui um usuário
   */
  async deleteUser(id: string | number): Promise<void> {
    console.log(`UserService.deleteUser: Excluindo usuário ${id} (MOCK)`);
    
    const user = MOCK_USERS.find(u => u.id === id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Não faz nada, apenas simula uma exclusão bem-sucedida
  }
}
