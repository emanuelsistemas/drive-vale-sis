import React, { useEffect, useState } from 'react';
import { Container, ToastContainer, Message, CloseButton } from './styles';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', visible, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  // Função para fechar o toast com animação
  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500); // Tempo da animação de saída
  };
  
  useEffect(() => {
    // Esconder o toast automaticamente apenas para mensagens de sucesso
    if (visible && type === 'success') {
      const timer = setTimeout(() => {
        closeWithAnimation();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, type, onClose]);
  
  // Reset do estado de fechamento quando o toast se torna visível
  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Container className={`${type} ${visible ? 'show' : ''} ${isClosing ? 'hide' : ''}`}>
      <ToastContainer>
        <Message>{message}</Message>
        {type === 'error' && (
          <CloseButton onClick={closeWithAnimation}>&times;</CloseButton>
        )}
      </ToastContainer>
    </Container>
  );
};

export default Toast;
