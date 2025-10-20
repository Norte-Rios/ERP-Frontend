import { Contract } from './types';

// Dados de exemplo para a lista de contratos, agora com todos os detalhes
export const mockContracts: Contract[] = [
  {
    id: 'CTR-001',
    clientId: 'C01',
    clientName: 'Tech Solutions Ltda.',
    title: 'Contrato de Suporte e Manutenção ERP',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Ativo',
    manager: 'João Pereira',
    annualValue: 60000,
    paymentMethod: 'Mensal',
    monthlyValue: 5000,
    hiringType: 'Privado',
    servicesDescription: 'Suporte técnico contínuo para o sistema ERP, incluindo atualizações e correção de bugs.',
    responsibleContact: {
      name: 'Ana Silva',
      email: 'ana.silva@techsolutions.com',
      whatsapp: '(11) 91111-2222'
    }
  },
  {
    id: 'CTR-002',
    clientId: 'C02',
    clientName: 'Secretaria de Educação Municipal',
    title: 'Consultoria para Implementação de Plataforma EAD',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    status: 'Aguardando Assinatura',
    manager: 'Mariana Lima',
    annualValue: 120000,
    paymentMethod: 'Parcelado',
    hiringType: 'Licitação',
    servicesDescription: 'Planeamento e execução da plataforma de ensino a distância para a rede municipal.',
    responsibleContact: {
      name: 'Roberto Campos',
      email: 'roberto.campos@sem.gov.br',
      phone: '(21) 2233-4455'
    }
  },
  {
    id: 'CTR-003',
    clientId: 'C03',
    clientName: 'Varejo Global S.A.',
    title: 'Implementação de Novo Sistema de Vendas',
    startDate: '2024-08-15',
    endDate: '2025-02-15',
    status: 'Em Negociação',
    manager: 'João Pereira',
    annualValue: 250000,
    paymentMethod: 'Pagamento Único',
    hiringType: 'Privado',
    servicesDescription: 'Desenvolvimento e implementação de um novo sistema de ponto de venda (PDV) para todas as lojas.',
    responsibleContact: {
      name: 'Carla Dias',
      email: 'carla.dias@varejoglobal.com',
    }
  },
];