import React, { ButtonHTMLAttributes } from 'react';
import { StyledButton, LoadingBar } from './styles';

// Define props for the Button component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  ...props
}) => {
  // Pass custom props with $ prefix to styled components
  // and standard HTML button props directly
  return (
    <StyledButton
      $variant={variant}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Processando' : children}
      {isLoading && <LoadingBar $variant={variant} />}
    </StyledButton>
  );
};

export default Button;
