import axios from 'axios';

// Criando uma instância do Axios com a configuração base
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar interceptor para incluir o token em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interface para a resposta de login/registro
export interface AuthResponse {
  user: {
    id: string | number;
    nome: string;
    email: string;
    perfil: string;
    empresa?: string;
  };
  token: string;
}

// Interface para os parâmetros de cadastro
export interface RegisterParams {
  nome: string;
  email: string;
  senha: string;
  empresa?: string;
}

// Serviço de autenticação
export const authApi = {
  // Função de login
  login: async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro no login');
      }
      throw new Error('Erro na conexão com o servidor');
    }
  },

  // Função de registro
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro no cadastro');
      }
      throw new Error('Erro na conexão com o servidor');
    }
  },

  // Função para obter dados do usuário atual
  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro ao buscar dados do usuário');
      }
      throw new Error('Erro na conexão com o servidor');
    }
  }
};

export default api;
