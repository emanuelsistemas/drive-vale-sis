import React, { useState, useEffect } from 'react';
import { supabase, auth, db } from './config';

const SupabaseExample = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // Verificar sessão atual ao carregar o componente
    auth.getSession().then(({ data, error }) => {
      setSession(data.session);
      setLoading(false);
      
      if (data.session) {
        fetchUsers();
      }
    });
    
    // Configurar listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          fetchUsers();
        }
      }
    );
    
    return () => {
      // Limpar listener ao desmontar
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Buscar lista de usuários
  const fetchUsers = async () => {
    const { data, error } = await db.select('user');
    if (!error) {
      setUsers(data || []);
    }
  };
  
  // Fazer login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await auth.signIn(email, password);
    
    if (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
    
    setLoading(false);
  };
  
  // Criar nova conta
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await auth.signUp(email, password, {
      nome_user: name,
      email_user: email,
      senha_user: password
    });
    
    if (error) {
      alert('Erro ao criar conta: ' + error.message);
    } else {
      alert('Conta criada com sucesso! Verifique seu email para confirmar.');
    }
    
    setLoading(false);
  };
  
  // Fazer logout
  const handleLogout = async () => {
    setLoading(true);
    await auth.signOut();
    setLoading(false);
  };
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div className="supabase-example">
      <h2>Demonstração do Supabase</h2>
      
      {session ? (
        <div className="authenticated">
          <h3>Usuário logado</h3>
          <p>Email: {session.user.email}</p>
          
          <button onClick={handleLogout} disabled={loading}>
            Sair
          </button>
          
          <h3>Usuários cadastrados</h3>
          {users.length === 0 ? (
            <p>Nenhum usuário encontrado</p>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  {user.nome_user} ({user.email_user})
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="auth-forms">
          <div className="login-form">
            <h3>Login</h3>
            <form onSubmit={handleLogin}>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Senha:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                Entrar
              </button>
            </form>
          </div>
          
          <div className="signup-form">
            <h3>Criar Conta</h3>
            <form onSubmit={handleSignUp}>
              <div>
                <label>Nome:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Senha:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                Criar Conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseExample;
