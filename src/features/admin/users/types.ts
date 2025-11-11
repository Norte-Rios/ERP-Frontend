export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin master' | 'Admin comum' | 'operational' | 'Consultant' | 'Client';
  status: 'ativo' | 'inativo';
  lastLogin: string;
}