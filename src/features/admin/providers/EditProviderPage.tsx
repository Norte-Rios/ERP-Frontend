import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ServiceProvider } from './types';

interface EditProviderPageProps {
  providers: ServiceProvider[];
  onUpdateProvider: (provider: ServiceProvider) => void;
}

const EditProviderPage: React.FC<EditProviderPageProps> = ({ providers, onUpdateProvider }) => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const providerToEdit = providers.find(p => p.id === providerId);

  const [formData, setFormData] = useState<ServiceProvider | undefined>(undefined);

  useEffect(() => {
    if (providerToEdit) {
      setFormData(providerToEdit);
    }
  }, [providerToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNestedChange = (section: 'address' | 'contact', e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value,
        },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onUpdateProvider(formData);
      navigate(`/providers/${providerId}`);
    }
  };

  if (!formData) {
    return <div className="text-center p-10"><h2>A carregar...</h2></div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to={`/providers/${providerId}`} className="text-indigo-600 hover:underline">
          &larr; Voltar para os detalhes do prestador
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Editar Prestador de Serviço (PJ)</h2>

        {/* Informações da Empresa */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados da Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa</label><input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
            <div><label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label><input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
            <div className="md:col-span-2"><label htmlFor="street" className="block text-sm font-medium text-gray-700">Endereço</label><input type="text" name="street" id="street" value={formData.address.street} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3"><label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label><input type="text" name="city" id="city" value={formData.address.city} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
                <div className="md:col-span-1"><label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label><input type="text" name="state" id="state" value={formData.address.state} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
                <div className="md:col-span-1"><label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">CEP</label><input type="text" name="zipCode" id="zipCode" value={formData.address.zipCode} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
            </div>
          </div>
        </section>
        
        {/* Contato Principal */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Contato Principal</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Contato</label><input type="text" name="name" id="name" value={formData.contact.name} onChange={(e) => handleNestedChange('contact', e)} className="mt-1 block w-full input-style" required /></div>
              <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label><input type="email" name="email" id="email" value={formData.contact.email} onChange={(e) => handleNestedChange('contact', e)} className="mt-1 block w-full input-style" required /></div>
              <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label><input type="tel" name="phone" id="phone" value={formData.contact.phone} onChange={(e) => handleNestedChange('contact', e)} className="mt-1 block w-full input-style" required /></div>
          </div>
        </section>

        <div className="mt-8 flex justify-end gap-4">
          <Link to={`/providers/${providerId}`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</Link>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
};

export default EditProviderPage;