import React from 'react';
import { LogoContainer, LogoText, LogoImage, LogoWrapper } from './styles';
// Importando a imagem logo1.png
import logoImage from '../../assets/images/logo1.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  textOnly?: boolean;
  className?: string;
  onClick?: () => void;
  horizontal?: boolean; // Nova propriedade para layout horizontal
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  textOnly = false,
  className,
  onClick,
  horizontal = false
}) => {
  return (
    <LogoContainer className={className} onClick={onClick} size={size}>
      <LogoWrapper className={horizontal ? 'horizontal' : ''}>
        {!textOnly && <LogoImage src={logoImage} alt="Logo nexo" size={size} />}
        {showText && (
          <LogoText size={size}>
            nexo drive
          </LogoText>
        )}
      </LogoWrapper>
    </LogoContainer>
  );
};

export default Logo;
