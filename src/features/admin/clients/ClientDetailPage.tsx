import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Client } from './types';

interface ClientDetailPageProps {
  clients: Client[];
  onDeleteClient: (clientId: string) => void;
}

const getStatusClass = (status: Client['status']) => {
  switch (status) {
    case 'Ativo': return 'bg-green-100 text-green-800';
    case 'Inativo': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ClientDetailPage = ({ clients, onDeleteClient }: ClientDetailPageProps) => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const client = clients.find(c => c.id === clientId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (client) {
      onDeleteClient(client.id);
      navigate('/clients');
    }
  };

  if (!client) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Cliente não encontrado!</h2>
        <Link to="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/clients" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de clientes
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">{client.companyName}</h2>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(client.status)}`}>
              {client.status}
            </span>
            <Link to={`/clients/${client.id}/edit`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
          <div><h3 className="text-sm font-medium text-gray-500">ID do Cliente</h3><p className="mt-1 text-lg text-gray-900">{client.id}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Tipo de Empresa</h3><p className="mt-1 text-lg text-gray-900">{client.type}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3><p className="mt-1 text-lg text-gray-900">{new Date(client.registrationDate).toLocaleDateString()}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Nome do Contato</h3><p className="mt-1 text-lg text-gray-900">{client.contactName}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">E-mail</h3><p className="mt-1 text-lg text-gray-900">{client.email}</p></div>
          <div><h3 className="text-sm font-medium text-gray-500">Telefone</h3><p className="mt-1 text-lg text-gray-900">{client.phone}</p></div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h3>
          {client.address ? (
            <div>
              <p className="text-lg text-gray-900">{client.address.street}</p>
              <p className="text-lg text-gray-900">{client.address.city}, {client.address.state} - {client.address.zipCode}</p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum endereço cadastrado.</p>
          )}
        </div>
      </div>
      
      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mt-4">
              Tem a certeza de que deseja apagar este cliente? Esta ação não pode ser desfeita.
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

export default ClientDetailPage;