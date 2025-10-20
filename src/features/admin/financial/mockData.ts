import { RevenueTransaction, Expense, Payment } from './types';

// Dados de exemplo para as receitas (entradas)
export const mockRevenues: RevenueTransaction[] = [
  {
    id: 'REC-001',
    description: 'Contrato de Suporte ERP - Jan/25',
    clientId: 'C01',
    clientName: 'Tech Solutions Ltda.',
    contractId: 'CTR-001',
    value: 5000,
    dueDate: '2025-01-10',
    paymentDate: '2025-01-08',
    status: 'Recebido',
    paymentMethod: 'Mensal'
  },
  {
    id: 'REC-002',
    description: 'Plataforma EAD - Parcela 1/3',
    clientId: 'C02',
    clientName: 'Secretaria de Educação Municipal',
    contractId: 'CTR-002',
    value: 40000,
    dueDate: '2025-03-15',
    status: 'Pendente',
    paymentMethod: 'Parcelado'
  },
  {
    id: 'REC-003',
    description: 'Contrato de Suporte ERP - Fev/25',
    clientId: 'C01',
    clientName: 'Tech Solutions Ltda.',
    contractId: 'CTR-001',
    value: 5000,
    dueDate: '2025-02-10',
    status: 'Atrasado',
    paymentMethod: 'Mensal'
  },
];

// Dados de exemplo para as despesas (custos)
export const mockExpenses: Expense[] = [
    {
        id: 'DESP-001',
        description: 'Voo São Paulo - Rio de Janeiro para reunião',
        category: 'Passagens Aéreas',
        value: 450.70,
        date: '2025-08-01',
        consultantId: 'CON-001',
        provider: 'GOL Linhas Aéreas',
        paymentMethod: 'Cartão de Crédito'
    },
    {
        id: 'DESP-002',
        description: 'Hospedagem para projeto Tech Solutions',
        category: 'Hospedagem',
        value: 1200.00,
        date: '2025-08-05',
        consultantId: 'CON-001',
        provider: 'Hotel Ibis',
        paymentMethod: 'Cartão de Crédito'
    },
    {
        id: 'DESP-003',
        description: 'Almoço com cliente Varejo Global',
        category: 'Alimentação',
        value: 180.50,
        date: '2025-08-15',
        consultantId: 'CON-002',
        provider: 'Restaurante Fogo de Chão',
        paymentMethod: 'Cartão de Crédito'
    }
];

// NOVO: Dados de exemplo para os pagamentos a serem realizados
export const mockPayments: Payment[] = [
    {
        id: 'PAG-001',
        payee: { id: 'CON-001', name: 'Carlos Silva', type: 'Consultor' },
        description: 'Salário Mensal - Setembro/2025',
        value: 8500.00,
        dueDate: '2025-10-05',
        status: 'Pendente'
    },
    {
        id: 'PAG-002',
        payee: { id: 'PROV-01', name: 'Alfa Treinamentos', type: 'Prestador' },
        description: 'Pagamento Workshop de Vendas',
        value: 8000.00,
        dueDate: '2025-09-20',
        paymentDate: '2025-09-18',
        status: 'Pago'
    },
    {
        id: 'PAG-003',
        payee: { id: 'CON-002', name: 'Beatriz Lima', type: 'Consultor' },
        description: 'Adiantamento Projeto SEM',
        value: 2500.00,
        dueDate: '2025-09-25',
        status: 'Agendado'
    },
    {
        id: 'PAG-004',
        payee: { id: 'CON-001', name: 'Carlos Silva', type: 'Consultor' },
        description: 'Salário Mensal - Agosto/2025',
        value: 8500.00,
        dueDate: '2025-09-05',
        status: 'Atrasado'
    }
];