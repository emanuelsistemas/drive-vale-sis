import { supabase } from './supabase';

/**
 * Serviço para gerenciar permissões de acesso a arquivos (VERSÃO MOCK)
 */

// Tipos para tabela de permissões
export interface FilePermission {
  id?: number;
  file_id: number;
  user_id?: number;
  empresa_id?: number;
  permission_type: 'read' | 'write' | 'admin';
  created_at?: string;
  created_by: number;
}

// Dados mock para permissões
const mockPermissions: FilePermission[] = [
  {
    id: 1,
    file_id: 1,
    user_id: 1,
    permission_type: 'admin',
    created_at: new Date().toISOString(),
    created_by: 1
  },
  {
    id: 2,
    file_id: 1,
    user_id: 2,
    permission_type: 'read',
    created_at: new Date().toISOString(),
    created_by: 1
  },
  {
    id: 3,
    file_id: 2,
    empresa_id: 1,
    permission_type: 'write',
    created_at: new Date().toISOString(),
    created_by: 1
  }
];

// CRUD para permissões de arquivo (VERSÃO MOCK)
export const filePermissionCrud = {
  // Criar uma nova permissão
  async create(data: FilePermission) {
    try {
      console.log('Mock: Criando permissão de arquivo', data);
      
      // Simular criação de permissão
      const newPermission: FilePermission = {
        ...data,
        id: mockPermissions.length + 1,
        created_at: new Date().toISOString()
      };
      
      // Adicionar à lista de permissões mock
      mockPermissions.push(newPermission);
      
      return newPermission;
    } catch (error) {
      console.error('Erro ao criar permissão (mock):', error);
      throw error;
    }
  },
  
  // Obter todas as permissões de um arquivo
  async getByFileId(fileId: number) {
    try {
      console.log(`Mock: Buscando permissões do arquivo ${fileId}`);
      
      // Filtrar permissões pelo ID do arquivo
      const permissions = mockPermissions.filter(p => p.file_id === fileId);
      
      // Simular dados relacionados para cada permissão
      return permissions.map(p => ({
        ...p,
        user: p.user_id ? { id: p.user_id, dv_nome: `User ${p.user_id}`, dv_email: `user${p.user_id}@example.com` } : null,
        empresa: p.empresa_id ? { id: p.empresa_id, dv_nome: `Empresa ${p.empresa_id}` } : null
      }));
    } catch (error) {
      console.error(`Erro ao buscar permissões do arquivo ${fileId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter permissões de um usuário
  async getByUserId(userId: number) {
    try {
      console.log(`Mock: Buscando permissões do usuário ${userId}`);
      
      // Filtrar permissões pelo ID do usuário
      const permissions = mockPermissions.filter(p => p.user_id === userId);
      
      // Simular dados de arquivo para cada permissão
      return permissions.map(p => ({
        ...p,
        file: {
          id: p.file_id,
          name: `File ${p.file_id}`,
          type: 'document',
          size: 1024 * (p.file_id + 1),
          is_public: false,
          created_at: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error(`Erro ao buscar permissões do usuário ${userId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter permissões de uma empresa
  async getByEmpresaId(empresaId: number) {
    try {
      console.log(`Mock: Buscando permissões da empresa ${empresaId}`);
      
      // Filtrar permissões pelo ID da empresa
      const permissions = mockPermissions.filter(p => p.empresa_id === empresaId);
      
      // Simular dados de arquivo para cada permissão
      return permissions.map(p => ({
        ...p,
        file: {
          id: p.file_id,
          name: `File ${p.file_id}`,
          type: 'document',
          size: 1024 * (p.file_id + 1),
          is_public: false,
          created_at: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error(`Erro ao buscar permissões da empresa ${empresaId} (mock):`, error);
      throw error;
    }
  },
  
  // Atualizar uma permissão (MOCK)
  async update(id: number, data: Partial<FilePermission>) {
    try {
      console.log(`Mock: Atualizando permissão ${id}`, data);
      
      // Encontrar a permissão no mock
      const permissionIndex = mockPermissions.findIndex(p => p.id === id);
      
      if (permissionIndex === -1) {
        throw new Error(`Permissão com ID ${id} não encontrada`);
      }
      
      // Atualizar a permissão
      mockPermissions[permissionIndex] = {
        ...mockPermissions[permissionIndex],
        ...data
      };
      
      return mockPermissions[permissionIndex];
    } catch (error) {
      console.error(`Erro ao atualizar permissão ${id} (mock):`, error);
      throw error;
    }
  },
  
  // Excluir uma permissão (MOCK)
  async delete(id: number) {
    try {
      console.log(`Mock: Excluindo permissão ${id}`);
      
      // Encontrar o índice da permissão
      const permissionIndex = mockPermissions.findIndex(p => p.id === id);
      
      if (permissionIndex === -1) {
        throw new Error(`Permissão com ID ${id} não encontrada`);
      }
      
      // Remover a permissão
      mockPermissions.splice(permissionIndex, 1);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir permissão ${id} (mock):`, error);
      throw error;
    }
  },
  
  // Verificar se um usuário tem permissão para um arquivo (MOCK)
  async checkUserPermission(fileId: number, userId: number, requiredPermission: 'read' | 'write' | 'admin') {
    try {
      console.log(`Mock: Verificando permissão do usuário ${userId} para o arquivo ${fileId}`);
      
      // Simular que o arquivo é público se o ID for par
      const isPublic = fileId % 2 === 0;
      
      // Se o arquivo é público e a permissão é de leitura, permitir acesso
      if (isPublic && requiredPermission === 'read') {
        return true;
      }
      
      // Simular que o usuário 1 é dono de todos os arquivos
      if (userId === 1) {
        return true;
      }
      
      // Procurar permissões específicas do usuário
      const userPermission = mockPermissions.find(p => p.file_id === fileId && p.user_id === userId);
      
      if (userPermission) {
        return checkPermissionLevel(userPermission.permission_type, requiredPermission);
      }
      
      // Simular empresa do usuário (todos os usuários pertencem à empresa 1 exceto o usuário 1)
      const empresaId = userId === 1 ? null : 1;
      
      if (empresaId) {
        // Procurar permissões da empresa
        const empresaPermission = mockPermissions.find(p => p.file_id === fileId && p.empresa_id === empresaId);
        
        if (empresaPermission) {
          return checkPermissionLevel(empresaPermission.permission_type, requiredPermission);
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Erro ao verificar permissão do usuário ${userId} para o arquivo ${fileId} (mock):`, error);
      return false;
    }
  }
};

// Função auxiliar para verificar o nível de permissão
function checkPermissionLevel(userPermission: string, requiredPermission: string): boolean {
  const permissionLevels = {
    'read': 1,
    'write': 2,
    'admin': 3
  };
  
  return permissionLevels[userPermission as keyof typeof permissionLevels] >= 
         permissionLevels[requiredPermission as keyof typeof permissionLevels];
}

// Funções auxiliares para compartilhamento de arquivos
export const shareFileWithUser = async (fileId: number, userId: number, permissionType: 'read' | 'write' | 'admin', createdBy: number) => {
  return filePermissionCrud.create({
    file_id: fileId,
    user_id: userId,
    permission_type: permissionType,
    created_by: createdBy
  });
};

export const shareFileWithEmpresa = async (fileId: number, empresaId: number, permissionType: 'read' | 'write' | 'admin', createdBy: number) => {
  return filePermissionCrud.create({
    file_id: fileId,
    empresa_id: empresaId,
    permission_type: permissionType,
    created_by: createdBy
  });
};

export const removeFileAccess = async (permissionId: number) => {
  return filePermissionCrud.delete(permissionId);
};

// Função mock para criar tabela de permissões
export const createPermissionsTable = async () => {
  try {
    console.log('[MOCK] Criando tabela de permissões (simulação)');
    
    // Simulando uma operação bem-sucedida
    // Em um ambiente real, isso criaria a tabela no banco de dados
    
    console.log('[MOCK] Tabela de permissões criada com sucesso (simulação)');
    
    return { success: true };
  } catch (error) {
    console.error('[MOCK] Erro ao simular criação de tabela de permissões:', error);
    return { success: false, error };
  }
};
