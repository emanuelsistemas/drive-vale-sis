import React from 'react';
import styled from 'styled-components';

const UserManagementContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 77, 79, 0.3);
`;

/**
 * Componente de gerenciamento de usuários
 * Temporariamente desativado para evitar erros de compilação
 * Será reativado em uma futura versão
 */
const UserManagement: React.FC = () => {
  return (
    <UserManagementContainer>
      <ErrorMessage>
        Módulo de gerenciamento de usuários temporariamente desativado.
        Uma versão atualizada será implementada em breve.
      </ErrorMessage>
    </UserManagementContainer>
  );
};

export default UserManagement;
