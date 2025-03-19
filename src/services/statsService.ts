/**
 * Serviço MOCK para gerenciar estatísticas e logs de acesso aos arquivos
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

// Dados mock para logs de acesso
const mockAccessLogs: FileAccessLog[] = [
  {
    id: 1,
    file_id: 1,
    user_id: '1',
    action_type: 'view',
    created_at: new Date().toISOString(),
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 2,
    file_id: 1,
    user_id: '2',
    action_type: 'download',
    created_at: new Date().toISOString(),
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 3,
    file_id: 2,
    user_id: '1',
    action_type: 'edit',
    created_at: new Date().toISOString(),
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
];

// Dados mock para estatísticas de arquivos
const mockFileStats: FileStats[] = [
  {
    file_id: 1,
    views: 10,
    downloads: 5,
    shares: 2,
    last_accessed: new Date().toISOString()
  },
  {
    file_id: 2,
    views: 7,
    downloads: 3,
    shares: 1,
    last_accessed: new Date().toISOString()
  }
];

// CRUD para logs de acesso (MOCK)
export const accessLogCrud = {
  // Registrar um novo acesso
  async create(data: FileAccessLog) {
    try {
      console.log(`Mock: Registrando acesso ao arquivo ${data.file_id} pelo usuário ${data.user_id}`, data);
      
      // Gerar ID único
      const newId = mockAccessLogs.length > 0 ? Math.max(...mockAccessLogs.map(log => log.id || 0)) + 1 : 1;
      
      // Adicionar data de criação
      const newLog = {
        ...data,
        id: newId,
        created_at: data.created_at || new Date().toISOString()
      };
      
      // Adicionar ao mock
      mockAccessLogs.push(newLog);
      
      // Atualizar estatísticas do arquivo
      await updateFileStats(data.file_id, data.action_type);
      
      return newLog;
    } catch (error) {
      console.error('Erro ao registrar acesso (mock):', error);
      throw error;
    }
  },
  
  // Obter logs de acesso de um arquivo
  async getByFileId(fileId: number) {
    try {
      console.log(`Mock: Obtendo logs de acesso do arquivo ${fileId}`);
      
      // Filtrar logs pelo arquivo
      const logs = mockAccessLogs.filter(log => log.file_id === fileId);
      
      // Ordenar por data de criação (mais recentes primeiro)
      logs.sort((a, b) => {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      
      return logs;
    } catch (error) {
      console.error(`Erro ao buscar logs de acesso do arquivo ${fileId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter logs de acesso de um usuário
  async getByUserId(userId: string) {
    try {
      console.log(`Mock: Obtendo logs de acesso do usuário ${userId}`);
      
      // Filtrar logs pelo usuário
      const logs = mockAccessLogs.filter(log => log.user_id === userId);
      
      // Ordenar por data de criação (mais recentes primeiro)
      logs.sort((a, b) => {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      
      return logs;
    } catch (error) {
      console.error(`Erro ao buscar logs de acesso do usuário ${userId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter logs de acesso de uma empresa (MOCK)
  async getByEmpresaId(empresaId: number) {
    try {
      console.log(`Mock: Obtendo logs de acesso da empresa ${empresaId}`);
      
      // Filtrar logs pela empresa
      const logs = mockAccessLogs.filter(log => log.empresa_id === empresaId);
      
      // Ordenar por data de criação (mais recentes primeiro)
      logs.sort((a, b) => {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      
      return logs;
    } catch (error) {
      console.error(`Erro ao buscar logs de acesso da empresa ${empresaId} (mock):`, error);
      throw error;
    }
  }
};

// Funções para estatísticas de arquivo (MOCK)
export const fileStatsCrud = {
  // Obter estatísticas de um arquivo
  async getByFileId(fileId: number) {
    try {
      console.log(`Mock: Obtendo estatísticas do arquivo ${fileId}`);
      
      // Buscar no mock ou criar novas estatísticas
      const stats = mockFileStats.find(s => s.file_id === fileId);
      
      if (!stats) {
        return {
          file_id: fileId,
          views: 0,
          downloads: 0,
          shares: 0
        };
      }
      
      return stats;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas do arquivo ${fileId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter arquivos mais acessados (MOCK)
  async getMostAccessed(limit = 10, userId?: string, empresaId?: number) {
    try {
      console.log(`Mock: Obtendo arquivos mais acessados (limit: ${limit}, userId: ${userId}, empresaId: ${empresaId})`);
      
      // Clonar as estatísticas para não modificar o original
      let stats = [...mockFileStats];
      
      // Filtrar por usuário ou empresa se necessário (mock simples)
      if (userId || empresaId) {
        stats = stats.filter(s => s.file_id % 2 === 0); // Simples, só para demonstração
      }
      
      // Ordenar por visualizações (mais visualizados primeiro)
      stats.sort((a, b) => b.views - a.views);
      
      // Limitar resultados
      stats = stats.slice(0, limit);
      
      return stats;
    } catch (error) {
      console.error('Erro ao buscar arquivos mais acessados (mock):', error);
      throw error;
    }
  },
  
  // Obter arquivos mais baixados (MOCK)
  async getMostDownloaded(limit = 10, userId?: string, empresaId?: number) {
    try {
      console.log(`Mock: Obtendo arquivos mais baixados (limit: ${limit}, userId: ${userId}, empresaId: ${empresaId})`);
      
      // Clonar as estatísticas para não modificar o original
      let stats = [...mockFileStats];
      
      // Filtrar por usuário ou empresa se necessário (mock simples)
      if (userId || empresaId) {
        stats = stats.filter(s => s.file_id % 2 === 0); // Simples, só para demonstração
      }
      
      // Ordenar por downloads (mais baixados primeiro)
      stats.sort((a, b) => b.downloads - a.downloads);
      
      // Limitar resultados
      stats = stats.slice(0, limit);
      
      return stats;
    } catch (error) {
      console.error('Erro ao buscar arquivos mais baixados (mock):', error);
      throw error;
    }
  }
};

// Função auxiliar para atualizar estatísticas de arquivo (MOCK)
async function updateFileStats(fileId: number, actionType: string) {
  try {
    console.log(`Mock: Atualizando estatísticas do arquivo ${fileId} para ação ${actionType}`);
    
    // Buscar no mock
    const statIndex = mockFileStats.findIndex(s => s.file_id === fileId);
    
    // Se não existem estatísticas, criar um novo registro
    if (statIndex === -1) {
      const newStats: FileStats = {
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
      
      // Adicionar ao mock
      mockFileStats.push(newStats);
      
      return;
    }
    
    // Se já existem estatísticas, atualizar o registro
    const updateData = {
      ...mockFileStats[statIndex],
      last_accessed: new Date().toISOString()
    };
    
    // Incrementar o contador apropriado
    if (actionType === 'view') {
      updateData.views += 1;
    } else if (actionType === 'download') {
      updateData.downloads += 1;
    } else if (actionType === 'share') {
      updateData.shares += 1;
    }
    
    // Atualizar no mock
    mockFileStats[statIndex] = updateData;
  } catch (error) {
    console.error(`Erro ao atualizar estatísticas do arquivo ${fileId} (mock):`, error);
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

// Função para criar tabelas de estatísticas (MOCK)
export const createStatsTables = async () => {
  try {
    console.log('[MOCK] Simulação de criação de tabelas de estatísticas');
    
    // Como esta é uma implementação mock, vamos apenas simular que a criação foi bem-sucedida
    console.log('[MOCK] Tabelas simuladas criadas com sucesso');
    
    return { success: true };
  } catch (error) {
    console.error('[MOCK] Erro ao simular tabelas de estatísticas:', error);
    return { success: false, error };
  }
};
