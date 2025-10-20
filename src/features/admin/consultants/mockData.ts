import { Consultant } from './types';

// Dados de exemplo para a lista de consultores
export const mockConsultants: Consultant[] = [
  {
    id: 'CON-001',
    fullName: 'Carlos Silva',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Palmeiras, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01530-010',
    },
    education: 'Mestrado em Administração Pública',
    specialty: 'Especialista em Licitações e Contratos Governamentais.',
    contact: {
      email: 'carlos.silva@consultoria.com',
      whatsapp: '(11) 99999-1111',
    },
    bankDetails: {
      bank: 'Banco do Brasil',
      agency: '0001',
      account: '12345-6',
      pix: '123.456.789-00',
    },
    employmentType: 'Fixo',
    paymentDetails: {
      monthlySalary: 8500.00,
    },
    contractType: 'Contrato',
  },
  {
    id: 'CON-002',
    fullName: 'Beatriz Lima',
    cpf: '987.654.321-99',
    address: {
      street: 'Avenida Copacabana, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22020-001',
    },
    education: 'Pós-graduação em Gestão de Pessoas',
    specialty: 'Especialista em Treinamento de Professores e Metodologias Ativas.',
    contact: {
      email: 'beatriz.lima@email.com',
      whatsapp: '(21) 98888-2222',
    },
    bankDetails: {
      bank: 'Itaú Unibanco',
      agency: '0002',
      account: '65432-1',
      pix: 'beatriz.lima@email.com',
    },
    employmentType: 'Sob Demanda',
    paymentDetails: {
      hourlyRate: 150.00,
    },
    contractType: 'Outro',
  },
];