import styled, { keyframes } from 'styled-components';

const flicker = keyframes`
  0% { opacity: 0.98; }
  5% { opacity: 1; }
  10% { opacity: 0.98; }
  15% { opacity: 0.99; }
  20% { opacity: 0.98; }
  25% { opacity: 1; }
  30% { opacity: 0.98; }
  35% { opacity: 0.99; }
  40% { opacity: 1; }
  45% { opacity: 0.98; }
  50% { opacity: 0.99; }
  55% { opacity: 0.98; }
  60% { opacity: 1; }
  65% { opacity: 0.98; }
  70% { opacity: 0.99; }
  75% { opacity: 0.98; }
  80% { opacity: 1; }
  85% { opacity: 0.98; }
  90% { opacity: 0.98; }
  95% { opacity: 1; }
  100% { opacity: 0.98; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  animation: ${flicker} 5s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0 auto;
`;

export const LoginContainer = styled.div`
  background-color: #000000;
  border: 1px solid var(--text-color);
  box-shadow: var(--terminal-shadow), 0 5px 10px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 30px;
  position: relative;
  z-index: 10;

  &::before {
    content: none; /* Removendo o grid de fundo */
  }

  @media (max-width: 480px) {
    max-width: 100%;
    padding: 20px;
  }
`;

export const FormContainer = styled.form`
  margin-top: 20px;
`;

export const FormToggle = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--input-border);

  button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 10px 15px;
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    font-size: 14px;
    transition: all 0.3s ease;
    flex: 1;
    text-align: center;

    &:hover {
      color: var(--text-color);
      text-shadow: 0 0 5px var(--text-color);
    }

    &.active {
      color: var(--text-color);
      border-bottom: 2px solid var(--primary-color);
      text-shadow: 0 0 5px var(--text-color);
    }
  }
`;

export const TerminalLine = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 20px;
  font-size: 14px;
  color: var(--text-color);
`;

export const TerminalPrompt = styled.span`
  color: var(--primary-color);
  margin-right: 8px;
`;

export const TerminalText = styled.span`
  color: var(--text-color);
`;

export const Cursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 18px;
  background-color: var(--text-color);
  margin-left: 2px;
  animation: ${blink} 1s infinite;
`;
