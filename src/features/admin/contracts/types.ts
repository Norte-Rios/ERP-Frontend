// Define a estrutura de dados para um cliente
export interface Client {
  id: string;
  companyName: string; // Nome da empresa/cliente
  contactName: string; // Nome do contato principal
  email: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
  registrationDate: string; // Data de cadastro
  type: 'Privada' | 'Pública';
  cnpj: string; // CNPJ da empresa
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// src/features/admin/contracts/types.ts

// Definindo os tipos baseados no seu formulário
export type PaymentMethod = 'Mensal' | 'Pagamento Único' | 'Parcelado';
export type HiringType = 'Privado' | 'Licitação' | 'Dispensa de Licitação';

export type ContractStatus = 'Em Negociação' | 'Ativo' | 'Inativo' | 'Pendente' | 'Concluído' | 'Expirado' | 'Aguardando Assinatura' | 'Rejeitado';

export interface ResponsibleContact {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
}

export interface Contract {
  id: string; // Necessário para a DetailPage, ListPage, etc.
  clientId: string;
  clientName: string; // Adicionado no seu handleSubmit
  title: string;
  startDate: string; // ou Date
  endDate: string; // ou Date
  manager: string;
  status: ContractStatus; // Adicionado no seu handleSubmit
  
  // Seção Financeira
  annualValue: number;
  paymentMethod: PaymentMethod;
  monthlyValue?: number; // É opcional no seu formulário

  // Detalhes da Contratação
  hiringType: HiringType;
  servicesDescription: string;

  // Contato
  responsibleContact: ResponsibleContact;
}