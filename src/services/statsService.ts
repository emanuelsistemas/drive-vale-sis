import { supabase } from './supabase';

/**
 * Serviço para gerenciar estatísticas e logs de acesso aos arquivos
 */

// Tipos para tabela de logs de acesso
export interface FileAccessLog {
  id?: number;
  file_id: number;
  user_id: string;
  empresa_id?: number;
  action_type: 'view' | 'download' | 'edit' | 'share' | 'delete';
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

// Tipos para estatísticas de arquivo
export interface FileStats {
  file_id: number;
  views: number;
  downloads: number;
  shares: number;
  last_accessed?: string;
}

// CRUD para logs de acesso
export const accessLogCrud = {
  // Registrar um novo acesso
  async create(data: FileAccessLog) {
    try {
      const { data: result, error } = await supabase
        .from('file_access_logs')
        .insert([data])
        .select();
      
      if (error) {
        console.error('Erro ao registrar acesso:', error);
        throw error;
      }
      
      // Atualizar estatísticas do arquivo
      await updateFileStats(data.file_id, data.action_type);
      
      return result?.[0];
    } catch (error) {
      console.error('Erro ao registrar acesso:', error);
      throw error;
    }
  },
  
  // Obter logs de acesso de um arquivo
  async getByFileId(fileId: number) {
    try {
      const { data, error } = await supabase
        .from('file_access_logs')
        .select(`
          *,
          user:user_id(dv_nome, dv_email)
        `)
        .eq('file_id', fileId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar logs de acesso do arquivo ${fileId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar logs de acesso do arquivo ${fileId}:`, error);
      throw error;
    }
  },
  
  // Obter logs de acesso de um usuário
  async getByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('file_access_logs')
        .select(`
          *,
          file:file_id(name, path)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar logs de acesso do usuário ${userId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar logs de acesso do usuário ${userId}:`, error);
      throw error;
    }
  },
  
  // Obter logs de acesso de uma empresa
  async getByEmpresaId(empresaId: number) {
    try {
      const { data, error } = await supabase
        .from('file_access_logs')
        .select(`
          *,
          file:file_id(name, path),
          user:user_id(dv_nome, dv_email)
        `)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar logs de acesso da empresa ${empresaId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar logs de acesso da empresa ${empresaId}:`, error);
      throw error;
    }
  }
};

// Funções para estatísticas de arquivo
export const fileStatsCrud = {
  // Obter estatísticas de um arquivo
  async getByFileId(fileId: number) {
    try {
      const { data, error } = await supabase
        .from('file_stats')
        .select('*')
        .eq('file_id', fileId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Nenhum resultado encontrado
          return {
            file_id: fileId,
            views: 0,
            downloads: 0,
            shares: 0
          };
        }
        
        console.error(`Erro ao buscar estatísticas do arquivo ${fileId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas do arquivo ${fileId}:`, error);
      throw error;
    }
  },
  
  // Obter arquivos mais acessados
  async getMostAccessed(limit = 10, userId?: string, empresaId?: number) {
    try {
      let query = supabase
        .from('file_stats')
        .select(`
          *,
          file:file_id(*)
        `)
        .order('views', { ascending: false })
        .limit(limit);
      
      if (userId || empresaId) {
        query = query.or(`file.user_id.eq.${userId},file.empresa_id.eq.${empresaId}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar arquivos mais acessados:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar arquivos mais acessados:', error);
      throw error;
    }
  },
  
  // Obter arquivos mais baixados
  async getMostDownloaded(limit = 10, userId?: string, empresaId?: number) {
    try {
      let query = supabase
        .from('file_stats')
        .select(`
          *,
          file:file_id(*)
        `)
        .order('downloads', { ascending: false })
        .limit(limit);
      
      if (userId || empresaId) {
        query = query.or(`file.user_id.eq.${userId},file.empresa_id.eq.${empresaId}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar arquivos mais baixados:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar arquivos mais baixados:', error);
      throw error;
    }
  }
};

// Função auxiliar para atualizar estatísticas de arquivo
async function updateFileStats(fileId: number, actionType: string) {
  try {
    // Verificar se já existem estatísticas para o arquivo
    const { data, error } = await supabase
      .from('file_stats')
      .select('*')
      .eq('file_id', fileId);
    
    if (error) {
      console.error(`Erro ao verificar estatísticas do arquivo ${fileId}:`, error);
      throw error;
    }
    
    // Se não existem estatísticas, criar um novo registro
    if (!data || data.length === 0) {
      const newStats: any = {
        file_id: fileId,
        views: 0,
        downloads: 0,
        shares: 0,
        last_accessed: new Date().toISOString()
      };
      
      // Incrementar o contador apropriado
      if (actionType === 'view') newStats.views = 1;
      else if (actionType === 'download') newStats.downloads = 1;
      else if (actionType === 'share') newStats.shares = 1;
      
      const { error: insertError } = await supabase
        .from('file_stats')
        .insert([newStats]);
      
      if (insertError) {
        console.error(`Erro ao criar estatísticas do arquivo ${fileId}:`, insertError);
        throw insertError;
      }
      
      return;
    }
    
    // Se já existem estatísticas, atualizar o registro
    const updateData: any = {
      last_accessed: new Date().toISOString()
    };
    
    // Incrementar o contador apropriado
    if (actionType === 'view') {
      updateData.views = data[0].views + 1;
    } else if (actionType === 'download') {
      updateData.downloads = data[0].downloads + 1;
    } else if (actionType === 'share') {
      updateData.shares = data[0].shares + 1;
    }
    
    const { error: updateError } = await supabase
      .from('file_stats')
      .update(updateData)
      .eq('file_id', fileId);
    
    if (updateError) {
      console.error(`Erro ao atualizar estatísticas do arquivo ${fileId}:`, updateError);
      throw updateError;
    }
  } catch (error) {
    console.error(`Erro ao atualizar estatísticas do arquivo ${fileId}:`, error);
    throw error;
  }
}

// Função para registrar acesso a um arquivo
export const logFileAccess = async (
  fileId: number,
  userId: string,
  actionType: 'view' | 'download' | 'edit' | 'share' | 'delete',
  empresaId?: number,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    return await accessLogCrud.create({
      file_id: fileId,
      user_id: userId,
      action_type: actionType,
      empresa_id: empresaId,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    console.error(`Erro ao registrar acesso ao arquivo ${fileId}:`, error);
    // Não lançar erro para não interromper o fluxo principal
  }
};

// Função para criar tabelas de estatísticas no Supabase
export const createStatsTables = async () => {
  try {
    // Verificar se a tabela de logs de acesso existe
    const { error: checkLogsError } = await supabase.rpc('exec', { 
      query: `SELECT to_regclass('public.file_access_logs');` 
    });
    
    if (checkLogsError) {
      console.log('Criando tabela de logs de acesso...');
      
      // Criar a tabela file_access_logs
      const createLogsQuery = `
        CREATE TABLE IF NOT EXISTS file_access_logs (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL,
          empresa_id BIGINT REFERENCES dv_cad_empresas_drive(id),
          action_type TEXT CHECK (action_type IN ('view', 'download', 'edit', 'share', 'delete')) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ip_address TEXT,
          user_agent TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);
        CREATE INDEX IF NOT EXISTS idx_file_access_logs_user_id ON file_access_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_file_access_logs_empresa_id ON file_access_logs(empresa_id);
        CREATE INDEX IF NOT EXISTS idx_file_access_logs_action_type ON file_access_logs(action_type);
        CREATE INDEX IF NOT EXISTS idx_file_access_logs_created_at ON file_access_logs(created_at);
      `;
      
      const { error: createLogsError } = await supabase.rpc('exec', { 
        query: createLogsQuery 
      });
      
      if (createLogsError) {
        console.error('Erro ao criar tabela de logs de acesso:', createLogsError);
        throw createLogsError;
      }
    }
    
    // Verificar se a tabela de estatísticas existe
    const { error: checkStatsError } = await supabase.rpc('exec', { 
      query: `SELECT to_regclass('public.file_stats');` 
    });
    
    if (checkStatsError) {
      console.log('Criando tabela de estatísticas de arquivo...');
      
      // Criar a tabela file_stats
      const createStatsQuery = `
        CREATE TABLE IF NOT EXISTS file_stats (
          file_id BIGINT PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
          views BIGINT DEFAULT 0,
          downloads BIGINT DEFAULT 0,
          shares BIGINT DEFAULT 0,
          last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_file_stats_views ON file_stats(views);
        CREATE INDEX IF NOT EXISTS idx_file_stats_downloads ON file_stats(downloads);
        CREATE INDEX IF NOT EXISTS idx_file_stats_last_accessed ON file_stats(last_accessed);
      `;
      
      const { error: createStatsError } = await supabase.rpc('exec', { 
        query: createStatsQuery 
      });
      
      if (createStatsError) {
        console.error('Erro ao criar tabela de estatísticas de arquivo:', createStatsError);
        throw createStatsError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar tabelas de estatísticas:', error);
    return { success: false, error };
  }
};
