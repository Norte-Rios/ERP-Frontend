import { Service } from './types';

export const mockServices: Service[] = [
  {
    id: 'S001',
    clientName: 'Tech Solutions Ltda.',
    projectManager: 'Ana Costa',
    status: 'Em Andamento',
    startDate: '2024-08-01',
    endDate: '2024-09-15',
    type: 'Presencial',
    description: 'Implementação de sistema ERP completo. Foco em módulos de finanças e RH.',
    consultants: ['Carlos Silva', 'Beatriz Lima'],
    costs: {
      travel: 1200.50,
      accommodation: 3500.00,
      food: 850.75,
      transport: 300.00,
    },
    workPlan: {
      status: 'Aprovado',
      content: 'Fase 1: Levantamento de requisitos (1 semana).\nFase 2: Configuração do ambiente (1 semana).\nFase 3: Desenvolvimento e customização (4 semanas).\nFase 4: Treinamento e Go-live (2 semanas).',
      feedback: 'Plano bem estruturado. Aprovado para início imediato.'
    }
  },
  {
    id: 'S002',
    clientName: 'Inova Marketing Digital',
    projectManager: 'Pedro Martins',
    status: 'Concluído',
    startDate: '2024-07-10',
    endDate: '2024-07-30',
    type: 'Online',
    description: 'Consultoria de SEO e análise de concorrência para novo website.',
    consultants: ['Carlos Silva'],
    costs: {},
    workPlan: {
      status: 'Aprovado',
      content: 'Análise de palavras-chave, otimização on-page e relatório final de desempenho.',
    },
    finalReport: {
        submittedBy: 'Carlos Silva',
        content: 'O projeto de SEO foi um sucesso. A análise de concorrência revelou oportunidades chave e a otimização on-page resultou numa melhoria de 20% no ranking orgânico para as palavras-chave alvo.',
        submittedAt: '2025-07-31T10:00:00Z',
        fileUrl: '#',
        status: 'Aprovado'
    }
  },
  {
    id: 'S003',
    clientName: 'Varejo Global S.A.',
    projectManager: 'Sofia Alves',
    status: 'Pendente',
    startDate: '2024-09-01',
    endDate: '2024-10-10',
    type: 'Híbrido',
    description: 'Treinamento de equipes de vendas e otimização de processos de loja.',
    consultants: ['Carlos Silva'],
    costs: {
      travel: 800.00,
      accommodation: 1500.00,
    },
    workPlan: {
      status: 'Pendente de Aprovação',
      content: 'Esboço inicial do plano de treinamento a ser detalhado após alinhamento com a equipe do cliente.',
    }
  },
  {
    id: 'S004',
    clientName: 'Health First Farmacêutica',
    projectManager: 'Lucas Gomes',
    status: 'Cancelado',
    startDate: '2024-08-05',
    endDate: '2024-08-20',
    type: 'Presencial',
    description: 'Auditoria de conformidade com normas da Anvisa.',
    consultants: ['Ricardo Oliveira'],
    costs: {},
    workPlan: {
      status: 'Rejeitado',
      content: 'Proposta inicial de auditoria focada apenas nos processos de laboratório.',
      feedback: 'Plano rejeitado. É necessário incluir a auditoria dos processos de armazenamento e logística conforme solicitado no escopo.'
    }
  },
  {
    id: 'S005',
    clientName: 'Nova Consultoria',
    projectManager: '', // Sem gestor
    status: 'Concluído',
    startDate: '2025-08-01',
    endDate: '2025-08-30',
    type: 'Online',
    description: 'Análise de mercado para novo produto.',
    consultants: ['Carlos Silva'], // Apenas um consultor
    costs: {},
    workPlan: {
      status: 'Aprovado',
      content: 'Fase 1: Pesquisa. Fase 2: Análise. Fase 3: Apresentação.',
    },
    finalReport: {
        submittedBy: 'Carlos Silva',
        content: 'O relatório inicial está pronto, mas preciso de mais dados sobre o público-alvo.',
        submittedAt: '2025-08-31T14:00:00Z',
        status: 'Pendente de Análise'
    }
  },
];