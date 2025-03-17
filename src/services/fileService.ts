import { supabase } from './supabase';
import { logFileAccess } from './statsService';
import { fileCategoryCrud } from './categoryService';
import { FileObject } from '../types/supabase';
import { empresaDriveCrud } from './crudService';

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

// Função para fazer upload de arquivo
export const uploadFile = async (file: File, userId: string, empresaId?: number, description?: string, tags?: string[]) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Registrar o arquivo no banco de dados
    const fileRecord: FileRecord = {
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      user_id: userId,
      is_public: false
    };
    
    // Adicionar campos opcionais se fornecidos
    if (empresaId) fileRecord.empresa_id = empresaId;
    if (description) fileRecord.description = description;
    if (tags) fileRecord.tags = tags;

    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert([fileRecord])
      .select();

    if (fileError) {
      throw fileError;
    }

    return fileData[0];
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

// Função para listar arquivos do usuário
export const listFiles = async (userId: string, empresaId?: number) => {
  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    // Se fornecido um ID de empresa, filtrar por ele também
    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as FileRecord[];
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
};

// Função para buscar arquivos por tags ou descrição
export const searchFiles = async (userId: string, searchTerm: string, empresaId?: number) => {
  try {
    // Buscar por descrição ou nome do arquivo
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
      
    // Se fornecido um ID de empresa, filtrar por ele também
    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as FileRecord[];
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    throw error;
  }
};

// Função para obter um arquivo pelo ID
export const getFileById = async (fileId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) {
      throw error;
    }

    return data as FileRecord;
  } catch (error) {
    console.error('Erro ao obter arquivo:', error);
    throw error;
  }
};

// Função para obter URL de download
export const getFileUrl = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(filePath, 60); // URL válida por 60 segundos

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Erro ao obter URL do arquivo:', error);
    throw error;
  }
};

// Função para atualizar informações do arquivo
export const updateFile = async (fileId: string, updates: Partial<FileRecord>) => {
  try {
    // Não permitir atualização de campos críticos
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.path;
    delete safeUpdates.user_id;
    delete safeUpdates.created_at;
    
    // Atualizar no banco de dados
    const { data, error } = await supabase
      .from('files')
      .update(safeUpdates)
      .eq('id', fileId)
      .select();

    if (error) {
      throw error;
    }

    return data[0] as FileRecord;
  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error);
    throw error;
  }
};

// Função para excluir arquivo
export const deleteFile = async (fileId: string, filePath: string) => {
  try {
    // Remover do storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    // Remover do banco de dados
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw dbError;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    throw error;
  }
};

// Função para compartilhar um arquivo (tornar público ou privado)
export const toggleFileVisibility = async (fileId: string, isPublic: boolean) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .update({ is_public: isPublic })
      .eq('id', fileId)
      .select();

    if (error) {
      throw error;
    }

    return data[0] as FileRecord;
  } catch (error) {
    console.error('Erro ao alterar visibilidade do arquivo:', error);
    throw error;
  }
};

// Função para obter arquivos públicos
export const getPublicFiles = async () => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as FileRecord[];
  } catch (error) {
    console.error('Erro ao obter arquivos públicos:', error);
    throw error;
  }
};

// Função para obter arquivos por empresa
export const getFilesByEmpresa = async (empresaId: number) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as FileRecord[];
  } catch (error) {
    console.error('Erro ao obter arquivos da empresa:', error);
    throw error;
  }
};
