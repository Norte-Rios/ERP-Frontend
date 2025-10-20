// Define a estrutura para uma única transação de receita
export interface RevenueTransaction {
  id: string;
  description: string; // Ex: "Contrato de Suporte ERP"
  clientId: string;
  clientName: string;
  contractId: string;
  value: number;
  dueDate: string; // Data de vencimento
  paymentDate?: string; // Data que foi pago
  status: 'Recebido' | 'Pendente' | 'Atrasado';
  paymentMethod: 'Anual' | 'Parcelado' | 'À vista' | 'Mensal';
}

// Define a estrutura para uma despesa
export interface Expense {
    id: string;
    description: string;
    category: 'Passagens Aéreas' | 'Transportes Terrestres' | 'Hospedagem' | 'Alimentação' | 'Compras Avulsas';
    value: number;
    date: string;
    consultantId?: string; // Quem realizou a despesa
    provider?: string; // Fornecedor
    paymentMethod: 'Cartão de Crédito' | 'Transferência' | 'PIX' | 'Dinheiro';
}

// NOVO: Define a estrutura para um pagamento a ser realizado (saída)
export interface Payment {
    id: string;
    payee: { // Favorecido
        id: string;
        name: string;
        type: 'Consultor' | 'Prestador';
    };
    description: string;
    value: number;
    dueDate: string; // Data de vencimento
    paymentDate?: string; // Data em que foi pago
    status: 'Pago' | 'Pendente' | 'Agendado' | 'Atrasado';
}