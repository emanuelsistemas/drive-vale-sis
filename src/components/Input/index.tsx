import React, { InputHTMLAttributes } from 'react';
import { Container, StyledInput, ErrorMessage } from './styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <Container>
      <label htmlFor={props.id}>{label}</label>
      <StyledInput 
        {...props} 
        className={error ? 'invalid' : ''}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

export default Input;
