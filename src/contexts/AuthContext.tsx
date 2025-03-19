import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponse, RegisterParams } from '../services/ApiService';
import { UserService, CadEmpUser, CreateUserParams } from '../services/UserService';
import { cadastroApi, CadastroParams } from '../services/CadastroService';

// Interfaces simplificadas sem dependências do Supabase
interface User {
  id: string | number;
  email: string;
  nome?: string;
  perfil?: string;
}

interface Session {
  user: User;
  access_token?: string;
}

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<CadEmpUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (currentSession: Session | null) => {
    if (!currentSession) {
      setUserData(null);
      setIsAdmin(false);
      return;
    }

    try {
      // Obter dados do usuário atual
      const userData = await authApi.me();
      setUserData(userData);
      setIsAdmin(userData.perfil === 'admin');
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUserData(null);
      setIsAdmin(false);
    }
  };

  // Verificar se existe um token salvo no localStorage
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          const mockSession = {
            user: userObj,
            access_token: token
          };
          
          setSession(mockSession);
          setUser(userObj);
          await loadUserData(mockSession);
        } catch (error) {
          console.error('Erro ao recuperar sessão:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    checkToken();
    
    return () => {
      console.log('AuthContext: Desmontando contexto');
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      
      // Salvar token e dados do usuário
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      const newSession = {
        user: response.user,
        access_token: response.token
      };
      
      setSession(newSession);
      setUser(response.user);
      await loadUserData(newSession);
      
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: { message: error instanceof Error ? error.message : 'Erro desconhecido' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, empresa?: string) => {
    try {
      setLoading(true);
      
      // Validar campos
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

      // Primeiro, criar o usuário no banco de dados
      const cadastroParams: CadastroParams = {
        name: nome,
        email,
        password,
        company: empresa
      };
      
      try {
        // Criar o usuário usando o serviço de cadastro (tabela users)
        await cadastroApi.criar(cadastroParams);
        
        // Agora usar o serviço de autenticação para obter o token
        const registerParams: RegisterParams = {
          nome,
          email,
          senha: password,
          empresa
        };
        
        const response = await authApi.register(registerParams);
        
        // Salvar token e dados do usuário
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        const newSession = {
          user: response.user,
          access_token: response.token
        };
        
        setSession(newSession);
        setUser(response.user);
        await loadUserData(newSession);
        
        return { error: null };
      } catch (cadastroError) {
        console.error('Erro ao criar usuário no banco:', cadastroError);
        return { error: { message: cadastroError instanceof Error ? cadastroError.message : 'Erro ao criar usuário' } };
      }
      
      // As ações de salvar token estão no bloco try acima
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error: { message: error instanceof Error ? error.message : 'Erro desconhecido' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Logout');
    setSession(null);
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
