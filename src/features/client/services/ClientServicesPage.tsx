import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Service } from '@/features/admin/services/types';
import { Client } from '@/features/admin/clients/types';
import { PlusCircle, Building, User, Search, Filter, X } from 'lucide-react';

// --- Componente do Modal de Solicitação de Serviço ---
const RequestServiceModal = ({ isOpen, onClose, initialType, allServices, currentClient, onAddService }) => {
  const [activeTab, setActiveTab] = useState(initialType);

  const [predefinedData, setPredefinedData] = useState({
    serviceDescription: allServices[0]?.description || '',
    startDate: '',
    endDate: '',
    type: 'Online' as Service['type'],
  });

  const [customData, setCustomData] = useState({
    serviceDescription: '',
    startDate: '',
    endDate: '',
    type: 'Online' as Service['type'],
  });
  
  // Atualiza a aba ativa se o tipo inicial mudar
  useEffect(() => {
    setActiveTab(initialType);
  }, [initialType]);

  if (!isOpen) return null;

  const handlePredefinedChange = (e) => {
    const { name, value } = e.target;
    setPredefinedData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e, type: 'predefined' | 'custom') => {
    e.preventDefault();
    const data = type === 'predefined' ? predefinedData : customData;
    
    if (!data.startDate || !data.endDate) {
        alert("Por favor, preencha as datas de início e fim.");
        return;
    }

    const newServiceRequest = {
      clientName: currentClient.companyName,
      description: data.serviceDescription,
      startDate: data.startDate,
      endDate: data.endDate,
      type: data.type,
      consultants: [],
      projectManager: '', // Será preenchido pelo admin
    };

    onAddService(newServiceRequest);
    alert('Solicitação de serviço enviada com sucesso!');
    onClose(); // Fecha o modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800">Solicitar Novo Serviço</h2>
                 <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <X className="h-6 w-6 text-gray-600" />
                 </button>
            </div>
           
            {/* Abas de Navegação */}
            <div className="mb-6 flex border-b">
                <button onClick={() => setActiveTab('predefined')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'predefined' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                Serviço Pré-definido
                </button>
                <button onClick={() => setActiveTab('custom')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'custom' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                Serviço Avulso
                </button>
            </div>

            {activeTab === 'predefined' && (
                <form onSubmit={(e) => handleSubmit(e, 'predefined')}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><Building size={20} /> Solicitar um serviço do nosso catálogo</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700">Selecione o Serviço</label>
                            <select name="serviceDescription" value={predefinedData.serviceDescription} onChange={handlePredefinedChange} className="mt-1 block w-full input-style" required>
                            {allServices.map(service => (
                                <option key={service.id} value={service.description}>{service.description}</option>
                            ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label><input type="date" name="startDate" value={predefinedData.startDate} onChange={handlePredefinedChange} className="mt-1 block w-full input-style" required /></div>
                            <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label><input type="date" name="endDate" value={predefinedData.endDate} onChange={handlePredefinedChange} className="mt-1 block w-full input-style" required /></div>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Formato</label>
                            <select name="type" value={predefinedData.type} onChange={handlePredefinedChange} className="mt-1 block w-full input-style">
                                <option>Online</option>
                                <option>Presencial</option>
                                <option>Híbrido</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">Enviar</button>
                    </div>
                </form>
            )}

            {activeTab === 'custom' && (
                <form onSubmit={(e) => handleSubmit(e, 'custom')}>
                     <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><User size={20} /> Descreva o serviço que precisa</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700">Descrição do Serviço</label>
                            <textarea name="serviceDescription" value={customData.serviceDescription} onChange={handleCustomChange} className="mt-1 block w-full input-style" rows={4} placeholder="Ex: Preciso de uma consultoria para otimização de processos de RH..." required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label><input type="date" name="startDate" value={customData.startDate} onChange={handleCustomChange} className="mt-1 block w-full input-style" required /></div>
                            <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label><input type="date" name="endDate" value={customData.endDate} onChange={handleCustomChange} className="mt-1 block w-full input-style" required /></div>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Formato</label>
                            <select name="type" value={customData.type} onChange={handleCustomChange} className="mt-1 block w-full input-style">
                                <option>Online</option>
                                <option>Presencial</option>
                                <option>Híbrido</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">Enviar</button>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
};

// --- Componente Principal da Página ---
const ClientServicesPage = ({ services, allServices, currentClient, onAddService }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'predefined' | 'custom'>('predefined');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const openModal = (type: 'predefined' | 'custom') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const getStatusClass = (status: Service['status']) => {
      switch (status) {
          case 'Em Andamento': return 'bg-blue-100 text-blue-800';
          case 'Pendente': return 'bg-yellow-100 text-yellow-800';
          case 'Concluído': return 'bg-green-100 text-green-800';
          case 'Cancelado': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  }

  const filteredServices = useMemo(() => {
    return services
      .filter(service => {
        if (filterStatus === 'Todos') return true;
        return service.status === filterStatus;
      })
      .filter(service => {
        const term = searchTerm.toLowerCase();
        return service.description.toLowerCase().includes(term) ||
               (service.id && service.id.toLowerCase().includes(term));
      });
  }, [services, searchTerm, filterStatus]);

  return (
    <div className="container mx-auto">
      <RequestServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
        allServices={allServices}
        currentClient={currentClient}
        onAddService={onAddService}
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Serviços</h1>

      {/* Cartões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button onClick={() => openModal('predefined')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:ring-2 hover:ring-indigo-400 transition-all text-left">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-full"><Building className="h-6 w-6 text-indigo-600" /></div>
                  <div>
                      <h2 className="font-bold text-gray-800">Solicitar Serviço do Catálogo</h2>
                      <p className="text-sm text-gray-600 mt-1">Selecione um dos nossos serviços pré-definidos.</p>
                  </div>
              </div>
          </button>
           <button onClick={() => openModal('custom')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:ring-2 hover:ring-teal-400 transition-all text-left">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-100 rounded-full"><User className="h-6 w-6 text-teal-600" /></div>
                  <div>
                      <h2 className="font-bold text-gray-800">Solicitar Serviço Avulso</h2>
                      <p className="text-sm text-gray-600 mt-1">Descreva uma necessidade específica para a sua empresa.</p>
                  </div>
              </div>
          </button>
      </div>

    {/* Filtros */}
    <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Buscar por ID ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option>Todos</option>
                <option>Pendente</option>
                <option>Em Andamento</option>
                <option>Concluído</option>
                <option>Cancelado</option>
            </select>
        </div>
    </div>

    {/* Lista de Serviços */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
            <Link to={`/client/services/${service.id}`} key={service.id} className="bg-white shadow-md rounded-lg p-6 flex flex-col hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">Serviço #{service.id}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>
                        {service.status}
                    </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 flex-grow">{service.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <p><strong>Gestor do Projeto:</strong> {service.projectManager || 'Aguardando'}</p>
                    <p><strong>Prazo:</strong> {new Date(service.startDate).toLocaleDateString()} - {new Date(service.endDate).toLocaleDateString()}</p>
                </div>
            </Link>
        ))}
    </div>
    {filteredServices.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            <p>Nenhum serviço encontrado com os filtros atuais.</p>
        </div>
    )}
    </div>
  );
};

export default ClientServicesPage;