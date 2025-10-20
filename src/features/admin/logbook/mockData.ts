import { LogEntry, Announcement } from './types';

// Dados de exemplo para os anúncios no topo da página
export const mockAnnouncements: Announcement[] = [
    {
        id: 'ANNOUNCE-1',
        title: 'Reunião Geral da Equipa na Sexta-feira',
        text: 'Lembrete: a nossa reunião trimestral será nesta sexta-feira às 10:00. A presença de todos é fundamental para alinharmos as metas do próximo trimestre.',
        author: 'Admin',
        createdAt: '2025-10-03T14:00:00Z'
    },
    {
        id: 'ANNOUNCE-2',
        title: 'Atualização do Sistema ERP',
        text: 'O sistema ERP será atualizado no próximo domingo à noite. É esperado que fique indisponível por aproximadamente 2 horas.',
        author: 'Admin',
        createdAt: '2025-10-02T11:00:00Z'
    }
];

// Dados de exemplo para as entradas do Diário de Bordo
export const mockLogEntries: LogEntry[] = [
    {
        id: 'LOG-1',
        author: {
            id: 'CON-001',
            name: 'Carlos Silva',
            avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
        },
        text: 'Iniciei a revisão da proposta para a Tech Solutions Ltda. A primeira versão deve estar pronta para feedback interno amanhã ao final do dia.',
        createdAt: '2025-10-04T13:30:00Z',
        comments: [
            {
                id: 'COMMENT-1',
                author: {
                    id: 'CON-002',
                    name: 'Beatriz Lima',
                    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e'
                },
                text: 'Ótimo, Carlos! Quando tiveres a primeira versão, avisa-me para eu dar uma olhada na parte pedagógica.',
                createdAt: '2025-10-04T14:15:00Z'
            }
        ]
    },
    {
        id: 'LOG-2',
        author: {
            id: 'ADMIN',
            name: 'Admin',
            avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f'
        },
        text: 'Pessoal, encontrei um artigo muito interessante sobre as novas tendências em gestão de projetos ágeis. Vale a pena a leitura: [link para o artigo]',
        createdAt: '2025-10-04T11:00:00Z',
        comments: []
    },
    {
        id: 'LOG-3',
        author: {
            id: 'CON-002',
            name: 'Beatriz Lima',
            avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e'
        },
        text: 'Alguém tem o contacto atualizado do Daniel Faria do Varejo Global? Preciso de alinhar uma visita para a próxima semana.',
        createdAt: '2025-10-03T16:00:00Z',
        comments: [
            {
                id: 'COMMENT-2',
                author: {
                    id: 'ADMIN',
                    name: 'Admin',
                    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f'
                },
                text: 'Já te enviei por mensagem privada, Beatriz!',
                createdAt: '2025-10-03T16:05:00Z'
            }
        ]
    }
];
