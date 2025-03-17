import { SupabaseClient } from '@supabase/supabase-js';

// Interfaces para os tipos de dados
export interface PerfilAcesso {
  id: string;
  tipo: 'admin' | 'user';
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CadEmpUser {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  perfil_id: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  perfil?: PerfilAcesso;
}

export interface CreateUserParams {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  perfil_id?: string;
  ativo?: boolean;
}

export interface UpdateUserParams {
  nome?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  perfil_id?: string;
  ativo?: boolean;
}

/**
 * Serviço para gerenciar usuários e perfis de acesso
 */
export class UserService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Verifica se o usuário atual é administrador
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      if (!user || !user.user) {
        return false;
      }
      
      const { data, error } = await this.supabase.rpc('is_admin', {
        user_id: user.user.id
      });
      
      if (error) {
        console.error('Erro ao verificar se é admin:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Erro ao verificar se é admin:', error);
      return false;
    }
  }

  /**
   * Obtém todos os perfis de acesso
   */
  async getPerfis(): Promise<PerfilAcesso[]> {
    const { data, error } = await this.supabase
      .from('perfil_acesso')
      .select('*')
      .order('tipo');
    
    if (error) {
      console.error('Erro ao obter perfis:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Obtém todos os usuários com seus perfis
   */
  async getUsers(): Promise<CadEmpUser[]> {
    const { data, error } = await this.supabase
      .from('cad_emp_user')
      .select(`
        *,
        perfil:perfil_id (
          id,
          tipo,
          descricao
        )
      `)
      .order('nome');
    
    if (error) {
      console.error('Erro ao obter usuários:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Obtém um usuário pelo ID
   */
  async getUserById(id: string): Promise<CadEmpUser | null> {
    const { data, error } = await this.supabase
      .from('cad_emp_user')
      .select(`
        *,
        perfil:perfil_id (
          id,
          tipo,
          descricao
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<CadEmpUser | null> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      
      if (!authData || !authData.user) {
        return null;
      }
      
      const { data, error } = await this.supabase
        .from('cad_emp_user')
        .select(`
          *,
          perfil:perfil_id (
            id,
            tipo,
            descricao
          )
        `)
        .eq('auth_id', authData.user.id)
        .single();
      
      if (error) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(params: CreateUserParams): Promise<CadEmpUser | null> {
    try {
      // 0. Verificar se já existe um usuário com o mesmo email
      const { data: existingUsers, error: checkError } = await this.supabase
        .from('cad_emp_user')
        .select('id')
        .eq('email', params.email)
        .limit(1);
      
      if (checkError) {
        console.error('Erro ao verificar email duplicado:', checkError);
        throw checkError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Já existe um usuário cadastrado com este email.');
      }
      
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true
      });
      
      if (authError) {
        console.error('Erro ao criar usuário na autenticação:', authError);
        throw authError;
      }
      
      // 2. Verificar se é o primeiro usuário (será admin) ou se já existem outros usuários
      let perfilId = params.perfil_id;
      
      if (!perfilId) {
        // Contar quantos usuários existem no sistema
        const { count, error: countError } = await this.supabase
          .from('cad_emp_user')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Erro ao contar usuários:', countError);
          throw countError;
        }
        
        // Se não existir nenhum usuário, este será o primeiro e será admin
        if (count === 0) {
          const { data: perfisAdmin, error: perfilAdminError } = await this.supabase
            .from('perfil_acesso')
            .select('id')
            .eq('tipo', 'admin')
            .limit(1);
          
          if (perfilAdminError) {
            console.error('Erro ao obter perfil admin:', perfilAdminError);
            throw perfilAdminError;
          }
          
          if (perfisAdmin && perfisAdmin.length > 0) {
            perfilId = perfisAdmin[0].id;
          }
        } else {
          // Se já existirem outros usuários, o novo será um usuário comum
          const { data: perfisUser, error: perfilUserError } = await this.supabase
            .from('perfil_acesso')
            .select('id')
            .eq('tipo', 'user')
            .limit(1);
          
          if (perfilUserError) {
            console.error('Erro ao obter perfil user:', perfilUserError);
            throw perfilUserError;
          }
          
          if (perfisUser && perfisUser.length > 0) {
            perfilId = perfisUser[0].id;
          }
        }
      }
      
      // 3. Criar usuário na tabela cad_emp_user
      const { data: userData, error: userError } = await this.supabase
        .from('cad_emp_user')
        .insert([
          {
            auth_id: authData.user.id,
            nome: params.nome,
            email: params.email,
            telefone: params.telefone,
            empresa: params.empresa,
            cargo: params.cargo,
            perfil_id: perfilId,
            ativo: params.ativo !== undefined ? params.ativo : true
          }
        ])
        .select(`
          *,
          perfil:perfil_id (
            id,
            tipo,
            descricao
          )
        `)
        .single();
      
      if (userError) {
        console.error('Erro ao criar usuário na tabela cad_emp_user:', userError);
        throw userError;
      }
      
      return userData;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, params: UpdateUserParams): Promise<CadEmpUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('cad_emp_user')
        .update({
          nome: params.nome,
          telefone: params.telefone,
          empresa: params.empresa,
          cargo: params.cargo,
          perfil_id: params.perfil_id,
          ativo: params.ativo
        })
        .eq('id', id)
        .select(`
          *,
          perfil:perfil_id (
            id,
            tipo,
            descricao
          )
        `)
        .single();
      
      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Exclui um usuário
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // 1. Obter o auth_id do usuário
      const { data: userData, error: userError } = await this.supabase
        .from('cad_emp_user')
        .select('auth_id')
        .eq('id', id)
        .single();
      
      if (userError) {
        console.error('Erro ao obter auth_id do usuário:', userError);
        throw userError;
      }
      
      // 2. Excluir o usuário da tabela cad_emp_user
      const { error: deleteError } = await this.supabase
        .from('cad_emp_user')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Erro ao excluir usuário da tabela cad_emp_user:', deleteError);
        throw deleteError;
      }
      
      // 3. Excluir o usuário da autenticação
      if (userData && userData.auth_id) {
        const { error: authError } = await this.supabase.auth.admin.deleteUser(
          userData.auth_id
        );
        
        if (authError) {
          console.error('Erro ao excluir usuário da autenticação:', authError);
          throw authError;
        }
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }
}
