/**
 * Serviço MOCK para gerenciar categorias e tags de arquivos
 */

// Tipos para tabela de categorias
export interface FileCategory {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  empresa_id?: number;
  user_id: string;
  parent_id?: number;
  created_at?: string;
}

// Tipos para tabela de relação arquivo-categoria
export interface FileCategoryRelation {
  id?: number;
  file_id: number;
  category_id: number;
  created_at?: string;
  created_by: string;
}

// Dados mock para categorias
const mockCategories: FileCategory[] = [
  {
    id: 1,
    name: 'Documentos',
    description: 'Documentos importantes',
    color: '#4285F4',
    icon: 'folder',
    user_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Contratos',
    description: 'Contratos ativos',
    color: '#34A853',
    icon: 'description',
    user_id: '1',
    parent_id: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Fotos',
    description: 'Imagens e fotografias',
    color: '#FBBC05',
    icon: 'image',
    user_id: '2',
    created_at: new Date().toISOString()
  }
];

// Dados mock para relações arquivo-categoria
const mockRelations: FileCategoryRelation[] = [
  {
    id: 1,
    file_id: 1,
    category_id: 1,
    created_at: new Date().toISOString(),
    created_by: '1'
  },
  {
    id: 2,
    file_id: 2,
    category_id: 2,
    created_at: new Date().toISOString(),
    created_by: '1'
  },
  {
    id: 3,
    file_id: 1,
    category_id: 3,
    created_at: new Date().toISOString(),
    created_by: '2'
  }
];

