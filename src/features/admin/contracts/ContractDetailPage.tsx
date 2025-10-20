import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Contract } from './types';
import { X } from 'lucide-react';

interface ContractDetailPageProps {
  contracts: Contract[];
  onDeleteContract: (contractId: string) => void;
}

const getStatusClass = (status: Contract['status']) => {
  switch (status) {
    case 'Ativo': return 'bg-green-100 text-green-800';
    case 'Expirado': return 'bg-yellow-100 text-yellow-800';
    case 'Em Negociação': return 'bg-blue-100 text-blue-800';
    case 'Aguardando Assinatura': return 'bg-purple-100 text-purple-800';
    case 'Rejeitado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ContractDetailPage = ({ contracts, onDeleteContract }: ContractDetailPageProps) => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const contract = contracts.find(c => c.id === contractId);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (contract) {
      onDeleteContract(contract.id);
      navigate('/contracts');
    }
  };

  if (!contract) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Contrato não encontrado!</h2>
        <Link to="/contracts" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de contratos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/contracts" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de contratos
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{contract.title}</h2>
            <p className="text-lg text-gray-600 mt-1">{contract.clientName}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(contract.status)}`}>
              {contract.status}
            </span>
            <Link to={`/contracts/${contract.id}/edit`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">
              Editar
            </Link>
            <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold">
              Apagar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mt-6 pt-6 border-t">
          <div><h3 className="text-sm font-medium text-gray-500">ID do Contrato</h3><p className="mt-1 text-lg text-gray-900">{contract.id}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Data de Início</h3><p className="mt-1 text-lg text-gray-900">{new Date(contract.startDate).toLocaleDateString()}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Data de Fim</h3><p className="mt-1 text-lg text-gray-900">{new Date(contract.endDate).toLocaleDateString()}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Gestor do Contrato</h3><p className="mt-1 text-lg text-gray-900">{contract.manager}</p></div>
           <div><h3 className="text-sm font-medium text-gray-500">Tipo de Contratação</h3><p className="mt-1 text-lg text-gray-900">{contract.hiringType}</p></div>
        </div>

        <section className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Financeiras</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><h3 className="text-sm font-medium text-gray-500">Valor Anual</h3><p className="mt-1 text-2xl font-bold text-gray-900">R$ {contract.annualValue.toFixed(2)}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Forma de Pagamento</h3><p className="mt-1 text-lg text-gray-900">{contract.paymentMethod}</p></div>
            {contract.monthlyValue && <div><h3 className="text-sm font-medium text-gray-500">Valor Mensal</h3><p className="mt-1 text-lg text-gray-900">R$ {contract.monthlyValue.toFixed(2)}</p></div>}
          </div>
        </section>
        
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contato Responsável no Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><h3 className="text-sm font-medium text-gray-500">Nome</h3><p className="mt-1 text-lg text-gray-900">{contract.responsibleContact.name}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">E-mail</h3><p className="mt-1 text-lg text-gray-900">{contract.responsibleContact.email}</p></div>
            {contract.responsibleContact.phone && <div><h3 className="text-sm font-medium text-gray-500">Telefone</h3><p className="mt-1 text-lg text-gray-900">{contract.responsibleContact.phone}</p></div>}
            {contract.responsibleContact.whatsapp && <div><h3 className="text-sm font-medium text-gray-500">WhatsApp</h3><p className="mt-1 text-lg text-gray-900">{contract.responsibleContact.whatsapp}</p></div>}
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Serviços Incluídos no Contrato</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{contract.servicesDescription}</p>
        </div>
      </div>
       {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mt-4">
              Tem a certeza de que deseja apagar este contrato? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetailPage;