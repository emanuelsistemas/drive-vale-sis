import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Contexto simplificado para o cliente mock
interface MockSupabaseContextType {
  supabase: any;
  isLoading: boolean;
  user: any | null;
}

// Criar contexto
const SupabaseContext = createContext<MockSupabaseContextType>({
  supabase: {},
  isLoading: true,
  user: null,
});

// Provedor do contexto mock
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Simular verificação de usuário (sem conexão real)
    const checkUser = async () => {
      try {
        // Simular um delay de carregamento
        setTimeout(() => {
          // Usuário mock
          setUser({
            id: 'mock-user-id',
            email: 'user@example.com',
            role: 'authenticated'
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erro ao verificar usuário (mock):', error);
        setIsLoading(false);
      }
    };

    checkUser();

    // Simular configuração de listener
    console.log('SupabaseContext: configurando listener mock');

    return () => {
      // Simular limpeza de listener
      console.log('SupabaseContext: limpando listener mock');
    };
  }, []);

  // Logs para ajudar no debug (apenas em desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MOCK] SupabaseContext: usando cliente simulado (sem conexão real)');
    }
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading, user }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook para usar o cliente mock
export const useSupabase = () => useContext(SupabaseContext);

export default SupabaseProvider;
