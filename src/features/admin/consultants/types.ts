// Define a estrutura de dados para um consultor ou prestador de serviço
export interface Consultant {
  id: string;
  fullName: string;
  cpf: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  education: string; // Formação
  specialty: string; // Especialidade
  contact: {
    email: string;
    whatsapp: string;
  };
  bankDetails: {
    bank: string;
    agency: string;
    account: string;
    pix: string;
  };
  employmentType: 'Fixo' | 'Sob Demanda'; // Tipo de vínculo
  paymentDetails: {
    monthlySalary?: number; // Salário para consultor fixo
    hourlyRate?: number;    // Valor por hora para sob demanda
  };
  contractType: 'Contrato' | 'Outro'; // Tipo de vínculo contratual
}
