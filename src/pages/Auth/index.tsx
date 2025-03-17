import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  LoginContainer, 
  FormContainer, 
  FormToggle, 
  TerminalLine,
  TerminalPrompt,
  TerminalText,
  Cursor
} from './styles';

// Importação centralizada dos componentes
import { Logo, Input, PasswordInput, Button } from '../../components';

// Importação dos contextos
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Errors
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  
  const validateUsername = () => {
    if (username.length > 0 && username.length < 3) {
      setUsernameError('O nome de usuário deve ter pelo menos 3 caracteres');
      return false;
    } else {
      setUsernameError('');
      return true;
    }
  };
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      setEmailError('Formato de email inválido');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const validatePassword = () => {
    if (password.length > 0 && password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };
  
  const validateConfirmPassword = () => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };
  

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        showToast(error.message || 'Erro ao fazer login', 'error');
      } else {
        showToast('Login realizado com sucesso!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      showToast('Erro ao conectar com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const validateAdminPassword = () => {
    if (!adminPassword) {
      setAdminPasswordError('A senha de autorização é obrigatória');
      return false;
    } else if (adminPassword !== 'admin123') { // Valor fixo da variável REACT_APP_ADMIN_PASSWORD
      setAdminPasswordError('Senha de autorização inválida');
      return false;
    } else {
      setAdminPasswordError('');
      return true;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isAdminPasswordValid = validateAdminPassword();
    
    // Se algum campo não for válido, interromper o cadastro
    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isAdminPasswordValid) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }
    
    // Verificar se os campos obrigatórios foram preenchidos
    if (!username || !email || !password || !confirmPassword || !adminPassword) {
      showToast('Os campos obrigatórios devem ser preenchidos', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, username);
      
      if (error) {
        showToast(error.message || 'Erro ao criar conta', 'error');
      } else {
        showToast('Conta criada com sucesso!');
        setIsLogin(true);
        
        // Reset form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAdminPassword('');
      }
    } catch (error) {
      showToast('Erro ao conectar com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <LoginContainer>
        <Logo />
        
        <TerminalLine>
          <TerminalPrompt>root@valeterm:~$</TerminalPrompt> 
          <TerminalText>{isLogin ? 'iniciar_sessao' : 'novo_usuario'}</TerminalText>
          <Cursor />
        </TerminalLine>
        
        <FormToggle>
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Cadastro
          </button>
        </FormToggle>
        
        {isLogin ? (
          <FormContainer onSubmit={handleLogin}>
            <Input 
              id="login-email" 
              label="Email" 
              type="email" 
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
              required 
            />
            
            <PasswordInput 
              id="login-password" 
              label="Senha" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
              required 
            />
            
            <Button 
              type="submit" 
              fullWidth 
              isLoading={loading}
            >
              Entrar
            </Button>
          </FormContainer>
        ) : (
          <FormContainer onSubmit={handleSignup}>
            <Input 
              id="username" 
              label="Nome de Usuário" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => validateUsername()}
              error={usernameError}
              required 
            />
            
            <Input 
              id="email" 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail()}
              error={emailError}
              required 
            />
            
            <PasswordInput 
              id="password" 
              label="Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onBlur={() => validatePassword()}
              error={passwordError}
              required 
              minLength={6}
            />
            
            <PasswordInput 
              id="confirm-password" 
              label="Confirmar Senha" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateConfirmPassword()}
              error={confirmPasswordError}
              required 
            />
            
            <PasswordInput 
              id="admin-password" 
              label="Senha de Autorização" 
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)}
              onBlur={() => validateAdminPassword()}
              error={adminPasswordError}
              required
            />
            
            <Button 
              type="submit" 
              fullWidth 
              isLoading={loading}
            >
              Cadastrar
            </Button>
          </FormContainer>
        )}
      </LoginContainer>
    </Container>
  );
};

export default Auth;
