import React, { useState } from 'react';
import { Container, Input, ToggleButton, ErrorMessage } from './styles';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  error?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  minLength,
  error,
  onBlur
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container>
      <label htmlFor={id}>{label}</label>
      <div className="password-container">
        <Input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          onBlur={onBlur}
          className={error ? 'invalid' : ''}
        />
        <ToggleButton
          type="button"
          onClick={togglePasswordVisibility}
          className={showPassword ? 'visible' : ''}
        >
          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </ToggleButton>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

export default PasswordInput;
