import { supabase } from './supabase';
import { createPermissionsTable } from './permissionService';
import { createCategoryTables } from './categoryService';
import { createStatsTables } from './statsService';
import { fixRlsPolicies } from './fixRlsPolicies';

/**
 * Função para criar as tabelas necessárias no Supabase caso não existam
 */
export const createRequiredTables = async () => {
  try {
    // Verificar se a tabela dv_restricao_user existe
    const { data: restricaoExists, error: restricaoCheckError } = await supabase
      .from('dv_restricao_user')
      .select('id')
      .limit(1);
    
    // Se ocorrer um erro, provavelmente a tabela não existe
    if (restricaoCheckError) {
      console.log('Criando tabela dv_restricao_user...');
      
      // Criar a tabela dv_restricao_user
      const createRestricaoTableQuery = `
        CREATE TABLE IF NOT EXISTS dv_restricao_user (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          dv_tipo_restricao TEXT CHECK (dv_tipo_restricao IN ('admin', 'user')) DEFAULT 'admin',
          usuario_id BIGINT
        );
      `;
      
      const { error: createRestricaoError } = await supabase.rpc('exec', { 
        query: createRestricaoTableQuery 
      });
      
      if (createRestricaoError) {
        console.error('Erro ao criar tabela dv_restricao_user:', createRestricaoError);
      } else {
        console.log('Tabela dv_restricao_user criada com sucesso!');
      }
    }
    
    // Verificar se a tabela dv_cad_empresas_drive existe
    const { data: empresasExists, error: empresasCheckError } = await supabase
      .from('dv_cad_empresas_drive')
      .select('id')
      .limit(1);
    
    // Se ocorrer um erro, provavelmente a tabela não existe
    if (empresasCheckError) {
      console.log('Criando tabela dv_cad_empresas_drive...');
      
      // Criar a tabela dv_cad_empresas_drive
      const createEmpresasTableQuery = `
        CREATE TABLE IF NOT EXISTS dv_cad_empresas_drive (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          dv_nome TEXT,
          dv_email TEXT,
          dv_senha TEXT,
          dv_tipo_restricao BIGINT REFERENCES dv_restricao_user(id)
        );
      `;
      
      const { error: createEmpresasError } = await supabase.rpc('exec', { 
        query: createEmpresasTableQuery 
      });
      
      if (createEmpresasError) {
        console.error('Erro ao criar tabela dv_cad_empresas_drive:', createEmpresasError);
      } else {
        console.log('Tabela dv_cad_empresas_drive criada com sucesso!');
      }
    }
    
    // Verificar se a coluna usuario_id existe na tabela dv_restricao_user
    try {
      const { error: columnCheckError } = await supabase.rpc('exec', { 
        query: `SELECT usuario_id FROM dv_restricao_user LIMIT 1;` 
      });
      
      // Se ocorrer um erro, provavelmente a coluna não existe
      if (columnCheckError) {
        console.log('Adicionando coluna usuario_id à tabela dv_restricao_user...');
        
        // Adicionar a coluna usuario_id à tabela dv_restricao_user
        const addColumnQuery = `
          ALTER TABLE dv_restricao_user
          ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES dv_cad_empresas_drive(id);
        `;
        
        const { error: addColumnError } = await supabase.rpc('exec', { 
          query: addColumnQuery 
        });
        
        if (addColumnError) {
          console.error('Erro ao adicionar coluna usuario_id:', addColumnError);
        } else {
          console.log('Coluna usuario_id adicionada com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar coluna usuario_id:', error);
    }
    
    // Criar tabela de arquivos
    try {
      // Verificar se a tabela files existe
      const { error: filesCheckError } = await supabase.rpc('exec', { 
        query: `SELECT to_regclass('public.files');` 
      });
      
      if (filesCheckError) {
        console.log('Criando tabela de arquivos...');
        
        const createFilesTableQuery = `
          CREATE TABLE IF NOT EXISTS files (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name TEXT NOT NULL,
            size BIGINT NOT NULL,
            type TEXT,
            path TEXT NOT NULL,
            user_id TEXT NOT NULL,
            empresa_id BIGINT REFERENCES dv_cad_empresas_drive(id),
            is_public BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            description TEXT,
            tags TEXT[]
          );
          
          CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
          CREATE INDEX IF NOT EXISTS idx_files_empresa_id ON files(empresa_id);
          CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public);
        `;
        
        const { error: createFilesError } = await supabase.rpc('exec', { 
          query: createFilesTableQuery 
        });
        
        if (createFilesError) {
          console.error('Erro ao criar tabela de arquivos:', createFilesError);
        } else {
          console.log('Tabela de arquivos criada com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/criar tabela de arquivos:', error);
    }
    
    // Criar tabela de permissões
    try {
      await createPermissionsTable();
      console.log('Tabela de permissões verificada/criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tabela de permissões:', error);
    }
    
    // Criar tabelas de categorias
    try {
      await createCategoryTables();
      console.log('Tabelas de categorias verificadas/criadas com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tabelas de categorias:', error);
    }
    
    // Criar tabelas de estatísticas
    try {
      await createStatsTables();
      console.log('Tabelas de estatísticas verificadas/criadas com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tabelas de estatísticas:', error);
    }
    
    // Corrigir políticas RLS
    try {
      await fixRlsPolicies();
      console.log('Políticas RLS corrigidas com sucesso!');
    } catch (error) {
      console.error('Erro ao corrigir políticas RLS:', error);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return { success: false, error };
  }
};

export default createRequiredTables;
