export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin master' | 'Admin' | 'operational' | 'Consultant' | 'Client';
  status: 'ativo' | 'inativo';
  lastLogin: string;
}