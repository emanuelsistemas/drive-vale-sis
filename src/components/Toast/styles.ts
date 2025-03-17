import styled, { keyframes } from 'styled-components';

// Animação de entrada do Toast (da direita para o centro)
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Animação de saída do Toast (do centro para a direita)
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
`;

export const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  padding: 12px 20px;
  border: 1px solid ${props => props.theme.colors.text};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  width: 350px;
  z-index: 1000;
  opacity: 0;
  transform: translateX(100%);
  transition: opacity 0.5s ease, transform 0.5s ease;
  border-radius: 4px;

  &.show {
    opacity: 1;
    transform: translateX(0);
    animation: ${fadeIn} 0.5s ease forwards;
  }
  
  &.hide {
    animation: ${fadeOut} 0.5s ease forwards;
  }

  &.success {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 10px ${props => props.theme.colors.primary};
  }

  &.error {
    border-color: ${props => props.theme.colors.error};
    box-shadow: 0 0 10px ${props => props.theme.colors.error};
  }

  @media (max-width: 480px) {
    width: 90%;
    max-width: 350px;
    right: 5%;
  }
`;

export const ToastContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const StatusIcon = styled.span`
  color: var(--primary-color);
  margin-right: 10px;
  font-size: 12px;

  span {
    color: var(--text-color);
  }
`;

export const Message = styled.div`
  flex-grow: 1;
  text-align: center;
  font-family: ${props => props.theme.fonts.main};
  color: ${props => props.theme.colors.text};
`;

export const CloseButton = styled.span`
  margin-left: 15px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 18px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--text-color);
    text-shadow: 0 0 5px var(--accent-color);
  }
`;