// CRUD para categorias (MOCK)
export const categoryCrud = {
  // Criar uma nova categoria
  async create(data: FileCategory) {
    try {
      console.log('Mock: Criando categoria', data);
      
      // Gerar ID único
      const newId = mockCategories.length > 0 ? Math.max(...mockCategories.map(cat => cat.id || 0)) + 1 : 1;
      
      // Adicionar data de criação
      const newCategory = {
        ...data,
        id: newId,
        created_at: data.created_at || new Date().toISOString()
      };
      
      // Adicionar ao mock
      mockCategories.push(newCategory);
      
      return newCategory;
    } catch (error) {
      console.error('Erro ao criar categoria (mock):', error);
      throw error;
    }
  },
  
  // Obter todas as categorias de um usuário (MOCK)
  async getByUserId(userId: string) {
    try {
      console.log(`Mock: Obtendo categorias do usuário ${userId}`);
      
      // Filtrar categorias do usuário
      const categories = mockCategories.filter(cat => cat.user_id === userId);
      
      // Ordenar por nome
      categories.sort((a, b) => a.name.localeCompare(b.name));
      
      return categories;
    } catch (error) {
      console.error(`Erro ao buscar categorias do usuário ${userId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter categorias de uma empresa (MOCK)
  async getByEmpresaId(empresaId: number) {
    try {
      console.log(`Mock: Obtendo categorias da empresa ${empresaId}`);
      
      // Filtrar categorias da empresa
      const categories = mockCategories.filter(cat => cat.empresa_id === empresaId);
      
      // Ordenar por nome
      categories.sort((a, b) => a.name.localeCompare(b.name));
      
      return categories;
    } catch (error) {
      console.error(`Erro ao buscar categorias da empresa ${empresaId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter uma categoria pelo ID (MOCK)
  async getById(id: number) {
    try {
      console.log(`Mock: Obtendo categoria com ID ${id}`);
      
      // Buscar categoria no mock
      const category = mockCategories.find(cat => cat.id === id);
      
      if (!category) {
        throw new Error(`Categoria com id ${id} não encontrada`);
      }
      
      return category;
    } catch (error) {
      console.error(`Erro ao buscar categoria ${id} (mock):`, error);
      throw error;
    }
  },
  
  // Atualizar uma categoria (MOCK)
  async update(id: number, data: Partial<FileCategory>) {
    try {
      console.log(`Mock: Atualizando categoria ${id}`, data);
      
      // Encontrar índice da categoria
      const index = mockCategories.findIndex(cat => cat.id === id);
      
      if (index === -1) {
        throw new Error(`Categoria com id ${id} não encontrada`);
      }
      
      // Atualizar categoria
      mockCategories[index] = {
        ...mockCategories[index],
        ...data
      };
      
      return mockCategories[index];
    } catch (error) {
      console.error(`Erro ao atualizar categoria ${id} (mock):`, error);
      throw error;
    }
  },
  
  // Excluir uma categoria (MOCK)
  async delete(id: number) {
    try {
      console.log(`Mock: Excluindo categoria ${id}`);
      
      // Encontrar índice da categoria
      const index = mockCategories.findIndex(cat => cat.id === id);
      
      if (index === -1) {
        throw new Error(`Categoria com id ${id} não encontrada`);
      }
      
      // Remover categoria
      mockCategories.splice(index, 1);
      
      // Remover todas as relações associadas a esta categoria
      const relationsToRemove = mockRelations.filter(rel => rel.category_id === id);
      relationsToRemove.forEach(rel => {
        const relIndex = mockRelations.findIndex(r => r.id === rel.id);
        if (relIndex !== -1) {
          mockRelations.splice(relIndex, 1);
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir categoria ${id} (mock):`, error);
      throw error;
    }
  }
};

// CRUD para relações arquivo-categoria (MOCK)
export const fileCategoryCrud = {
  // Adicionar arquivo a uma categoria (MOCK)
  async addFileToCategory(fileId: number, categoryId: number, userId: string) {
    try {
      console.log(`Mock: Adicionando arquivo ${fileId} à categoria ${categoryId}`);
      
      // Verificar se a categoria existe
      const categoryExists = mockCategories.some(cat => cat.id === categoryId);
      if (!categoryExists) {
        throw new Error(`Categoria com id ${categoryId} não encontrada`);
      }
      
      // Verificar se a relação já existe
      const relationExists = mockRelations.some(
        rel => rel.file_id === fileId && rel.category_id === categoryId
      );
      
      if (relationExists) {
        throw new Error(`Arquivo ${fileId} já está na categoria ${categoryId}`);
      }
      
      // Gerar novo ID
      const newId = mockRelations.length > 0 
        ? Math.max(...mockRelations.map(rel => rel.id || 0)) + 1 
        : 1;
      
      // Criar nova relação
      const newRelation: FileCategoryRelation = {
        id: newId,
        file_id: fileId,
        category_id: categoryId,
        created_by: userId,
        created_at: new Date().toISOString()
      };
      
      // Adicionar ao mock
      mockRelations.push(newRelation);
      
      return newRelation;
    } catch (error) {
      console.error(`Erro ao adicionar arquivo ${fileId} à categoria ${categoryId} (mock):`, error);
      throw error;
    }
  },
  
  // Remover arquivo de uma categoria (MOCK)
  async removeFileFromCategory(fileId: number, categoryId: number) {
    try {
      console.log(`Mock: Removendo arquivo ${fileId} da categoria ${categoryId}`);
      
      // Encontrar índice da relação
      const index = mockRelations.findIndex(
        rel => rel.file_id === fileId && rel.category_id === categoryId
      );
      
      if (index === -1) {
        throw new Error(`Relação entre arquivo ${fileId} e categoria ${categoryId} não encontrada`);
      }
      
      // Remover relação
      mockRelations.splice(index, 1);
      
      return true;
    } catch (error) {
      console.error(`Erro ao remover arquivo ${fileId} da categoria ${categoryId}:`, error);
      throw error;
    }
  },
  
  // Obter categorias de um arquivo (MOCK)
  async getCategoriesByFileId(fileId: number) {
    try {
      console.log(`Mock: Obtendo categorias do arquivo ${fileId}`);
      
      // Encontrar todas as relações do arquivo
      const fileRelations = mockRelations.filter(rel => rel.file_id === fileId);
      
      // Obter categorias a partir dos IDs nas relações
      const categories = fileRelations.map(rel => {
        return mockCategories.find(cat => cat.id === rel.category_id);
      }).filter(cat => cat !== undefined) as FileCategory[];
      
      return categories;
    } catch (error) {
      console.error(`Erro ao buscar categorias do arquivo ${fileId} (mock):`, error);
      throw error;
    }
  },
  
  // Obter arquivos de uma categoria (MOCK)
  async getFilesByCategoryId(categoryId: number) {
    try {
      console.log(`Mock: Obtendo arquivos da categoria ${categoryId}`);
      
      // Encontrar todas as relações da categoria
      const categoryRelations = mockRelations.filter(rel => rel.category_id === categoryId);
      
      // Simular arquivos retornados
      // Como não temos um mock de arquivos, vamos criar objetos simplificados
      const mockFiles = categoryRelations.map(rel => ({
        id: rel.file_id,
        name: `Arquivo ${rel.file_id}`,
        size: Math.floor(Math.random() * 10000000), // Tamanho aleatório em bytes
        created_at: rel.created_at,
        mime_type: 'application/pdf',
        path: `/arquivos/arquivo_${rel.file_id}.pdf`
      }));
      
      return mockFiles;
    } catch (error) {
      console.error(`Erro ao buscar arquivos da categoria ${categoryId} (mock):`, error);
      throw error;
    }
  }
};

// Função para criar tabelas de categorias (MOCK)
export const createCategoryTables = async () => {
  try {
    console.log('Mock: Simulação de criação de tabelas de categorias');
    
    // Simular criação da tabela file_categories
    console.log('Mock: Tabela file_categories simulada com sucesso');
    
    // Simular criação da tabela file_category_relations
    console.log('Mock: Tabela file_category_relations simulada com sucesso');
    
    // O mock já contém dados iniciais, então consideramos as tabelas como criadas
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar tabelas de categorias (mock):', error);
    return { success: false, error };
  }
};
