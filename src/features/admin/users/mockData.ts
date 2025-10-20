import { User } from './types';

// Dados de exemplo para a lista de usuários
export const mockUsers: User[] = [
    {
        id: 'USR-001',
        name: 'Admin Master',
        email: 'admin.master@norterios.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2025-10-20T10:00:00Z'
    },
    {
        id: 'USR-002',
        name: 'Carlos Silva',
        email: 'carlos.silva@consultoria.com',
        role: 'Consultant',
        status: 'Active',
        lastLogin: '2025-10-19T15:30:00Z'
    },
    {
        id: 'USR-003',
        name: 'Sued Silva',
        email: 'sued.silva@norterios.com',
        role: 'Operational',
        status: 'Active',
        lastLogin: '2025-10-20T09:15:00Z'
    },
    {
        id: 'USR-004',
        name: 'Carlos Andrade',
        email: 'carlos.andrade@techsolutions.com',
        role: 'Client',
        status: 'Inactive',
        lastLogin: '2025-09-10T11:00:00Z'
    },
];