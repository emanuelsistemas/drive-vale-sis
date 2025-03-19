/**
 * Serviço MOCK para operações CRUD nas tabelas
 */

// Tipos para as tabelas
export interface RestricaoUser {
  id?: number;
  dv_tipo_restricao: 'admin' | 'user';
  usuario_id?: number;
}

export interface EmpresaDrive {
  id?: number;
  dv_nome: string;
  dv_email: string;
  dv_senha: string;
  dv_tipo_restricao: number;
}

// Dados mock para restrições de usuários
const mockRestricoes: RestricaoUser[] = [
  { id: 1, dv_tipo_restricao: 'admin', usuario_id: 1 },
  { id: 2, dv_tipo_restricao: 'user', usuario_id: 2 },
  { id: 3, dv_tipo_restricao: 'user', usuario_id: 3 }
];

// Dados mock para empresas
const mockEmpresas: EmpresaDrive[] = [
  { id: 1, dv_nome: 'Admin', dv_email: 'admin@example.com', dv_senha: 'senha123', dv_tipo_restricao: 1 },
  { id: 2, dv_nome: 'Empresa A', dv_email: 'empresa.a@example.com', dv_senha: 'senha123', dv_tipo_restricao: 2 },
  { id: 3, dv_nome: 'Empresa B', dv_email: 'empresa.b@example.com', dv_senha: 'senha123', dv_tipo_restricao: 2 }
];

// CRUD para dv_restricao_user (MOCK)
export const restricaoUserCrud = {
  // Create
  async create(data: RestricaoUser) {
    console.log('Mock: Criando restrição de usuário', data);
    
    // Gerar ID único
    const newId = mockRestricoes.length > 0 ? Math.max(...mockRestricoes.map(r => r.id || 0)) + 1 : 1;
    
    // Criar nova restrição com ID
    const newRestricao = { ...data, id: newId };
    
    // Adicionar ao mock
    mockRestricoes.push(newRestricao);
    
    return newRestricao;
  },
  
  // Read
  async getAll() {
    console.log('Mock: Obtendo todas as restrições de usuários');
    return [...mockRestricoes];
  },
  
  async getById(id: number) {
    console.log(`Mock: Obtendo restrição de usuário com ID ${id}`);
    
    const restricao = mockRestricoes.find(r => r.id === id);
    
    if (!restricao) {
      throw new Error(`Restrição com ID ${id} não encontrada`);
    }
    
    return restricao;
  },
  
  async getByUsuarioId(usuarioId: number) {
    console.log(`Mock: Obtendo restrições de usuário com usuario_id ${usuarioId}`);
    
    const restricoes = mockRestricoes.filter(r => r.usuario_id === usuarioId);
    
    return restricoes;
  },
  
  // Update
  async update(id: number, data: Partial<RestricaoUser>) {
    console.log(`Mock: Atualizando restrição de usuário com ID ${id}`, data);
    
    const index = mockRestricoes.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error(`Restrição com ID ${id} não encontrada`);
    }
    
    // Atualizar restrição
    mockRestricoes[index] = { ...mockRestricoes[index], ...data };
    
    return mockRestricoes[index];
  },
  
  // Delete
  async delete(id: number) {
    console.log(`Mock: Excluindo restrição de usuário com ID ${id}`);
    
    const index = mockRestricoes.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error(`Restrição com ID ${id} não encontrada`);
    }
    
    // Remover restrição
    mockRestricoes.splice(index, 1);
    
    return true;
  }
};

