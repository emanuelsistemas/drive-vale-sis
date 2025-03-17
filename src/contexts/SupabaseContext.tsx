import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Interface para configuração do Supabase
interface SupabaseConfig {
  url: string;
  key: string;
  serviceRoleKey?: string;
  isLocal: boolean;
}

// Contexto para o cliente Supabase
interface SupabaseContextType {
  supabase: SupabaseClient;
  isLoading: boolean;
  user: any | null;
  config: SupabaseConfig;
}

// Criar contexto
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: {} as SupabaseClient,
  isLoading: true,
  user: null,
  config: {} as SupabaseConfig,
});

// Determinar qual configuração usar com base na variável de ambiente
const getSupabaseConfig = (): SupabaseConfig => {
  const useLocalSupabase = process.env.REACT_APP_USE_LOCAL_SUPABASE === 'true';
  
  if (useLocalSupabase) {
    // Usar Supabase local
    return {
      url: process.env.REACT_APP_DRIVE_SUPABASE_URL || 'https://drive-vale-sis-supabase.h6gsxu.easypanel.host',
      key: process.env.REACT_APP_DRIVE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
      serviceRoleKey: process.env.REACT_APP_DRIVE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q',
      isLocal: true,
    };
  } else {
    // Usar Supabase na nuvem (fallback para o mesmo endpoint)
    return {
      url: process.env.REACT_APP_DRIVE_SUPABASE_URL || 'https://drive-vale-sis-supabase.h6gsxu.easypanel.host',
      key: process.env.REACT_APP_DRIVE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
      serviceRoleKey: process.env.REACT_APP_DRIVE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q',
      isLocal: false,
    };
  }
};

// Provedor do contexto Supabase
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = getSupabaseConfig();
  const [supabase] = useState<SupabaseClient>(() => createClient(
    config.url,
    config.key,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  ));
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      // Limpar listener ao desmontar o componente
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Mostrar informações sobre a conexão no console (apenas em desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Conectado ao Supabase ${config.isLocal ? 'Local' : 'Cloud'}`);
      console.log(`URL: ${config.url}`);
    }
  }, [config]);

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading, user, config }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook para usar o SDK Supabase
export const useSupabase = () => useContext(SupabaseContext);

export default SupabaseProvider;
