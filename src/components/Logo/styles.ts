import styled from 'styled-components';

interface SizeProps {
  size?: 'small' | 'medium' | 'large';
}

// Função para obter o tamanho da imagem com base na propriedade size
const getImageSize = (size?: string) => {
  switch (size) {
    case 'small':
      return '40px';
    case 'large':
      return '80px';
    case 'medium':
    default:
      return '60px';
  }
};

// Função para obter o tamanho da fonte com base na propriedade size
const getFontSize = (size?: string) => {
  switch (size) {
    case 'small':
      return '20px';
    case 'large':
      return '36px';
    case 'medium':
    default:
      return '28px';
  }
};

// Função para obter a margem superior do texto com base na propriedade size
const getTextMarginTop = (size?: string) => {
  switch (size) {
    case 'small':
      return '-8px';
    case 'large':
      return '-12px';
    case 'medium':
    default:
      return '-10px';
  }
};

export const LogoContainer = styled.div<SizeProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.size === 'small' ? '15px' : '30px'};
  width: 100%;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
`;

export const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  
  /* Classe para layout horizontal (logo ao lado do texto) */
  &.horizontal {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
`;

export const LogoImage = styled.img<SizeProps>`
  height: ${props => getImageSize(props.size)};
  width: auto;
  filter: invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%);
`;

export const LogoText = styled.h1<SizeProps>`
  font-family: 'MuseoModerno', cursive;
  font-size: ${props => getFontSize(props.size)};
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: 1px;
  text-transform: lowercase;
  text-shadow: 0 0 5px var(--text-color);
  margin-top: ${props => getTextMarginTop(props.size)};
  
  .horizontal & {
    margin-top: 0;
  }
`;
