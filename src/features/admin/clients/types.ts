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
  contractIds: string[]; // Novo: Lista de IDs de contratos associados
}