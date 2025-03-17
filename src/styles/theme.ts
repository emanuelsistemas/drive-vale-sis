export const theme = {
  colors: {
    background: '#0a0a0a',
    cardBackground: '#111111',
    text: '#00ff41', // Verde terminal clássico
    textSecondary: '#00cc33',
    primary: '#0084ff', // Azul neon
    primaryHover: '#0066cc',
    inputBackground: '#000000',
    inputBorder: '#333333',
    error: '#ff0000',
    success: '#00ff41',
    accent: '#00ffff', // Ciano neon
    gridLine: 'rgba(0, 255, 65, 0.1)',
  },
  shadows: {
    terminal: '0 0 10px rgba(0, 255, 65, 0.2)',
    primary: '0 0 10px rgba(0, 132, 255, 0.3)',
    error: '0 0 10px rgba(255, 0, 0, 0.3)',
    success: '0 0 10px rgba(0, 255, 65, 0.3)',
  },
  fonts: {
    main: "'Share Tech Mono', monospace",
  },
  fontSizes: {
    small: '12px',
    medium: '14px',
    large: '16px',
    xlarge: '18px',
    xxlarge: '22px',
    logo: '28px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    small: '3px',
    medium: '5px',
    large: '8px',
  },
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    largeDesktop: '1200px',
  },
  animations: {
    flicker: 'flicker 5s infinite',
    blink: 'blink 1s infinite',
  },
};

export type Theme = typeof theme;
export default theme;
