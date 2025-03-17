import { supabase } from './supabase';

/**
 * Serviço para gerenciar permissões de acesso a arquivos
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

// CRUD para permissões de arquivo
export const filePermissionCrud = {
  // Criar uma nova permissão
  async create(data: FilePermission) {
    try {
      const { data: result, error } = await supabase
        .from('file_permissions')
        .insert([data])
        .select();
      
      if (error) {
        console.error('Erro ao criar permissão:', error);
        throw error;
      }
      
      return result?.[0];
    } catch (error) {
      console.error('Erro ao criar permissão:', error);
      throw error;
    }
  },
  
  // Obter todas as permissões de um arquivo
  async getByFileId(fileId: number) {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select(`
          *,
          user:user_id(id, dv_nome, dv_email),
          empresa:empresa_id(id, dv_nome)
        `)
        .eq('file_id', fileId);
      
      if (error) {
        console.error(`Erro ao buscar permissões do arquivo ${fileId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar permissões do arquivo ${fileId}:`, error);
      throw error;
    }
  },
  
  // Obter permissões de um usuário
  async getByUserId(userId: number) {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select(`
          *,
          file:file_id(*)
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error(`Erro ao buscar permissões do usuário ${userId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar permissões do usuário ${userId}:`, error);
      throw error;
    }
  },
  
  // Obter permissões de uma empresa
  async getByEmpresaId(empresaId: number) {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select(`
          *,
          file:file_id(*)
        `)
        .eq('empresa_id', empresaId);
      
      if (error) {
        console.error(`Erro ao buscar permissões da empresa ${empresaId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar permissões da empresa ${empresaId}:`, error);
      throw error;
    }
  },
  
  // Atualizar uma permissão
  async update(id: number, data: Partial<FilePermission>) {
    try {
      const { data: result, error } = await supabase
        .from('file_permissions')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error(`Erro ao atualizar permissão ${id}:`, error);
        throw error;
      }
      
      return result?.[0];
    } catch (error) {
      console.error(`Erro ao atualizar permissão ${id}:`, error);
      throw error;
    }
  },
  
  // Excluir uma permissão
  async delete(id: number) {
    try {
      const { error } = await supabase
        .from('file_permissions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir permissão ${id}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir permissão ${id}:`, error);
      throw error;
    }
  },
  
  // Verificar se um usuário tem permissão para um arquivo
  async checkUserPermission(fileId: number, userId: number, requiredPermission: 'read' | 'write' | 'admin') {
    try {
      // Verificar se o arquivo é público
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('is_public, user_id')
        .eq('id', fileId)
        .single();
      
      if (fileError) {
        throw fileError;
      }
      
      // Se o arquivo é público ou o usuário é o proprietário, permitir acesso
      if (fileData.is_public && requiredPermission === 'read') {
        return true;
      }
      
      // Se o usuário é o proprietário, permitir acesso total
      if (fileData.user_id === userId) {
        return true;
      }
      
      // Verificar permissões específicas
      const { data, error } = await supabase
        .from('file_permissions')
        .select('permission_type')
        .eq('file_id', fileId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Se não há permissões, verificar permissões da empresa
      if (!data || data.length === 0) {
        // Obter a empresa do usuário
        const { data: userData, error: userError } = await supabase
          .from('dv_cad_empresas_drive')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        // Verificar permissões da empresa
        const { data: empresaPermissions, error: empresaError } = await supabase
          .from('file_permissions')
          .select('permission_type')
          .eq('file_id', fileId)
          .eq('empresa_id', userData.id);
        
        if (empresaError) {
          throw empresaError;
        }
        
        if (!empresaPermissions || empresaPermissions.length === 0) {
          return false;
        }
        
        // Verificar se a permissão da empresa é suficiente
        return checkPermissionLevel(empresaPermissions[0].permission_type, requiredPermission);
      }
      
      // Verificar se a permissão do usuário é suficiente
      return checkPermissionLevel(data[0].permission_type, requiredPermission);
    } catch (error) {
      console.error(`Erro ao verificar permissão do usuário ${userId} para o arquivo ${fileId}:`, error);
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

// Função para criar tabela de permissões no Supabase
export const createPermissionsTable = async () => {
  try {
    // Verificar se a tabela já existe
    const { error: checkError } = await supabase.rpc('exec', { 
      query: `SELECT to_regclass('public.file_permissions');` 
    });
    
    if (checkError) {
      console.error('Erro ao verificar tabela de permissões:', checkError);
    }
    
    // Criar a tabela file_permissions
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS file_permissions (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES dv_cad_empresas_drive(id),
        empresa_id BIGINT REFERENCES dv_cad_empresas_drive(id),
        permission_type TEXT CHECK (permission_type IN ('read', 'write', 'admin')) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by BIGINT REFERENCES dv_cad_empresas_drive(id) NOT NULL,
        CONSTRAINT check_target CHECK (
          (user_id IS NULL AND empresa_id IS NOT NULL) OR
          (user_id IS NOT NULL AND empresa_id IS NULL)
        )
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec', { 
      query: createTableQuery 
    });
    
    if (createError) {
      console.error('Erro ao criar tabela de permissões:', createError);
      throw createError;
    }
    
    // Criar índices para melhorar performance
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_file_permissions_file_id ON file_permissions(file_id);
      CREATE INDEX IF NOT EXISTS idx_file_permissions_user_id ON file_permissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_file_permissions_empresa_id ON file_permissions(empresa_id);
    `;
    
    const { error: indexError } = await supabase.rpc('exec', { 
      query: createIndexesQuery 
    });
    
    if (indexError) {
      console.error('Erro ao criar índices para tabela de permissões:', indexError);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar tabela de permissões:', error);
    return { success: false, error };
  }
};
