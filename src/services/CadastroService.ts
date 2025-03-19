import api from './ApiService';

// Interface para os parâmetros de cadastro
export interface CadastroParams {
  name: string;
  email: string;
  password: string;
  role?: string;
  company?: string;
}

// Interface para a resposta de cadastro
export interface CadastroResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  company?: string;
  created_at: string;
}

// Serviço de cadastro
export const cadastroApi = {
  // Função para listar cadastros
  listar: async (page = 1, limit = 10, search = ''): Promise<{data: CadastroResponse[], pagination: any}> => {
    try {
      const response = await api.get(`/cadastro?page=${page}&limit=${limit}&search=${search}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao listar cadastros');
    }
  },

  // Função para obter um cadastro por ID
  obter: async (id: string | number): Promise<CadastroResponse> => {
    try {
      const response = await api.get(`/cadastro/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao obter cadastro');
    }
  },

  // Função para criar um cadastro
  criar: async (params: CadastroParams): Promise<CadastroResponse> => {
    try {
      const response = await api.post('/cadastro', params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar cadastro');
    }
  },

  // Função para atualizar um cadastro
  atualizar: async (id: string | number, params: Partial<CadastroParams>): Promise<CadastroResponse> => {
    try {
      const response = await api.put(`/cadastro/${id}`, params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar cadastro');
    }
  },

  // Função para excluir um cadastro
  excluir: async (id: string | number): Promise<{message: string}> => {
    try {
      const response = await api.delete(`/cadastro/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao excluir cadastro');
    }
  },

  // Função para testar a conexão com o banco
  testarConexao: async (): Promise<{conectado: boolean, mensagem: string}> => {
    try {
      const response = await api.get('/cadastro/testar-conexao');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao testar conexão');
    }
  }
};

export default cadastroApi;
