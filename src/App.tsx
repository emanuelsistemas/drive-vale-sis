import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';

// Importações de contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import SupabaseProvider from './contexts/SupabaseContext';

// Importações de páginas
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// Importação da função para criar tabelas
import { createRequiredTables } from './services/createTables';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return user ? <>{element}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  useEffect(() => {
    // Criar as tabelas necessárias no banco de dados ao iniciar a aplicação
    createRequiredTables()
      .then(result => {
        if (result.success) {
          console.log('Tabelas verificadas com sucesso!');
        } else {
          console.error('Erro ao verificar tabelas:', result.error);
        }
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <SupabaseProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute element={<Dashboard />} />
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
};

export default App;
