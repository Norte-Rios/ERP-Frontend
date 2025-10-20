import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Service } from './types';

const AddServicePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    projectManager: '',
    startDate: '',
    endDate: '',
    type: 'Presencial' as Service['type'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No futuro, aqui você faria uma chamada de API para salvar os dados.
    // Por enquanto, vamos apenas exibir os dados no console para simular a criação.
    const newService = {
      id: `S${Date.now()}`, // ID temporário
      status: 'Pendente' as const,
      ...formData,
    };
    console.log('Novo serviço criado:', newService);

    // TODO: Adicionar lógica para realmente salvar os dados na lista.
    
    navigate('/services'); // Redireciona de volta para a lista após criar
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/services" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de serviços
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Serviço</h2>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
            <input
              type="text"
              name="clientName"
              id="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="projectManager" className="block text-sm font-medium text-gray-700">Gestor do Projeto</label>
            <input
              type="text"
              name="projectManager"
              id="projectManager"
              value={formData.projectManager}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Conclusão</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Formato do Serviço</label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option>Presencial</option>
              <option>Online</option>
              <option>Híbrido</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
            <Link to="/services" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-3">
                Cancelar
            </Link>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
                Salvar Serviço
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddServicePage;