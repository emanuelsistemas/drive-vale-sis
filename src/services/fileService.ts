import { FileObject } from '../types/supabase';

// Tipos para tabela de arquivos
export interface FileRecord {
  id?: number;
  name: string;
  size: number;
  type: string;
  path: string;
  user_id: string | number;
  empresa_id?: number;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  description?: string;
  tags?: string[];
}

// Mock de dados de arquivos
const mockFiles: FileRecord[] = [
  {
    id: 1,
    name: 'Documento 1.pdf',
    size: 1024 * 1024 * 2, // 2MB
    type: 'application/pdf',
    path: '1/doc1.pdf',
    user_id: '1',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'Documento importante',
    tags: ['importante', 'documento']
  },
  {
    id: 2,
    name: 'Imagem.jpg',
    size: 1024 * 512, // 512KB
    type: 'image/jpeg',
    path: '1/img1.jpg',
    user_id: '1',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'Imagem de teste',
    tags: ['imagem', 'teste']
  },
  {
    id: 3,
    name: 'Planilha.xlsx',
    size: 1024 * 256, // 256KB
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    path: '2/planilha.xlsx',
    user_id: '2',
    empresa_id: 1,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'Planilha de dados',
    tags: ['dados', 'planilha']
  }
];

// Função para fazer upload de arquivo (MOCK)
export const uploadFile = async (file: File, userId: string, empresaId?: number, description?: string, tags?: string[]) => {
  try {
    console.log(`Mock: Fazendo upload do arquivo ${file.name} para usuário ${userId}`);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Simular registro do arquivo
    const newFile: FileRecord = {
      id: mockFiles.length + 1,
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      user_id: userId,
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Adicionar campos opcionais se fornecidos
    if (empresaId) newFile.empresa_id = empresaId;
    if (description) newFile.description = description;
    if (tags) newFile.tags = tags;

    // Adicionar ao mock
    mockFiles.push(newFile);

    return newFile;
  } catch (error) {
    console.error('Erro ao fazer upload (mock):', error);
    throw error;
  }
};

// Função para listar arquivos do usuário (MOCK)
export const listFiles = async (userId: string, empresaId?: number) => {
  try {
    console.log(`Mock: Listando arquivos do usuário ${userId}${empresaId ? ` da empresa ${empresaId}` : ''}`);
    
    // Filtrar arquivos pelo ID do usuário
    let files = mockFiles.filter(file => file.user_id.toString() === userId.toString());
    
    // Se fornecido um ID de empresa, filtrar também
    if (empresaId) {
      files = files.filter(file => file.empresa_id === empresaId);
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    files.sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

    return files;
  } catch (error) {
    console.error('Erro ao listar arquivos (mock):', error);
    throw error;
  }
};

// Função para buscar arquivos por tags ou descrição (MOCK)
export const searchFiles = async (userId: string, searchTerm: string, empresaId?: number) => {
  try {
    console.log(`Mock: Buscando arquivos para usuário ${userId} com termo "${searchTerm}"`);
    
    // Filtrar pelo ID do usuário
    let files = mockFiles.filter(file => file.user_id.toString() === userId.toString());
    
    // Se fornecido um ID de empresa, filtrar também
    if (empresaId) {
      files = files.filter(file => file.empresa_id === empresaId);
    }
    
    // Filtrar por nome, descrição ou tags
    files = files.filter(file => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = file.name.toLowerCase().includes(searchTermLower);
      const descMatch = file.description?.toLowerCase().includes(searchTermLower) || false;
      const tagMatch = file.tags?.some(tag => tag.toLowerCase().includes(searchTermLower)) || false;
      
      return nameMatch || descMatch || tagMatch;
    });
    
    // Ordenar por data de criação (mais recentes primeiro)
    files.sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

    return files;
  } catch (error) {
    console.error('Erro ao buscar arquivos (mock):', error);
    throw error;
  }
};

// Função para obter um arquivo pelo ID (MOCK)
export const getFileById = async (fileId: string) => {
  try {
    console.log(`Mock: Obtendo arquivo com ID ${fileId}`);
    
    // Encontrar o arquivo pelo ID
    const file = mockFiles.find(file => file.id === parseInt(fileId));
    
    if (!file) {
      throw new Error(`Arquivo com ID ${fileId} não encontrado`);
    }

    return file;
  } catch (error) {
    console.error('Erro ao obter arquivo (mock):', error);
    throw error;
  }
};

// Função para obter URL de download (MOCK)
export const getFileUrl = async (filePath: string) => {
  try {
    console.log(`Mock: Gerando URL para o arquivo ${filePath}`);
    
    // Simular uma URL assinada
    return `https://example.com/mock-files/${filePath}?signature=mockSignature123`;
  } catch (error) {
    console.error('Erro ao obter URL do arquivo (mock):', error);
    throw error;
  }
};

// Função para atualizar informações do arquivo (MOCK)
export const updateFile = async (fileId: string, updates: Partial<FileRecord>) => {
  try {
    console.log(`Mock: Atualizando arquivo com ID ${fileId}`, updates);
    
    // Não permitir atualização de campos críticos
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.path;
    delete safeUpdates.user_id;
    delete safeUpdates.created_at;
    
    // Encontrar o arquivo pelo ID
    const fileIndex = mockFiles.findIndex(file => file.id === parseInt(fileId));
    
    if (fileIndex === -1) {
      throw new Error(`Arquivo com ID ${fileId} não encontrado`);
    }
    
    // Atualizar o arquivo
    mockFiles[fileIndex] = {
      ...mockFiles[fileIndex],
      ...safeUpdates,
      updated_at: new Date().toISOString()
    };

    return mockFiles[fileIndex];
  } catch (error) {
    console.error('Erro ao atualizar arquivo (mock):', error);
    throw error;
  }
};

// Função para excluir arquivo (MOCK)
export const deleteFile = async (fileId: string, filePath: string) => {
  try {
    console.log(`Mock: Excluindo arquivo com ID ${fileId} e caminho ${filePath}`);
    
    // Encontrar o índice do arquivo
    const fileIndex = mockFiles.findIndex(file => file.id === parseInt(fileId));
    
    if (fileIndex === -1) {
      throw new Error(`Arquivo com ID ${fileId} não encontrado`);
    }
    
    // Remover o arquivo do mock
    mockFiles.splice(fileIndex, 1);

    return true;
  } catch (error) {
    console.error('Erro ao excluir arquivo (mock):', error);
    throw error;
  }
};

// Função para compartilhar um arquivo (tornar público ou privado) (MOCK)
export const toggleFileVisibility = async (fileId: string, isPublic: boolean) => {
  try {
    console.log(`Mock: Alterando visibilidade do arquivo ${fileId} para ${isPublic ? 'público' : 'privado'}`);
    
    // Encontrar o arquivo pelo ID
    const fileIndex = mockFiles.findIndex(file => file.id === parseInt(fileId));
    
    if (fileIndex === -1) {
      throw new Error(`Arquivo com ID ${fileId} não encontrado`);
    }
    
    // Atualizar visibilidade
    mockFiles[fileIndex] = {
      ...mockFiles[fileIndex],
      is_public: isPublic,
      updated_at: new Date().toISOString()
    };
    
    return mockFiles[fileIndex];
  } catch (error) {
    console.error('Erro ao alterar visibilidade do arquivo (mock):', error);
    throw error;
  }
};

// Função para obter arquivos públicos (MOCK)
export const getPublicFiles = async () => {
  try {
    console.log('Mock: Obtendo arquivos públicos');
    
    // Filtrar arquivos públicos
    const publicFiles = mockFiles.filter(file => file.is_public === true);
    
    // Ordenar por data de criação (mais recentes primeiro)
    publicFiles.sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
    
    return publicFiles;
  } catch (error) {
    console.error('Erro ao obter arquivos públicos (mock):', error);
    throw error;
  }
};

// Função para obter arquivos por empresa (MOCK)
export const getFilesByEmpresa = async (empresaId: number) => {
  try {
    console.log(`Mock: Obtendo arquivos da empresa ${empresaId}`);
    
    // Filtrar arquivos da empresa
    const empresaFiles = mockFiles.filter(file => file.empresa_id === empresaId);
    
    // Ordenar por data de criação (mais recentes primeiro)
    empresaFiles.sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

    return empresaFiles;
  } catch (error) {
    console.error('Erro ao obter arquivos da empresa (mock):', error);
    throw error;
  }
};
