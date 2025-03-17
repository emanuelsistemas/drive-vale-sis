import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://drive-vale-sis-supabase-drive-vale-sis.h6gsxu.easypanel.host';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Inicializar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções auxiliares para autenticação
export const auth = {
  signUp: async (email, password, userData = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
  },
  
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getUser: async () => {
    return await supabase.auth.getUser();
  },
  
  getSession: async () => {
    return await supabase.auth.getSession();
  }
};

// Funções auxiliares para o banco de dados
export const db = {
  // Função genérica para selecionar dados de uma tabela
  select: async (table, columns = '*', filters = {}) => {
    let query = supabase.from(table).select(columns);
    
    // Aplicar filtros se existirem
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  },
  
  // Função para inserir dados em uma tabela
  insert: async (table, data) => {
    return await supabase.from(table).insert(data);
  },
  
  // Função para atualizar dados em uma tabela
  update: async (table, data, filters = {}) => {
    let query = supabase.from(table).update(data);
    
    // Aplicar filtros se existirem
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  },
  
  // Função para excluir dados de uma tabela
  delete: async (table, filters = {}) => {
    let query = supabase.from(table).delete();
    
    // Aplicar filtros se existirem
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  }
};

export default supabase;
