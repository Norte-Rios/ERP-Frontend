import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client } from './types';
import { Contract } from '../contracts/types';

// A nova prop agora espera receber os dados do cliente e do seu primeiro contrato
interface AddClientPageProps {
  onAddClientAndContract: (
    clientData: Omit<Client, 'id' | 'registrationDate' | 'contractIds'>,
    contractData: Omit<Contract, 'id' | 'clientId' | 'clientName' | 'status'>
  ) => void;
}

const AddClientPage = ({ onAddClientAndContract }: AddClientPageProps) => {
  const navigate = useNavigate();
  
  // O estado do formulário agora inclui os dados do cliente e do contrato inicial
  const [formData, setFormData] = useState({
    // Dados do Cliente
    companyName: '',
    cnpj: '',
    contactName: '',
    email: '',
    phone: '',
    type: 'Privada' as Client['type'],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    // Dados do Contrato Inicial
    contract: {
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
    }
  });

  // Funções para manipular as alterações nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     if (name === 'annualValue' || name === 'monthlyValue') {
       setFormData(prev => ({
        ...prev,
        contract: { ...prev.contract, [name]: parseFloat(value) || 0 },
      }));
     } else {
        setFormData(prev => ({
        ...prev,
        contract: { ...prev.contract, [name]: value },
      }));
     }
  };
  
  const handleResponsibleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contract: {
        ...prev.contract,
        responsibleContact: {
          ...prev.contract.responsibleContact,
          [name]: value,
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contract, contactName, email, phone, ...clientData } = formData;

    onAddClientAndContract(
      {
        ...clientData,
        contactName: formData.contract.responsibleContact.name, // Usar o contato do contrato como o principal
        email: formData.contract.responsibleContact.email,
        phone: formData.contract.responsibleContact.phone || '',
        status: 'Ativo',
      },
      contract
    );
    
    navigate('/clients');
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/clients" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de clientes
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Criar Novo Cliente e Contrato Inicial</h2>

        {/* Seção de Dados da Empresa (Cliente) */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">1. Dados da Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Empresa</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Privada</option>
                <option>Pública</option>
              </select>
            </div>
          </div>
          {/* Endereço */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-600 mb-2">Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-4"><label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua / Logradouro</label><input type="text" name="street" id="street" value={formData.address.street} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
              <div className="md:col-span-2"><label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">CEP</label><input type="text" name="zipCode" id="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
              <div className="md:col-span-3"><label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label><input type="text" name="city" id="city" value={formData.address.city} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
              <div className="md:col-span-3"><label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label><input type="text" name="state" id="state" value={formData.address.state} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
            </div>
          </div>
        </section>

        {/* Seção do Contrato Inicial */}
        <section className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">2. Dados do Contrato Inicial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2"><label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Contrato</label><input type="text" name="title" id="title" value={formData.contract.title} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
             <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label><input type="date" name="startDate" id="startDate" value={formData.contract.startDate} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
             <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label><input type="date" name="endDate" id="endDate" value={formData.contract.endDate} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
             <div><label htmlFor="manager" className="block text-sm font-medium text-gray-700">Gestor do Contrato (interno)</label><input type="text" name="manager" id="manager" value={formData.contract.manager} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div><label htmlFor="annualValue" className="block text-sm font-medium text-gray-700">Valor Anual (R$)</label><input type="number" name="annualValue" id="annualValue" value={formData.contract.annualValue} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
            <div><label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Forma de Pagamento</label><select name="paymentMethod" id="paymentMethod" value={formData.contract.paymentMethod} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option>Mensal</option><option>Pagamento Único</option><option>Parcelado</option></select></div>
            {formData.contract.paymentMethod === 'Mensal' && (<div><label htmlFor="monthlyValue" className="block text-sm font-medium text-gray-700">Valor Mensal (R$)</label><input type="number" name="monthlyValue" id="monthlyValue" value={formData.contract.monthlyValue} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>)}
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div><label htmlFor="hiringType" className="block text-sm font-medium text-gray-700">Tipo de Contratação</label><select name="hiringType" id="hiringType" value={formData.contract.hiringType} onChange={handleContractChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option>Privado</option><option>Licitação</option><option>Dispensa de Licitação</option></select></div>
            <div className="md:col-span-2"><label htmlFor="servicesDescription" className="block text-sm font-medium text-gray-700">Serviços a Serem Executados</label><textarea name="servicesDescription" id="servicesDescription" value={formData.contract.servicesDescription} onChange={handleContractChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
          </div>
        </section>
        
        {/* Seção de Contato Responsável e Acesso */}
        <section className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">3. Contato Responsável e Acesso ao Portal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="responsibleName" className="block text-sm font-medium text-gray-700">Nome do Contato</label><input type="text" name="name" id="responsibleName" value={formData.contract.responsibleContact.name} onChange={handleResponsibleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
                <div><label htmlFor="responsibleEmail" className="block text-sm font-medium text-gray-700">E-mail do Contato</label><input type="email" name="email" id="responsibleEmail" value={formData.contract.responsibleContact.email} onChange={handleResponsibleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
                <div><label htmlFor="responsiblePhone" className="block text-sm font-medium text-gray-700">Telefone (Opcional)</label><input type="tel" name="phone" id="responsiblePhone" value={formData.contract.responsibleContact.phone} onChange={handleResponsibleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                <div><label htmlFor="responsibleWhatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (Opcional)</label><input type="tel" name="whatsapp" id="responsibleWhatsapp" value={formData.contract.responsibleContact.whatsapp} onChange={handleResponsibleContactChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
            </div>
            <div className="mt-4">
                <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-600">Criar acesso ao portal para este usuário (enviar convite por e-mail)</span>
                </label>
            </div>
        </section>
        
        <div className="mt-8 flex justify-end">
            <Link to="/clients" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-3 font-semibold">
                Cancelar
            </Link>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">
                Salvar Cliente e Contrato
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddClientPage;