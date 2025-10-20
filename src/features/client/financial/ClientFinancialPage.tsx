import React from 'react';
import { Contract } from '@/features/admin/contracts/types';
import { RevenueTransaction } from '@/features/admin/financial/types';
import { FileText, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientFinancialPageProps {
  contracts: Contract[];
  revenues: RevenueTransaction[];
}

const getStatusClass = (status: Contract['status'] | RevenueTransaction['status']) => {
  switch (status) {
    case 'Ativo':
    case 'Recebido':
      return 'bg-green-100 text-green-800';
    case 'Expirado':
    case 'Pendente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Atrasado':
      return 'bg-red-100 text-red-800';
    case 'Em Negociação':
    case 'Aguardando Assinatura':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRevenueStatusIcon = (status: RevenueTransaction['status']) => {
    switch (status) {
        case 'Recebido': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Pendente': return <Clock className="h-5 w-5 text-yellow-500" />;
        case 'Atrasado': return <AlertTriangle className="h-5 w-5 text-red-500" />;
        default: return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ClientFinancialPage: React.FC<ClientFinancialPageProps> = ({ contracts, revenues }) => {
  return (
    <div className="container mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Minhas Finanças</h1>

      {/* Seção de Contratos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Meus Contratos</h2>
        <div className="space-y-6">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{contract.title}</h3>
                  <p className="text-sm text-gray-500">Contrato #{contract.id}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full mt-2 sm:mt-0 ${getStatusClass(contract.status)}`}>
                  {contract.status}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Valor Anual</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(contract.annualValue)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Pagamento</p>
                  <p className="font-semibold text-gray-800">{contract.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Início</p>
                  <p className="font-semibold text-gray-800">{new Date(contract.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Fim</p>
                  <p className="font-semibold text-gray-800">{new Date(contract.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
           {contracts.length === 0 && <p className="text-gray-500 bg-white p-6 rounded-lg shadow-md">Nenhum contrato ativo.</p>}
        </div>
      </div>

      {/* Seção de Faturas/Receitas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Minhas Faturas</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {revenues.map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{revenue.description}</td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{formatCurrency(revenue.value)}</td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{new Date(revenue.dueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(revenue.status)}`}>
                      {getRevenueStatusIcon(revenue.status)}
                      {revenue.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {revenues.length === 0 && <p className="p-6 text-center text-gray-500">Nenhuma fatura encontrada.</p>}
        </div>
      </div>
    </div>
  );
};

export default ClientFinancialPage;