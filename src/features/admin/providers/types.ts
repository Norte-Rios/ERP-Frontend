// Define um serviço específico oferecido por um prestador
export interface OfferedService {
  id: string;
  name: string; // Ex: "Desenvolvimento de Software", "Suporte Técnico Nível 2"
  billingType: 'Por Hora' | 'Preço Fixo';
  value: number; // Valor (por hora ou do projeto)
  professionals: string[]; // Profissionais desta empresa que executam este serviço
}

// Define a estrutura para uma empresa prestadora de serviço (Pessoa Jurídica)
export interface ServiceProvider {
  id: string;
  companyName: string;
  cnpj: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  // A lista de profissionais foi substituída por um catálogo de serviços
  offeredServices: OfferedService[]; 
  professionals: string[]; // <-- ADICIONE ESTA
  bankDetails: {          // <-- ADICIONE ESTE OBJETO
    bank: string;
    agency: string;
    account: string;
    pix: string;
  };
}