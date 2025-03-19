import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { uploadFile, listFiles, deleteFile, getFileUrl, FileRecord } from '../services/fileService';
import { FileObject } from '../types/supabase';

export const useFiles = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);
  
  const fetchFiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const fileList = await listFiles(String(user.id));
      // Converter FileRecord[] para FileObject[] garantindo que todos os campos obrigatórios estejam presentes
      const fileObjects: FileObject[] = fileList.map(file => ({
        id: String(file.id || ''),  // Converter para string conforme exigido pelo tipo FileObject
        name: file.name,
        size: file.size,
        type: file.type,
        path: file.path,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        user_id: String(file.user_id),  // Converter para string conforme exigido pelo tipo FileObject
        url: '',  // Inicializa com string vazia, será preenchida quando necessário
        is_public: file.is_public
      }));
      setFiles(fileObjects);
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      showToast('Erro ao carregar arquivos', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpload = async (file: File) => {
    if (!user) return;
    
    try {
      setUploading(true);
      const newFileRecord = await uploadFile(file, String(user.id));
      
      // Converter o FileRecord para FileObject antes de adicionar ao state
      const newFileObject: FileObject = {
        id: String(newFileRecord.id || ''),
        name: newFileRecord.name,
        size: newFileRecord.size,
        type: newFileRecord.type,
        path: newFileRecord.path,
        created_at: newFileRecord.created_at || new Date().toISOString(),
        updated_at: newFileRecord.updated_at || new Date().toISOString(),
        user_id: String(newFileRecord.user_id),
        url: '', // Inicializa com string vazia
        is_public: newFileRecord.is_public
      };
      
      setFiles(prev => [newFileObject, ...prev]);
      showToast('Arquivo enviado com sucesso!');
      return newFileObject;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showToast('Erro ao enviar arquivo', 'error');
      throw error;
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      await deleteFile(fileId, filePath);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      showToast('Arquivo excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      showToast('Erro ao excluir arquivo', 'error');
      throw error;
    }
  };
  
  const getDownloadUrl = async (filePath: string) => {
    try {
      return await getFileUrl(filePath);
    } catch (error) {
      console.error('Erro ao obter URL de download:', error);
      showToast('Erro ao gerar link de download', 'error');
      throw error;
    }
  };
  
  return {
    files,
    loading,
    uploading,
    fetchFiles,
    handleUpload,
    handleDelete,
    getDownloadUrl
  };
};
