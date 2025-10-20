import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client } from '../clients/types';
import { Contract } from './types';

interface AddContractPageProps {
  clients: Client[];
  onAddContract: (contract: Omit<Contract, 'id'>) => void;
}

const AddContractPage = ({ clients, onAddContract }: AddContractPageProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    title: '',
    startDate: '',
    endDate: '',
    manager: '',
    annualValue: 0,
    paymentMethod: 'Mensal' as Contract['paymentMethod'],
    monthlyValue: 0,
    hiringType: 'Privado' as Contract['hiringType'],
    servicesDescription: '',
    responsibleContact: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'annualValue' || name === 'monthlyValue') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      responsibleContact: {
        ...prev.responsibleContact,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientName = clients.find(c => c.id === formData.clientId)?.companyName || 'Cliente não encontrado';
    
    onAddContract({
      ...formData,
      clientName,
      status: 'Em Negociação'
    });
    
    navigate('/contracts');
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/contracts" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de contratos
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Contrato</h2>

        {/* Seção de Dados Gerais */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente</label>
              <select name="clientId" id="clientId" value={formData.clientId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Gestor do Contrato (interno)</label>
              <input type="text" name="manager" id="manager" value={formData.manager} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Contrato</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
              <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
              <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
          </div>
        </section>

        {/* Seção Financeira */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Informações Financeiras</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="annualValue" className="block text-sm font-medium text-gray-700">Valor Anual (R$)</label>
              <input type="number" name="annualValue" id="annualValue" value={formData.annualValue} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
              <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Mensal</option>
                <option>Pagamento Único</option>
                <option>Parcelado</option>
              </select>
            </div>
            {formData.paymentMethod === 'Mensal' && (
              <div>
                <label htmlFor="monthlyValue" className="block text-sm font-medium text-gray-700">Valor Mensal (R$)</label>
                <input type="number" name="monthlyValue" id="monthlyValue" value={formData.monthlyValue} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            )}
          </div>
        </section>

        {/* Seção de Contratação e Serviços */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Detalhes da Contratação e Serviços</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hiringType" className="block text-sm font-medium text-gray-700">Tipo de Contratação</label>
              <select name="hiringType" id="hiringType" value={formData.hiringType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Privado</option>
                <option>Licitação</option>
                <option>Dispensa de Licitação</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="servicesDescription" className="block text-sm font-medium text-gray-700">Serviços a Serem Executados</label>
              <textarea name="servicesDescription" id="servicesDescription" value={formData.servicesDescription} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
          </div>
        </section>

        {/* Seção de Contato Responsável */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Contato Responsável no Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" name="name" id="name" value={formData.responsibleContact.name} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" name="email" id="email" value={formData.responsibleContact.email} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone (Opcional)</label>
              <input type="tel" name="phone" id="phone" value={formData.responsibleContact.phone} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (Opcional)</label>
              <input type="tel" name="whatsapp" id="whatsapp" value={formData.responsibleContact.whatsapp} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
        </section>
        
        <div className="mt-8 flex justify-end">
            <Link to="/contracts" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-3 font-semibold">
                Cancelar
            </Link>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">
                Salvar Contrato
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddContractPage;