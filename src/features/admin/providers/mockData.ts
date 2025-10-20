import { ServiceProvider } from './types';

// Dados de exemplo para a lista de prestadores de serviço (empresas)
export const mockServiceProviders: ServiceProvider[] = [
  {
    id: 'PROV-01',
    companyName: 'Alfa Treinamentos Corporativos Ltda.',
    cnpj: '11.222.333/0001-45',
    address: {
      street: 'Rua das Inovações, 789',
      city: 'Campinas',
      state: 'SP',
      zipCode: '13083-852',
    },
    contact: {
      name: 'Fernanda Oliveira',
      email: 'contato@alfatreinamentos.com',
      phone: '(19) 3344-5566',
    },
    offeredServices: [
      {
        id: 'OS-01',
        name: 'Treinamento de Liderança',
        billingType: 'Preço Fixo',
        value: 15000,
        professionals: ['Ricardo Mendes', 'Sofia Bernardes'],
      },
      {
        id: 'OS-02',
        name: 'Workshop de Vendas',
        billingType: 'Preço Fixo',
        value: 8000,
        professionals: ['Ricardo Mendes'],
      }
    ],
  },
  {
    id: 'PROV-02',
    companyName: 'Beta Soluções em TI',
    cnpj: '22.333.444/0001-56',
    address: {
      street: 'Avenida Digital, 1010',
      city: 'Recife',
      state: 'PE',
      zipCode: '50030-000',
    },
    contact: {
      name: 'Gustavo Pereira',
      email: 'gustavo.p@betasolucoes.dev',
      phone: '(81) 3030-4040',
    },
    offeredServices: [
       {
        id: 'OS-03',
        name: 'Desenvolvimento de Software',
        billingType: 'Por Hora',
        value: 220,
        professionals: ['Lucas Martins', 'Ana Pereira'],
      },
      {
        id: 'OS-04',
        name: 'Suporte Técnico Nível 2',
        billingType: 'Por Hora',
        value: 180,
        professionals: ['Lucas Martins'],
      }
    ],
  },
];