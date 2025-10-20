import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/features/admin/services/types';
import { Client } from '@/features/admin/clients/types';
import { Briefcase, Edit } from 'lucide-react';

interface RequestServicePageProps {
  allServices: Service[];
  currentClient: Client;
  onAddService: (service: Omit<Service, 'id' | 'status'>) => void;
}

const RequestServicePage: React.FC<RequestServicePageProps> = ({ allServices, currentClient, onAddService }) => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<'predefined' | 'custom'>('predefined');
  
  // Estado para o formulário de serviços pré-definidos
  const [predefinedData, setPredefinedData] = useState({
    serviceId: allServices[0]?.id || '',
    startDate: '',
    endDate: '',
    type: 'Online' as Service['type'],
  });

  // Estado para o formulário de serviços avulsos
  const [customData, setCustomData] = useState({
    description: '',
    startDate: '',
    endDate: '',
    type: 'Online' as Service['type'],
  });
  
  const handlePredefinedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = allServices.find(s => s.id === predefinedData.serviceId);
    if (!selectedService || !predefinedData.startDate || !predefinedData.endDate) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    
    onAddService({
        clientName: currentClient.companyName,
        description: selectedService.description, // Usamos a descrição do serviço selecionado
        startDate: predefinedData.startDate,
        endDate: predefinedData.endDate,
        type: predefinedData.type,
        consultants: [],
    });

    navigate('/client/services');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!customData.description || !customData.startDate || !customData.endDate) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    
    onAddService({
        clientName: currentClient.companyName,
        description: customData.description, // Usamos a descrição personalizada
        startDate: customData.startDate,
        endDate: customData.endDate,
        type: customData.type,
        consultants: [],
    });
    
    navigate('/client/services');
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Solicitar Novo Serviço</h1>
      
      {/* Seletor de Tipo de Formulário */}
      <div className="mb-6 flex justify-center bg-gray-200 rounded-lg p-1">
        <button 
          onClick={() => setFormType('predefined')}
          className={`w-1/2 px-4 py-2 rounded-md font-semibold transition-colors ${formType === 'predefined' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
        >
          Serviço Pré-definido
        </button>
        <button 
          onClick={() => setFormType('custom')}
          className={`w-1/2 px-4 py-2 rounded-md font-semibold transition-colors ${formType === 'custom' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
        >
          Serviço Avulso
        </button>
      </div>

      {/* Formulário de Serviços Pré-definidos */}
      {formType === 'predefined' && (
        <form onSubmit={handlePredefinedSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 animate-fade-in">
           <div className="flex items-center gap-3 text-lg font-semibold text-gray-700">
                <Briefcase />
                <span>Solicitar um serviço do nosso catálogo</span>
           </div>
          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">Selecione o Serviço</label>
            <select name="serviceId" id="serviceId" value={predefinedData.serviceId} onChange={e => setPredefinedData({...predefinedData, serviceId: e.target.value})} className="mt-1 block w-full input-style" required>
              {allServices.map(service => (
                <option key={service.id} value={service.id}>{service.description}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="predefined_startDate" className="block text-sm font-medium text-gray-700">Data de Início desejada</label>
              <input type="date" name="startDate" id="predefined_startDate" value={predefinedData.startDate} onChange={e => setPredefinedData({...predefinedData, startDate: e.target.value})} className="mt-1 block w-full input-style" required />
            </div>
            <div>
              <label htmlFor="predefined_endDate" className="block text-sm font-medium text-gray-700">Data de Fim desejada</label>
              <input type="date" name="endDate" id="predefined_endDate" value={predefinedData.endDate} onChange={e => setPredefinedData({...predefinedData, endDate: e.target.value})} className="mt-1 block w-full input-style" required />
            </div>
          </div>
          <div>
            <label htmlFor="predefined_type" className="block text-sm font-medium text-gray-700">Formato do Serviço</label>
            <select name="type" id="predefined_type" value={predefinedData.type} onChange={e => setPredefinedData({...predefinedData, type: e.target.value as Service['type']})} className="mt-1 block w-full input-style">
              <option>Online</option>
              <option>Presencial</option>
              <option>Híbrido</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Enviar Solicitação</button>
          </div>
        </form>
      )}

      {/* Formulário de Serviço Avulso */}
      {formType === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 animate-fade-in">
             <div className="flex items-center gap-3 text-lg font-semibold text-gray-700">
                <Edit />
                <span>Descreva o serviço que precisa</span>
           </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descreva o serviço que você precisa</label>
            <textarea name="description" id="description" value={customData.description} onChange={e => setCustomData({...customData, description: e.target.value})} rows={4} className="mt-1 block w-full input-style" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="custom_startDate" className="block text-sm font-medium text-gray-700">Data de Início desejada</label>
              <input type="date" name="startDate" id="custom_startDate" value={customData.startDate} onChange={e => setCustomData({...customData, startDate: e.target.value})} className="mt-1 block w-full input-style" required />
            </div>
            <div>
              <label htmlFor="custom_endDate" className="block text-sm font-medium text-gray-700">Data de Fim desejada</label>
              <input type="date" name="endDate" id="custom_endDate" value={customData.endDate} onChange={e => setCustomData({...customData, endDate: e.target.value})} className="mt-1 block w-full input-style" required />
            </div>
          </div>
          <div>
            <label htmlFor="custom_type" className="block text-sm font-medium text-gray-700">Formato do Serviço</label>
            <select name="type" id="custom_type" value={customData.type} onChange={e => setCustomData({...customData, type: e.target.value as Service['type']})} className="mt-1 block w-full input-style">
              <option>Online</option>
              <option>Presencial</option>
              <option>Híbrido</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Enviar Solicitação</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RequestServicePage;