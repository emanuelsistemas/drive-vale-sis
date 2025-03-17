import { supabase } from './supabase';

/**
 * Serviço para operações CRUD nas tabelas do Supabase
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

// CRUD para dv_restricao_user
export const restricaoUserCrud = {
  // Create
  async create(data: RestricaoUser) {
    const { data: result, error } = await supabase
      .from('dv_restricao_user')
      .insert([data])
      .select();
    
    if (error) {
      console.error('Erro ao criar restrição de usuário:', error);
      throw error;
    }
    
    return result?.[0];
  },
  
  // Read
  async getAll() {
    const { data, error } = await supabase
      .from('dv_restricao_user')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar restrições de usuário:', error);
      throw error;
    }
    
    return data;
  },
  
  async getById(id: number) {
    const { data, error } = await supabase
      .from('dv_restricao_user')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar restrição de usuário com ID ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async getByUsuarioId(usuarioId: number) {
    const { data, error } = await supabase
      .from('dv_restricao_user')
      .select('*')
      .eq('usuario_id', usuarioId);
    
    if (error) {
      console.error(`Erro ao buscar restrição de usuário com usuario_id ${usuarioId}:`, error);
      throw error;
    }
    
    return data;
  },
  
  // Update
  async update(id: number, data: Partial<RestricaoUser>) {
    const { data: result, error } = await supabase
      .from('dv_restricao_user')
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Erro ao atualizar restrição de usuário com ID ${id}:`, error);
      throw error;
    }
    
    return result?.[0];
  },
  
  // Delete
  async delete(id: number) {
    const { error } = await supabase
      .from('dv_restricao_user')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao excluir restrição de usuário com ID ${id}:`, error);
      throw error;
    }
    
    return true;
  }
};

// CRUD para dv_cad_empresas_drive
export const empresaDriveCrud = {
  // Create
  async create(data: EmpresaDrive) {
    const { data: result, error } = await supabase
      .from('dv_cad_empresas_drive')
      .insert([data])
      .select();
    
    if (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
    
    return result?.[0];
  },
  
  // Read
  async getAll() {
    const { data, error } = await supabase
      .from('dv_cad_empresas_drive')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }
    
    return data;
  },
  
  async getById(id: number) {
    const { data, error } = await supabase
      .from('dv_cad_empresas_drive')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar empresa com ID ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('dv_cad_empresas_drive')
      .select('*')
      .eq('dv_email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "nenhum resultado encontrado"
      console.error(`Erro ao buscar empresa com email ${email}:`, error);
      throw error;
    }
    
    return data;
  },
  
  // Update
  async update(id: number, data: Partial<EmpresaDrive>) {
    const { data: result, error } = await supabase
      .from('dv_cad_empresas_drive')
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Erro ao atualizar empresa com ID ${id}:`, error);
      throw error;
    }
    
    return result?.[0];
  },
  
  // Delete
  async delete(id: number) {
    const { error } = await supabase
      .from('dv_cad_empresas_drive')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao excluir empresa com ID ${id}:`, error);
      throw error;
    }
    
    return true;
  },
  
  // Consultas avançadas
  async getWithRestrictions() {
    const { data, error } = await supabase
      .from('dv_cad_empresas_drive')
      .select(`
        *,
        restricao:dv_tipo_restricao(*)
      `);
    
    if (error) {
      console.error('Erro ao buscar empresas com restrições:', error);
      throw error;
    }
    
    return data;
  }
};

// Função para criar um usuário completo (empresa + restrição)
export const createCompleteUser = async (
  nome: string,
  email: string,
  senha: string,
  tipoRestricao: 'admin' | 'user' = 'admin'
) => {
  try {
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
      // Remover a restrição criada para não deixar lixo no banco
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
    console.error('Erro ao criar usuário completo:', error);
    throw error;
  }
};

// Função para buscar um usuário completo por email
export const getCompleteUserByEmail = async (email: string) => {
  try {
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
    console.error('Erro ao buscar usuário completo:', error);
    throw error;
  }
};
