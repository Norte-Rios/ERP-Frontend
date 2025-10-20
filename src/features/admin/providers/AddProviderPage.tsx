import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceProvider } from './types';

interface AddProviderPageProps {
  onAddProvider: (provider: Omit<ServiceProvider, 'id'>) => void;
}

const AddProviderPage: React.FC<AddProviderPageProps> = ({ onAddProvider }) => {
  const navigate = useNavigate();
  // O formulário agora só pede os dados iniciais
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    contact: { name: '', email: '', phone: '' },
  });
  const [createLogin, setCreateLogin] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section: 'address' | 'contact', e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ao salvar, criamos o prestador com dados bancários e serviços vazios,
    // pois eles serão preenchidos pelo próprio prestador no futuro.
    onAddProvider({
      ...formData,
      bankDetails: { bank: '', agency: '', account: '', pix: '' },
      offeredServices: [],
    });
    console.log(`Criar login para ${formData.contact.email}: ${createLogin}`);
    navigate('/providers');
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/providers" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de prestadores
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Cadastrar Novo Prestador de Serviço (PJ)</h2>

        {/* Informações da Empresa */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados da Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa</label><input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
            <div><label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label><input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
          </div>
           <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-600 mb-2">Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-4"><label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua / Logradouro</label><input type="text" name="street" id="street" value={formData.address.street} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
              <div className="md:col-span-2"><label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">CEP</label><input type="text" name="zipCode" id="zipCode" value={formData.address.zipCode} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
              <div className="md:col-span-3"><label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label><input type="text" name="city" id="city" value={formData.address.city} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
              <div className="md:col-span-3"><label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label><input type="text" name="state" id="state" value={formData.address.state} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
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

        {/* Acesso ao Portal */}
        <section className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Acesso ao Portal do Prestador</h3>
             <div className="mt-4">
                <label className="flex items-center">
                    <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-600">Criar acesso ao portal para o contato principal (enviar convite por e-mail)</span>
                </label>
            </div>
        </section>

        <div className="mt-8 flex justify-end gap-4">
          <Link to="/providers" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</Link>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">Salvar Prestador</button>
        </div>
      </form>
    </div>
  );
};

export default AddProviderPage;