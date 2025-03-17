import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserService, CadEmpUser, PerfilAcesso } from '../../services/UserService';
import styled from 'styled-components';

const UserManagementContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #00ff9d;
  font-size: 28px;
  margin: 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background-color: ${props => {
    if (props.variant === 'danger') return '#ff4d4f';
    if (props.variant === 'secondary') return '#1f1f1f';
    return '#00ff9d';
  }};
  color: ${props => (props.variant === 'secondary' ? '#00ff9d' : '#000')};
  border: 1px solid ${props => (props.variant === 'secondary' ? '#00ff9d' : 'transparent')};
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  background-color: #0d0d0d;
  color: #00ff9d;
  font-weight: bold;
  border-bottom: 1px solid #333;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  color: #fff;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #2a2a2a;
  }
`;

const Badge = styled.span<{ type: 'admin' | 'user' | 'active' | 'inactive' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background-color: ${props => {
    if (props.type === 'admin') return '#722ed1';
    if (props.type === 'user') return '#13c2c2';
    if (props.type === 'active') return '#52c41a';
    return '#f5222d';
  }};
  color: white;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #00ff9d;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: #fff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #fff;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #0d0d0d;
  color: #fff;
  
  &:focus {
    outline: none;
    border-color: #00ff9d;
  }
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #0d0d0d;
  color: #fff;
  
  &:focus {
    outline: none;
    border-color: #00ff9d;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 77, 79, 0.3);
`;

const SuccessMessage = styled.div`
  color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid rgba(82, 196, 26, 0.3);
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  color: #00ff9d;
  font-size: 24px;
`;

const UserManagement: React.FC = () => {
  const { supabase } = useSupabase();
  const { isAdmin: authIsAdmin } = useAuth();
  const [users, setUsers] = useState<CadEmpUser[]>([]);
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<CadEmpUser | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    telefone: '',
    empresa: '',
    cargo: '',
    perfil_id: '',
    ativo: true
  });

  // Inicializar o serviço de usuários
  const userService = new UserService(supabase);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!authIsAdmin) {
          setError('Você não tem permissão para acessar esta página.');
          setLoading(false);
          return;
        }
        
        // Carregar perfis
        const perfisData = await userService.getPerfis();
        setPerfis(perfisData);
        
        // Carregar usuários
        const usersData = await userService.getUsers();
        setUsers(usersData);
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [authIsAdmin]);

  // Abrir modal para criar usuário
  const handleOpenCreateModal = () => {
    setFormData({
      nome: '',
      email: '',
      password: '',
      telefone: '',
      empresa: '',
      cargo: '',
      perfil_id: perfis.length > 0 ? perfis[0].id : '',
      ativo: true
    });
    setModalMode('create');
    setShowModal(true);
  };

  // Abrir modal para editar usuário
  const handleOpenEditModal = (user: CadEmpUser) => {
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      password: '',
      telefone: user.telefone || '',
      empresa: user.empresa || '',
      cargo: user.cargo || '',
      perfil_id: user.perfil_id,
      ativo: user.ativo
    });
    setModalMode('edit');
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError(null);
  };

  // Atualizar dados do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        // Validar dados
        if (!formData.nome || !formData.email || !formData.password) {
          setError('Por favor, preencha todos os campos obrigatórios.');
          setLoading(false);
          return;
        }
        
        // Criar usuário
        const newUser = await userService.createUser({
          nome: formData.nome,
          email: formData.email,
          password: formData.password,
          telefone: formData.telefone,
          empresa: formData.empresa,
          cargo: formData.cargo,
          perfil_id: formData.perfil_id,
          ativo: formData.ativo
        });
        
        // Atualizar lista de usuários
        if (newUser) {
          setUsers(prev => [...prev, newUser]);
          setSuccess('Usuário criado com sucesso!');
          setShowModal(false);
        }
      } else if (modalMode === 'edit' && selectedUser) {
        // Validar dados
        if (!formData.nome) {
          setError('Por favor, preencha o nome do usuário.');
          setLoading(false);
          return;
        }
        
        // Atualizar usuário
        const updatedUser = await userService.updateUser(selectedUser.id, {
          nome: formData.nome,
          telefone: formData.telefone,
          empresa: formData.empresa,
          cargo: formData.cargo,
          perfil_id: formData.perfil_id,
          ativo: formData.ativo
        });
        
        // Atualizar lista de usuários
        if (updatedUser) {
          setUsers(prev => prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          ));
          setSuccess('Usuário atualizado com sucesso!');
          setShowModal(false);
        }
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async (user: CadEmpUser) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      await userService.deleteUser(user.id);
      
      // Atualizar lista de usuários
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setSuccess('Usuário excluído com sucesso!');
      
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setError(err.message || 'Erro ao excluir usuário. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  // Renderizar componente
  return (
    <UserManagementContainer>
      <Header>
        <Title>Gerenciamento de Usuários</Title>
        <Button onClick={handleOpenCreateModal}>Novo Usuário</Button>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {!authIsAdmin && !loading ? (
        <ErrorMessage>
          Você não tem permissão para acessar esta página.
          Apenas administradores podem gerenciar usuários.
        </ErrorMessage>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Empresa</Th>
                <Th>Cargo</Th>
                <Th>Perfil</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <Tr key={user.id}>
                  <Td>{user.nome}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.empresa || '-'}</Td>
                  <Td>{user.cargo || '-'}</Td>
                  <Td>
                    <Badge type={user.perfil?.tipo || 'user'}>
                      {user.perfil?.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge type={user.ativo ? 'active' : 'inactive'}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleOpenEditModal(user)}
                      style={{ marginRight: '8px' }}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => handleDeleteUser(user)}
                    >
                      Excluir
                    </Button>
                  </Td>
                </Tr>
              ))}
              
              {users.length === 0 && !loading && (
                <Tr>
                  <Td colSpan={7} style={{ textAlign: 'center' }}>
                    Nenhum usuário encontrado.
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </>
      )}
      
      {/* Modal para criar/editar usuário */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="nome">Nome*</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email*</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={modalMode === 'edit'}
                />
              </FormGroup>
              
              {modalMode === 'create' && (
                <FormGroup>
                  <Label htmlFor="password">Senha*</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              )}
              
              <FormGroup>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  type="text"
                  id="empresa"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="perfil_id">Perfil*</Label>
                <Select
                  id="perfil_id"
                  name="perfil_id"
                  value={formData.perfil_id}
                  onChange={handleInputChange}
                  required
                >
                  {perfis.map(perfil => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>
                  <Input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleInputChange}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  Usuário Ativo
                </Label>
              </FormGroup>
              
              <ActionButtons>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {modalMode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                </Button>
              </ActionButtons>
            </Form>
          </ModalContent>
        </Modal>
      )}
      
      {loading && (
        <LoadingOverlay>
          <div>Carregando...</div>
        </LoadingOverlay>
      )}
    </UserManagementContainer>
  );
};

export default UserManagement;