// CRUD para dv_cad_empresas_drive (MOCK)
export const empresaDriveCrud = {
  // Create
  async create(data: EmpresaDrive) {
    console.log('Mock: Criando empresa', data);
    
    // Gerar ID único
    const newId = mockEmpresas.length > 0 ? Math.max(...mockEmpresas.map(r => r.id || 0)) + 1 : 1;
    
    // Criar nova empresa com ID
    const newEmpresa = { ...data, id: newId };
    
    // Adicionar ao mock
    mockEmpresas.push(newEmpresa);
    
    return newEmpresa;
  },
  
  // Read
  async getAll() {
    console.log('Mock: Obtendo todas as empresas');
    return [...mockEmpresas];
  },
  
  async getById(id: number) {
    console.log(`Mock: Obtendo empresa com ID ${id}`);
    
    const empresa = mockEmpresas.find(e => e.id === id);
    
    if (!empresa) {
      throw new Error(`Empresa com ID ${id} não encontrada`);
    }
    
    return empresa;
  },
  
  async getByEmail(email: string) {
    console.log(`Mock: Obtendo empresa com email ${email}`);
    
    const empresa = mockEmpresas.find(e => e.dv_email === email);
    
    return empresa || null;
  },
  
  // Update
  async update(id: number, data: Partial<EmpresaDrive>) {
    console.log(`Mock: Atualizando empresa com ID ${id}`, data);
    
    const index = mockEmpresas.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`Empresa com ID ${id} não encontrada`);
    }
    
    // Atualizar empresa
    mockEmpresas[index] = { ...mockEmpresas[index], ...data };
    
    return mockEmpresas[index];
  },
  
  // Delete
  async delete(id: number) {
    console.log(`Mock: Excluindo empresa com ID ${id}`);
    
    const index = mockEmpresas.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`Empresa com ID ${id} não encontrada`);
    }
    
    // Remover empresa
    mockEmpresas.splice(index, 1);
    
    return true;
  },
  
  // Consultas avançadas (MOCK)
  async getWithRestrictions() {
    console.log('Mock: Obtendo empresas com restrições');
    
    // Mapear empresas com suas restrições
    const empresasComRestricoes = mockEmpresas.map(empresa => {
      const restricao = mockRestricoes.find(r => r.id === empresa.dv_tipo_restricao);
      
      return {
        ...empresa,
        restricao: restricao || null
      };
    });
    
    return empresasComRestricoes;
  }
};

// Função para criar um usuário completo (empresa + restrição) (MOCK)
export const createCompleteUser = async (
  nome: string,
  email: string,
  senha: string,
  tipoRestricao: 'admin' | 'user' = 'admin'
) => {
  try {
    console.log(`Mock: Criando usuário completo - ${nome}, ${email}, ${tipoRestricao}`);
    
    // 1. Criar restrição
    const restricao = await restricaoUserCrud.create({
      dv_tipo_restricao: tipoRestricao
    });
    
    if (!restricao || !restricao.id) {
      throw new Error('Falha ao criar restrição de usuário');
    }
    
    // 2. Criar empresa
    const empresa = await empresaDriveCrud.create({
      dv_nome: nome,
      dv_email: email,
      dv_senha: senha,
      dv_tipo_restricao: restricao.id
    });
    
    if (!empresa || !empresa.id) {
      // Remover a restrição criada para não deixar lixo no mock
      await restricaoUserCrud.delete(restricao.id);
      throw new Error('Falha ao criar empresa');
    }
    
    // 3. Atualizar a restrição com o ID da empresa
    await restricaoUserCrud.update(restricao.id, {
      usuario_id: empresa.id
    });
    
    return {
      empresa,
      restricao: {
        ...restricao,
        usuario_id: empresa.id
      }
    };
  } catch (error) {
    console.error('Erro ao criar usuário completo (mock):', error);
    throw error;
  }
};

// Função para buscar um usuário completo por email (MOCK)
export const getCompleteUserByEmail = async (email: string) => {
  try {
    console.log(`Mock: Buscando usuário completo por email ${email}`);
    
    // 1. Buscar empresa pelo email
    const empresa = await empresaDriveCrud.getByEmail(email);
    
    if (!empresa) {
      return null;
    }
    
    // 2. Buscar restrição pelo ID da empresa
    const restricoes = await restricaoUserCrud.getByUsuarioId(empresa.id!);
    
    return {
      empresa,
      restricao: restricoes?.[0] || null
    };
  } catch (error) {
    console.error('Erro ao buscar usuário completo (mock):', error);
    throw error;
  }
};
