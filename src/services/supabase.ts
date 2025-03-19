// Stub simples do Supabase sem conexão real

// Criando a interface do cliente Supabase apenas com métodos mock
export const supabase = {
  auth: {
    getUser: async () => {
      console.log('[MOCK] getUser called');
      return { data: { user: { id: 'mock-user-id', email: 'user@example.com' } }, error: null };
    },
    getSession: async () => {
      console.log('[MOCK] getSession called');
      return { data: { session: { user: { id: 'mock-user-id', email: 'user@example.com' } } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      console.log('[MOCK] signIn called with:', email);
      return { data: { user: { id: 'mock-user-id', email: email }, session: { user: { id: 'mock-user-id' } } }, error: null };
    },
    signUp: async ({ email, password }: any) => {
      console.log('[MOCK] signUp called with:', email);
      return { data: { user: { id: 'mock-user-id', email: email }, session: { user: { id: 'mock-user-id' } } }, error: null };
    },
    signOut: async () => {
      console.log('[MOCK] signOut called');
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      console.log('[MOCK] onAuthStateChange called');
      // Simular um evento de login após 1 segundo
      setTimeout(() => {
        callback('SIGNED_IN', { 
          user: { id: 'mock-user-id', email: 'user@example.com' }
        });
      }, 1000);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => {
    return {
      select: () => ({
        eq: () => ({
          single: () => {
            console.log(`[MOCK] select from ${table} called`);
            if (table === 'cad_emp_user') {
              return Promise.resolve({ 
                data: { 
                  id: 'mock-user-id', 
                  nome: 'Usuário Teste', 
                  email: 'user@example.com',
                  perfil: { tipo: 'admin' } 
                }, 
                error: null 
              });
            }
            return Promise.resolve({ data: null, error: null });
          },
          order: () => ({
            limit: () => {
              console.log(`[MOCK] select with order from ${table} called`);
              return Promise.resolve({ data: [], error: null });
            }
          })
        }),
        execute: () => {
          console.log(`[MOCK] select execute from ${table} called`);
          return Promise.resolve({ data: [], error: null });
        }
      }),
      insert: () => {
        console.log(`[MOCK] insert into ${table} called`);
        return Promise.resolve({ data: { id: 'new-mock-id' }, error: null });
      },
      update: () => ({
        eq: () => {
          console.log(`[MOCK] update ${table} called`);
          return Promise.resolve({ data: { id: 'mock-id' }, error: null });
        }
      }),
      delete: () => ({
        eq: () => {
          console.log(`[MOCK] delete from ${table} called`);
          return Promise.resolve({ error: null });
        }
      })
    };
  },
  rpc: (funcName: string, params?: any) => {
    console.log(`[MOCK] rpc call to ${funcName} with params:`, params);
    return Promise.resolve({ data: null, error: null });
  }
};

export default supabase;
