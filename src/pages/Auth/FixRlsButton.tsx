import React, { useState } from 'react';
import { fixRlsPolicies } from '../../services/fixRlsPolicies';
import { StyledButton } from '../../components/Button/styles';

const FixRlsButton: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFixRls = async () => {
    try {
      setIsFixing(true);
      setResult(null);
      
      const { success, error } = await fixRlsPolicies();
      
      if (success) {
        setResult('Políticas RLS corrigidas com sucesso! Tente fazer login novamente.');
      } else {
        setResult(`Erro ao corrigir políticas RLS: ${error}`);
      }
    } catch (error) {
      setResult(`Erro ao corrigir políticas RLS: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <StyledButton
        $variant="secondary"
        $fullWidth={false}
        $isLoading={isFixing}
        onClick={handleFixRls}
        disabled={isFixing}
        style={{ marginBottom: '10px' }}
      >
        {isFixing ? 'Corrigindo...' : 'Corrigir Políticas RLS'}
      </StyledButton>
      
      {result && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: result.includes('sucesso') ? '#e6ffe6' : '#ffe6e6',
          borderRadius: '4px',
          color: result.includes('sucesso') ? '#006600' : '#cc0000'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default FixRlsButton;
