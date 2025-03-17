import styled from 'styled-components';

export const Container = styled.div`
  margin-bottom: 15px;
  width: 100%;

  label {
    display: block;
    margin-bottom: 5px;
    color: var(--text-color);
    font-size: 14px;
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  font-family: 'Share Tech Mono', monospace;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 5px var(--primary-color);
  }

  &.invalid {
    border-color: var(--error-color);
    box-shadow: 0 0 5px var(--error-color);
  }
`;

export const ErrorMessage = styled.small`
  color: var(--error-color);
  font-size: 12px;
  margin-top: 5px;
  display: block;
`;
