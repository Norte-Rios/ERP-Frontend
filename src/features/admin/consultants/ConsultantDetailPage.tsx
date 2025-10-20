import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Consultant } from './types';

interface ConsultantDetailPageProps {
  consultants: Consultant[];
  onDeleteConsultant: (consultantId: string) => void;
}

const ConsultantDetailPage: React.FC<ConsultantDetailPageProps> = ({ consultants, onDeleteConsultant }) => {
  const { consultantId } = useParams<{ consultantId: string }>();
  const navigate = useNavigate();
  const consultant = consultants.find(c => c.id === consultantId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (consultant) {
      onDeleteConsultant(consultant.id);
      navigate('/consultants');
    }
  };

  if (!consultant) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Consultor não encontrado!</h2>
        <Link to="/consultants" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de consultores
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/consultants" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de consultores
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{consultant.fullName}</h2>
            <p className="text-lg text-gray-600 mt-1">{consultant.specialty}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to={`/consultants/${consultant.id}/edit`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">
              Editar
            </Link>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold"
            >
              Apagar
            </button>
          </div>
        </div>

        {/* Informações Pessoais */}
        <section className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Informações Pessoais e de Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><h3 className="text-sm font-medium text-gray-500">CPF</h3><p className="mt-1 text-lg text-gray-900">{consultant.cpf}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">E-mail</h3><p className="mt-1 text-lg text-gray-900">{consultant.contact.email}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">WhatsApp</h3><p className="mt-1 text-lg text-gray-900">{consultant.contact.whatsapp}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Formação</h3><p className="mt-1 text-lg text-gray-900">{consultant.education}</p></div>
            <div className="md:col-span-2"><h3 className="text-sm font-medium text-gray-500">Endereço</h3><p className="mt-1 text-lg text-gray-900">{`${consultant.address.street}, ${consultant.address.city} - ${consultant.address.state}, ${consultant.address.zipCode}`}</p></div>
          </div>
        </section>

        {/* Informações de Trabalho e Pagamento */}
        <section className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Vínculo e Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><h3 className="text-sm font-medium text-gray-500">Tipo de Vínculo</h3><p className="mt-1 text-lg text-gray-900">{consultant.employmentType}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Tipo de Contrato</h3><p className="mt-1 text-lg text-gray-900">{consultant.contractType}</p></div>
            {consultant.paymentDetails.monthlySalary && (
              <div><h3 className="text-sm font-medium text-gray-500">Salário Mensal</h3><p className="mt-1 text-lg font-bold text-gray-900">R$ {consultant.paymentDetails.monthlySalary.toFixed(2)}</p></div>
            )}
            {consultant.paymentDetails.hourlyRate && (
              <div><h3 className="text-sm font-medium text-gray-500">Valor por Hora</h3><p className="mt-1 text-lg font-bold text-gray-900">R$ {consultant.paymentDetails.hourlyRate.toFixed(2)}</p></div>
            )}
          </div>
        </section>

        {/* Informações Bancárias */}
        <section className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados Bancários</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><h3 className="text-sm font-medium text-gray-500">Banco</h3><p className="mt-1 text-lg text-gray-900">{consultant.bankDetails.bank}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Agência</h3><p className="mt-1 text-lg text-gray-900">{consultant.bankDetails.agency}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Conta</h3><p className="mt-1 text-lg text-gray-900">{consultant.bankDetails.account}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">PIX</h3><p className="mt-1 text-lg text-gray-900">{consultant.bankDetails.pix}</p></div>
          </div>
        </section>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mt-4">
              Tem a certeza de que deseja apagar este consultor? Esta ação não pode ser desfeita.
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

export default ConsultantDetailPage;