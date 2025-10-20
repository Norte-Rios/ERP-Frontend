import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Client } from './types';

interface EditClientPageProps {
  clients: Client[];
  onUpdateClient: (client: Client) => void;
}

const EditClientPage = ({ clients, onUpdateClient }: EditClientPageProps) => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const clientToEdit = clients.find(c => c.id === clientId);

  const [formData, setFormData] = useState<Client | undefined>(undefined);

  useEffect(() => {
    if (clientToEdit) {
      setFormData(clientToEdit);
    }
  }, [clientToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value,
        },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onUpdateClient(formData);
      navigate(`/clients/${clientId}`);
    }
  };

  if (!formData) {
    return <div className="text-center p-10"><h2>A carregar...</h2></div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to={`/clients/${clientId}`} className="text-indigo-600 hover:underline">
          &larr; Voltar para os detalhes do cliente
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Cliente</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full input-style" required />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Nome do Contato</label>
            <input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 block w-full input-style" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full input-style" required />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full input-style" required />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Empresa</label>
            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full input-style">
              <option>Privada</option>
              <option>Pública</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full input-style">
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-4">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua / Logradouro</label>
              <input type="text" name="street" id="street" value={formData.address.street} onChange={handleAddressChange} className="mt-1 block w-full input-style" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">CEP</label>
              <input type="text" name="zipCode" id="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} className="mt-1 block w-full input-style" required />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
              <input type="text" name="city" id="city" value={formData.address.city} onChange={handleAddressChange} className="mt-1 block w-full input-style" required />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label>
              <input type="text" name="state" id="state" value={formData.address.state} onChange={handleAddressChange} className="mt-1 block w-full input-style" required />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
            <Link to={`/clients/${clientId}`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-3 font-semibold">
                Cancelar
            </Link>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">
                Salvar Alterações
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditClientPage;
