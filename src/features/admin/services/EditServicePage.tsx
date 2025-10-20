import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Service } from './types';

interface EditServicePageProps {
  services: Service[];
  onUpdateService: (service: Service) => void;
}

const EditServicePage = ({ services, onUpdateService }: EditServicePageProps) => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const serviceToEdit = services.find(s => s.id === serviceId);

  const [formData, setFormData] = useState<Service | undefined>(undefined);
  const [newConsultant, setNewConsultant] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      const initialData = {
        ...serviceToEdit,
        consultants: serviceToEdit.consultants || [],
        costs: serviceToEdit.costs || {},
        workPlan: serviceToEdit.workPlan || { status: 'Pendente de Aprovação', content: '' },
      };
      setFormData(initialData);
    }
  }, [serviceToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleWorkPlanChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        workPlan: {
          ...formData.workPlan,
          status: formData.workPlan?.status || 'Pendente de Aprovação',
          content: formData.workPlan?.content || '',
          [name]: value,
        },
      });
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, costs: { ...formData.costs, [name]: value === '' ? undefined : parseFloat(value) } });
    }
  };

  const handleAddConsultant = () => {
    if (formData && newConsultant.trim() !== '' && !formData.consultants.includes(newConsultant.trim())) {
      setFormData({ ...formData, consultants: [...formData.consultants, newConsultant.trim()] });
      setNewConsultant('');
    }
  };

  const handleRemoveConsultant = (consultantToRemove: string) => {
    if (formData) {
      setFormData({ ...formData, consultants: formData.consultants.filter(c => c !== consultantToRemove) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onUpdateService(formData);
      navigate(`/services/${serviceId}`);
    }
  };

  if (!formData) {
    return <div className="text-center p-10"><h2>Carregando...</h2></div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to={`/services/${serviceId}`} className="text-indigo-600 hover:underline">
          &larr; Voltar para os detalhes do serviço
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Serviço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos de Informações Gerais */}
          <div><label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Nome do Cliente</label><input type="text" name="clientName" id="clientName" value={formData.clientName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
          <div><label htmlFor="projectManager" className="block text-sm font-medium text-gray-700">Gestor do Projeto</label><input type="text" name="projectManager" id="projectManager" value={formData.projectManager} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
          <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label><input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
          <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Conclusão</label><input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
          <div><label htmlFor="type" className="block text-sm font-medium text-gray-700">Formato</label><select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option>Presencial</option><option>Online</option><option>Híbrido</option></select></div>
          <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option>Pendente</option><option>Em Andamento</option><option>Concluído</option><option>Cancelado</option></select></div>
          <div className="md:col-span-2"><label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label><textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>

          {/* Plano de Trabalho */}
          <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestão do Plano de Trabalho</h3>
            <div><label htmlFor="workPlanStatus" className="block text-sm font-medium text-gray-700">Status do Plano</label><select name="status" id="workPlanStatus" value={formData.workPlan?.status} onChange={handleWorkPlanChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option>Pendente de Aprovação</option><option>Aprovado</option><option>Rejeitado</option></select></div>
            <div className="mt-4"><label htmlFor="workPlanContent" className="block text-sm font-medium text-gray-700">Conteúdo do Plano</label><textarea name="content" id="workPlanContent" value={formData.workPlan?.content} onChange={handleWorkPlanChange} rows={6} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
            {formData.workPlan?.status === 'Rejeitado' && (
              <div className="mt-4"><label htmlFor="workPlanFeedback" className="block text-sm font-medium text-gray-700">Feedback / Motivo da Rejeição</label><textarea name="feedback" id="workPlanFeedback" value={formData.workPlan?.feedback || ''} onChange={handleWorkPlanChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
            )}
          </div>
          
          {/* Gestão de Consultores */}
          <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestão de Consultores</h3>
            <div className="flex items-center gap-2 mb-4">
              <input type="text" value={newConsultant} onChange={(e) => setNewConsultant(e.target.value)} placeholder="Nome do Consultor" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <button type="button" onClick={handleAddConsultant} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold whitespace-nowrap">Adicionar</button>
            </div>
            <div className="space-y-2">
              {formData.consultants.length > 0 ? (formData.consultants.map((consultant, index) => (<div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md"><span className="text-gray-800">{consultant}</span><button type="button" onClick={() => handleRemoveConsultant(consultant)} className="text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>))) : (<p className="text-sm text-gray-500">Nenhum consultor atribuído.</p>)}
            </div>
          </div>

          {/* Gestão de Custos */}
          {(formData.type === 'Presencial' || formData.type === 'Híbrido') && (
            <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestão de Custos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="travel" className="block text-sm font-medium text-gray-700">Custo de Viagem (R$)</label><input type="number" name="travel" id="travel" value={formData.costs?.travel || ''} onChange={handleCostChange} placeholder="Ex: 1200.50" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                <div><label htmlFor="accommodation" className="block text-sm font-medium text-gray-700">Custo de Hospedagem (R$)</label><input type="number" name="accommodation" id="accommodation" value={formData.costs?.accommodation || ''} onChange={handleCostChange} placeholder="Ex: 3500.00" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                <div><label htmlFor="food" className="block text-sm font-medium text-gray-700">Custo de Alimentação (R$)</label><input type="number" name="food" id="food" value={formData.costs?.food || ''} onChange={handleCostChange} placeholder="Ex: 850.75" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                <div><label htmlFor="transport" className="block text-sm font-medium text-gray-700">Transporte Local (R$)</label><input type="number" name="transport" id="transport" value={formData.costs?.transport || ''} onChange={handleCostChange} placeholder="Ex: 300.00" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <Link to={`/services/${serviceId}`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</Link>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
};

export default EditServicePage;