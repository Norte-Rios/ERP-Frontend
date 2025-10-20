import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ServiceProvider } from './types';
import { X } from 'lucide-react';

interface ProviderDetailPageProps {
  providers: ServiceProvider[];
  onUpdateProvider: (provider: ServiceProvider) => void;
  onDeleteProvider: (providerId: string) => void;
}

const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({ providers, onUpdateProvider, onDeleteProvider }) => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const provider = providers.find(p => p.id === providerId);

  const [newProfessional, setNewProfessional] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleAddProfessional = () => {
    if (provider && newProfessional.trim() !== '') {
      const updatedProvider = {
        ...provider,
        professionals: [...(provider.professionals || []), newProfessional.trim()],
      };
      onUpdateProvider(updatedProvider);
      setNewProfessional('');
    }
  };
  
  const handleRemoveProfessional = (professionalToRemove: string) => {
    if (provider) {
       const updatedProvider = {
        ...provider,
        professionals: provider.professionals?.filter(p => p !== professionalToRemove),
      };
      onUpdateProvider(updatedProvider);
    }
  };

  const handleConfirmDelete = () => {
    if (provider) {
      onDeleteProvider(provider.id);
      navigate('/providers');
    }
  };

  if (!provider) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Prestador de Serviço não encontrado!</h2>
        <Link to="/providers" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/providers" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de prestadores
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{provider.companyName}</h2>
            <p className="text-lg text-gray-600 mt-1">CNPJ: {provider.cnpj}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to={`/providers/${provider.id}/edit`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">
              Editar
            </Link>
             <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold">
              Apagar
            </button>
          </div>
        </div>

        {/* Informações de Contato e Endereço */}
        <section className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Informações Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><h3 className="text-sm font-medium text-gray-500">Contato Principal</h3><p className="mt-1 text-lg text-gray-900">{provider.contact.name}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">E-mail</h3><p className="mt-1 text-lg text-gray-900">{provider.contact.email}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Telefone</h3><p className="mt-1 text-lg text-gray-900">{provider.contact.phone}</p></div>
            <div className="md:col-span-2"><h3 className="text-sm font-medium text-gray-500">Endereço</h3><p className="mt-1 text-lg text-gray-900">{`${provider.address.street}, ${provider.address.city} - ${provider.address.state}`}</p></div>
          </div>
        </section>

        {/* Dados Bancários */}
        <section className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados Bancários para Pagamento</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><h3 className="text-sm font-medium text-gray-500">Banco</h3><p className="mt-1 text-lg text-gray-900">{provider.bankDetails?.bank || 'Não informado'}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500">Agência</h3><p className="mt-1 text-lg text-gray-900">{provider.bankDetails?.agency || 'Não informado'}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500">Conta</h3><p className="mt-1 text-lg text-gray-900">{provider.bankDetails?.account || 'Não informado'}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500">PIX</h3><p className="mt-1 text-lg text-gray-900">{provider.bankDetails?.pix || 'Não informado'}</p></div>
           </div>
        </section>
        
        {/* Catálogo de Serviços Oferecidos */}
        <section className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Catálogo de Serviços (Informado pelo Prestador)</h3>
          <div className="space-y-4">
            {(provider.offeredServices && provider.offeredServices.length > 0) ? (
              provider.offeredServices.map((service) => (
                <div key={service.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-800">{service.name}</h4>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R$ {service.value.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{service.billingType}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-semibold text-gray-600">Profissionais Qualificados:</h5>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      {service.professionals.map((prof, index) => (
                        <li key={index}>{prof}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum serviço cadastrado por este prestador.</p>
            )}
          </div>
        </section>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mt-4">
              Tem a certeza de que deseja apagar este prestador? Esta ação não pode ser desfeita.
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

export default ProviderDetailPage;