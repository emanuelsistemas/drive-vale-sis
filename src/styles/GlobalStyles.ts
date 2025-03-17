import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Paleta de cores cyberpunk */
    --bg-color: #0a0a0a;
    --card-bg: #111111;
    --text-color: #00ff41; /* Verde terminal clássico */
    --text-secondary: #00cc33;
    --primary-color: #0084ff; /* Azul neon */
    --primary-hover: #0066cc;
    --input-bg: #000000;
    --input-border: #333333;
    --error-color: #ff0000;
    --success-color: #00ff41;
    --accent-color: #00ffff; /* Ciano neon */
    --grid-line: rgba(0, 255, 65, 0.1);
    --terminal-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Share Tech Mono', monospace;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    z-index: -1;
  }

  /* Animação de cintilação */
  @keyframes flicker {
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
  }

  /* Animação do cursor piscante */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: all 0.3s ease;
  }

  a:hover {
    color: var(--accent-color);
    text-shadow: 0 0 5px var(--accent-color);
  }

  button {
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
  }

  input, textarea, select {
    font-family: 'Share Tech Mono', monospace;
  }
`;

export default GlobalStyles;
