import styled, { css, keyframes } from 'styled-components';

interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'danger';
  $fullWidth: boolean;
  $isLoading?: boolean;
}

// Animação para a barra de carregamento
const loadingAnimation = keyframes`
  0% { width: 0; }
  100% { width: 100%; }
`;

export const StyledButton = styled.button<StyledButtonProps>`
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  padding: 12px;
  background-color: ${props => props.theme.colors.inputBackground};
  font-family: ${props => props.theme.fonts.main};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "[ ";
    position: relative;
    z-index: 2;
  }
  
  &::after {
    content: " ]";
    position: relative;
    z-index: 2;
  }

  ${props => props.$variant === 'primary' && css`
    color: ${props => props.theme.colors.primary};
    border: 1px solid ${props => props.theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.inputBackground};
      box-shadow: 0 0 10px ${props => props.theme.colors.primary};
    }
  `}

  ${props => props.$variant === 'secondary' && css`
    color: ${props => props.theme.colors.text};
    border: 1px solid ${props => props.theme.colors.text};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.text};
      color: ${props => props.theme.colors.inputBackground};
      box-shadow: 0 0 10px ${props => props.theme.colors.text};
    }
  `}

  ${props => props.$variant === 'danger' && css`
    color: ${props => props.theme.colors.error};
    border: 1px solid ${props => props.theme.colors.error};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.error};
      color: ${props => props.theme.colors.inputBackground};
      box-shadow: 0 0 10px ${props => props.theme.colors.error};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Componente para a barra de carregamento
export const LoadingBar = styled.span<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  z-index: 1;
  animation: ${loadingAnimation} 2s infinite linear;
  
  ${props => props.$variant === 'primary' && css`
    background-color: ${props => props.theme.colors.primary};
    opacity: 0.3;
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: ${props => props.theme.colors.text};
    opacity: 0.3;
  `}
  
  ${props => props.$variant === 'danger' && css`
    background-color: ${props => props.theme.colors.error};
    opacity: 0.3;
  `}
`;
