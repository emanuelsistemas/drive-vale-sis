import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Header, 
  Content, 
  Sidebar, 
  MainContent,
  UserInfo,
  LogoutButton,
  UploadButton,
  FileList,
  FileItem,
  EmptyState,
  TerminalLine
} from './styles';

// Importação centralizada dos componentes
import { Logo, Button } from '../../components';

// Importação dos contextos e hooks
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useFiles } from '../../hooks/useFiles';
import { FileObject } from '../../types/supabase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const { 
    files, 
    loading, 
    uploading, 
    handleUpload, 
    handleDelete,
    getDownloadUrl 
  } = useFiles();
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      showToast('Erro ao fazer logout', 'error');
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    try {
      await handleUpload(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
  };
  
  const handleFileDelete = async (fileId: string, filePath: string) => {
    try {
      await handleDelete(fileId, filePath);
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
    }
  };
  
  const handleDownload = async (fileId: string, filePath: string) => {
    try {
      setDownloadingId(fileId);
      const url = await getDownloadUrl(filePath);
      
      // Criar um link temporário para download
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    } finally {
      setDownloadingId(null);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <Container>
      <Header>
        <Logo />
        <UserInfo>
          <span>{user?.email}</span>
          <LogoutButton onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </LogoutButton>
        </UserInfo>
      </Header>
      
      <Content>
        <Sidebar>
          <TerminalLine>
            <span className="prompt">root@valeterm:~$</span> ls -la
          </TerminalLine>
          
          <label htmlFor="file-upload">
            <UploadButton as="span" disabled={uploading}>
              <i className="fas fa-upload"></i> {uploading ? 'Enviando...' : 'Upload'}
            </UploadButton>
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </Sidebar>
        
        <MainContent>
          <h2>Meus Arquivos</h2>
          
          {loading ? (
            <p>Carregando...</p>
          ) : files.length > 0 ? (
            <FileList>
              {files.map((file: FileObject) => (
                <FileItem key={file.id}>
                  <div className="file-icon">
                    <i className={`fas ${getFileIcon(file.type || file.name)}`}></i>
                  </div>
                  <div className="file-info">
                    <h3>{file.name}</h3>
                    <p>{formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="file-actions">
                    <button 
                      title="Download" 
                      onClick={() => handleDownload(file.id, file.path)}
                      disabled={downloadingId === file.id}
                    >
                      <i className={`fas ${downloadingId === file.id ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                    </button>
                    <button title="Compartilhar">
                      <i className="fas fa-share-alt"></i>
                    </button>
                    <button 
                      title="Excluir" 
                      onClick={() => handleFileDelete(file.id, file.path)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </FileItem>
              ))}
            </FileList>
          ) : (
            <EmptyState>
              <i className="fas fa-folder-open"></i>
              <p>Nenhum arquivo encontrado</p>
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
              >
                Fazer Upload
              </Button>
            </EmptyState>
          )}
        </MainContent>
      </Content>
    </Container>
  );
};

// Função auxiliar para determinar o ícone com base no tipo de arquivo
const getFileIcon = (fileTypeOrName: string): string => {
  const fileType = fileTypeOrName.toLowerCase();
  
  if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(fileType)) {
    return 'fa-file-image';
  } else if (fileType.includes('pdf') || /\.pdf$/i.test(fileType)) {
    return 'fa-file-pdf';
  } else if (fileType.includes('word') || /\.(doc|docx)$/i.test(fileType)) {
    return 'fa-file-word';
  } else if (fileType.includes('excel') || /\.(xls|xlsx|csv)$/i.test(fileType)) {
    return 'fa-file-excel';
  } else if (fileType.includes('video') || /\.(mp4|avi|mov|wmv)$/i.test(fileType)) {
    return 'fa-file-video';
  } else if (fileType.includes('audio') || /\.(mp3|wav|ogg)$/i.test(fileType)) {
    return 'fa-file-audio';
  } else if (fileType.includes('zip') || fileType.includes('compressed') || /\.(zip|rar|7z|tar|gz)$/i.test(fileType)) {
    return 'fa-file-archive';
  } else if (fileType.includes('code') || /\.(html|css|js|jsx|ts|tsx|php|py|java|c|cpp)$/i.test(fileType)) {
    return 'fa-file-code';
  } else {
    return 'fa-file';
  }
};

export default Dashboard;
