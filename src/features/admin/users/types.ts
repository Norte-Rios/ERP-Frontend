export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin Master' | 'Admin' | 'Operational' | 'Consultant' | 'Client';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}