import { User } from './types';

// Dados de exemplo para a lista de usuários
export const mockUsers: User[] = [
    {
        id: 'USR-001',
        nome: 'Admin Master',
        email: 'admin.master@norterios.com',
        role: 'admin master',
        status: 'ativo',
        lastLogin: '2025-10-20T10:00:00Z'
    },
    {
        id: 'USR-002',
        nome: 'Carlos Silva',
        email: 'carlos.silva@consultoria.com',
        role: 'Consultant',
        status: 'ativo',
        lastLogin: '2025-10-19T15:30:00Z'
    },
    {
        id: 'USR-003',
        nome: 'Sued Silva',
        email: 'sued.silva@norterios.com',
        role: 'operational',
        status: 'ativo',
        lastLogin: '2025-10-20T09:15:00Z'
    },
    {
        id: 'USR-004',
        nome: 'Carlos Andrade',
        email: 'carlos.andrade@techsolutions.com',
        role: 'Client',
        status: 'inativo',
        lastLogin: '2025-09-10T11:00:00Z'
    },
];