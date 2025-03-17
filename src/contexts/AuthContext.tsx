import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useSupabase } from './SupabaseContext';
import { UserService, CadEmpUser, CreateUserParams } from '../services/UserService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: CadEmpUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string, empresa?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { supabase } = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<CadEmpUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Inicializar o serviço de usuários
  const userService = new UserService(supabase);

  // Carregar dados do usuário
  const loadUserData = async (currentSession: Session | null) => {
    if (!currentSession) {
      setUserData(null);
      setIsAdmin(false);
      return;
    }

    try {
      // Verificar se é admin
      const adminStatus = await userService.isAdmin();
      setIsAdmin(adminStatus);
      
      // Carregar dados do usuário
      const currentUserData = await userService.getCurrentUser();
      setUserData(currentUserData);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  useEffect(() => {
    // Obter sessão atual
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadUserData(session);
      setLoading(false);
    });

    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        loadUserData(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, nome: string, empresa?: string) => {
    // Verificar se todos os campos foram preenchidos
    if (!email || !password || !nome) {
      return { error: { message: 'Todos os campos obrigatórios devem ser preenchidos' } };
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'Formato de email inválido' } };
    }
    
    // Validar tamanho da senha
    if (password.length < 6) {
      return { error: { message: 'A senha deve ter pelo menos 6 caracteres' } };
    }
    
    // Validar nome de usuário
    if (nome.length < 3) {
      return { error: { message: 'O nome deve ter pelo menos 3 caracteres' } };
    }

    try {
      // Criar usuário usando o serviço de usuários
      const userParams: CreateUserParams = {
        email,
        password,
        nome,
        empresa
      };
      
      await userService.createUser(userParams);
      return { error: null };
    } catch (error: any) {
      console.error('Erro no processo de cadastro:', error);
      return { error: { message: error.message || 'Erro ao criar usuário' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    userData,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
