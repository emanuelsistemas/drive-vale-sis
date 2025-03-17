import { supabase } from './supabase';

/**
 * Serviço para gerenciar categorias e tags de arquivos
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

// CRUD para categorias
export const categoryCrud = {
  // Criar uma nova categoria
  async create(data: FileCategory) {
    try {
      const { data: result, error } = await supabase
        .from('file_categories')
        .insert([data])
        .select();
      
      if (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
      }
      
      return result?.[0];
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },
  
  // Obter todas as categorias de um usuário
  async getByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('file_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        console.error(`Erro ao buscar categorias do usuário ${userId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar categorias do usuário ${userId}:`, error);
      throw error;
    }
  },
  
  // Obter categorias de uma empresa
  async getByEmpresaId(empresaId: number) {
    try {
      const { data, error } = await supabase
        .from('file_categories')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('name');
      
      if (error) {
        console.error(`Erro ao buscar categorias da empresa ${empresaId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar categorias da empresa ${empresaId}:`, error);
      throw error;
    }
  },
  
  // Obter uma categoria pelo ID
  async getById(id: number) {
    try {
      const { data, error } = await supabase
        .from('file_categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar categoria ${id}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar categoria ${id}:`, error);
      throw error;
    }
  },
  
  // Atualizar uma categoria
  async update(id: number, data: Partial<FileCategory>) {
    try {
      const { data: result, error } = await supabase
        .from('file_categories')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error(`Erro ao atualizar categoria ${id}:`, error);
        throw error;
      }
      
      return result?.[0];
    } catch (error) {
      console.error(`Erro ao atualizar categoria ${id}:`, error);
      throw error;
    }
  },
  
  // Excluir uma categoria
  async delete(id: number) {
    try {
      const { error } = await supabase
        .from('file_categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir categoria ${id}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir categoria ${id}:`, error);
      throw error;
    }
  }
};

// CRUD para relações arquivo-categoria
export const fileCategoryCrud = {
  // Adicionar arquivo a uma categoria
  async addFileToCategory(fileId: number, categoryId: number, userId: string) {
    try {
      const { data, error } = await supabase
        .from('file_category_relations')
        .insert([{
          file_id: fileId,
          category_id: categoryId,
          created_by: userId
        }])
        .select();
      
      if (error) {
        console.error(`Erro ao adicionar arquivo ${fileId} à categoria ${categoryId}:`, error);
        throw error;
      }
      
      return data?.[0];
    } catch (error) {
      console.error(`Erro ao adicionar arquivo ${fileId} à categoria ${categoryId}:`, error);
      throw error;
    }
  },
  
  // Remover arquivo de uma categoria
  async removeFileFromCategory(fileId: number, categoryId: number) {
    try {
      const { error } = await supabase
        .from('file_category_relations')
        .delete()
        .eq('file_id', fileId)
        .eq('category_id', categoryId);
      
      if (error) {
        console.error(`Erro ao remover arquivo ${fileId} da categoria ${categoryId}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao remover arquivo ${fileId} da categoria ${categoryId}:`, error);
      throw error;
    }
  },
  
  // Obter categorias de um arquivo
  async getCategoriesByFileId(fileId: number) {
    try {
      const { data, error } = await supabase
        .from('file_category_relations')
        .select(`
          category_id,
          category:category_id(*)
        `)
        .eq('file_id', fileId);
      
      if (error) {
        console.error(`Erro ao buscar categorias do arquivo ${fileId}:`, error);
        throw error;
      }
      
      return data.map(item => item.category);
    } catch (error) {
      console.error(`Erro ao buscar categorias do arquivo ${fileId}:`, error);
      throw error;
    }
  },
  
  // Obter arquivos de uma categoria
  async getFilesByCategoryId(categoryId: number) {
    try {
      const { data, error } = await supabase
        .from('file_category_relations')
        .select(`
          file_id,
          file:file_id(*)
        `)
        .eq('category_id', categoryId);
      
      if (error) {
        console.error(`Erro ao buscar arquivos da categoria ${categoryId}:`, error);
        throw error;
      }
      
      return data.map(item => item.file);
    } catch (error) {
      console.error(`Erro ao buscar arquivos da categoria ${categoryId}:`, error);
      throw error;
    }
  }
};

// Função para criar tabelas de categorias no Supabase
export const createCategoryTables = async () => {
  try {
    // Verificar se a tabela de categorias existe
    const { error: checkCategoriesError } = await supabase.rpc('exec', { 
      query: `SELECT to_regclass('public.file_categories');` 
    });
    
    if (checkCategoriesError) {
      console.log('Criando tabela de categorias...');
      
      // Criar a tabela file_categories
      const createCategoriesQuery = `
        CREATE TABLE IF NOT EXISTS file_categories (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT,
          icon TEXT,
          empresa_id BIGINT REFERENCES dv_cad_empresas_drive(id),
          user_id TEXT NOT NULL,
          parent_id BIGINT REFERENCES file_categories(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_file_categories_user_id ON file_categories(user_id);
        CREATE INDEX IF NOT EXISTS idx_file_categories_empresa_id ON file_categories(empresa_id);
      `;
      
      const { error: createCategoriesError } = await supabase.rpc('exec', { 
        query: createCategoriesQuery 
      });
      
      if (createCategoriesError) {
        console.error('Erro ao criar tabela de categorias:', createCategoriesError);
        throw createCategoriesError;
      }
    }
    
    // Verificar se a tabela de relações arquivo-categoria existe
    const { error: checkRelationsError } = await supabase.rpc('exec', { 
      query: `SELECT to_regclass('public.file_category_relations');` 
    });
    
    if (checkRelationsError) {
      console.log('Criando tabela de relações arquivo-categoria...');
      
      // Criar a tabela file_category_relations
      const createRelationsQuery = `
        CREATE TABLE IF NOT EXISTS file_category_relations (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
          category_id BIGINT REFERENCES file_categories(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by TEXT NOT NULL,
          UNIQUE(file_id, category_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_file_category_relations_file_id ON file_category_relations(file_id);
        CREATE INDEX IF NOT EXISTS idx_file_category_relations_category_id ON file_category_relations(category_id);
      `;
      
      const { error: createRelationsError } = await supabase.rpc('exec', { 
        query: createRelationsQuery 
      });
      
      if (createRelationsError) {
        console.error('Erro ao criar tabela de relações arquivo-categoria:', createRelationsError);
        throw createRelationsError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar tabelas de categorias:', error);
    return { success: false, error };
  }
};
