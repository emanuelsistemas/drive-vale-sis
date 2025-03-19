// Tipos dedicados sem nenhuma referência ao Supabase
// Estes tipos serão utilizados para simular objetos no frontend

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface FileObject {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  url: string;
  is_public: boolean;
  description?: string;
  tags?: string[];
}

export interface FileShare {
  id: string;
  file_id: string;
  shared_with: string;
  created_at: string;
  expires_at: string | null;
  permission: 'read' | 'write';
}
