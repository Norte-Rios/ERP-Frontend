import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Service } from './types';
import { AlertTriangle, Check, X } from 'lucide-react';

// Função auxiliar para classes de status
const getStatusClass = (status: Service['status'] | Service['workPlan']['status'] | Service['finalReport']['status']) => {
    switch (status) {
        case 'Em Andamento': return 'bg-blue-100 text-blue-800';
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Concluído': return 'bg-green-100 text-green-800';
        case 'Cancelado': return 'bg-red-100 text-red-800';
        case 'Pendente de Aprovação': return 'bg-yellow-100 text-yellow-800';
        case 'Aprovado': return 'bg-green-100 text-green-800';
        case 'Rejeitado': return 'bg-red-100 text-red-800';
        case 'Pendente de Análise': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

interface ServiceDetailPageProps {
  services: Service[];
  onDeleteService: (serviceId: string) => void;
  onUpdateService: (service: Service) => void;
}

const ServiceDetailPage = ({ services, onDeleteService, onUpdateService }: ServiceDetailPageProps) => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const service = services.find(s => s.id === serviceId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleConfirmDelete = () => {
    if (service) {
      onDeleteService(service.id);
      navigate('/services');
    }
  };
  
  const handleWorkPlanApproval = (isApproved: boolean) => {
    if (service && service.workPlan) {
      if (!isApproved && !feedback.trim()) {
        alert('É necessário fornecer feedback para rejeitar o plano.');
        return;
      }
      onUpdateService({
        ...service,
        workPlan: {
          ...service.workPlan,
          status: isApproved ? 'Aprovado' : 'Rejeitado',
          feedback: isApproved ? '' : feedback,
        }
      });
      setFeedback('');
    }
  };

  const handleFinalReportApproval = (isApproved: boolean) => {
    if (service && service.finalReport) {
        if (!isApproved && !feedback.trim()) {
            alert('Por favor, forneça um feedback para a rejeição.');
            return;
        }
        onUpdateService({
            ...service,
            finalReport: {
                ...service.finalReport,
                status: isApproved ? 'Aprovado' : 'Rejeitado',
                feedback: isApproved ? undefined : feedback,
            }
        });
        setFeedback('');
    }
  };

  if (!service) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Serviço não encontrado!</h2>
        <Link to="/services" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de serviços
        </Link>
      </div>
    );
  }

  const totalCost = (service.costs?.travel || 0) + (service.costs?.accommodation || 0) + (service.costs?.food || 0) + (service.costs?.transport || 0);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
         <Link to="/services" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de serviços
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Detalhes do Serviço #{service.id}</h2>
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>{service.status}</span>
                <Link to={`/services/${service.id}/edit`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Editar</Link>
                <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold">Apagar</button>
            </div>
        </div>
       
        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
            <div><h3 className="text-sm font-medium text-gray-500">Cliente</h3><p className="mt-1 text-lg text-gray-900">{service.clientName}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Gestor do Projeto</h3><p className="mt-1 text-lg text-gray-900">{service.projectManager}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Data de Início</h3><p className="mt-1 text-lg text-gray-900">{new Date(service.startDate).toLocaleDateString()}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Data de Conclusão</h3><p className="mt-1 text-lg text-gray-900">{new Date(service.endDate).toLocaleDateString()}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Formato do Serviço</h3><p className="mt-1 text-lg text-gray-900">{service.type}</p></div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200"><h3 className="text-sm font-medium text-gray-500">Descrição</h3><p className="mt-1 text-lg text-gray-900">{service.description || 'Nenhuma descrição fornecida.'}</p></div>
        
        {/* PLANO DE TRABALHO */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Plano de Trabalho</h3>
          {service.workPlan && service.workPlan.content ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700">Status do Plano</h4>
                <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(service.workPlan.status)}`}>
                  {service.workPlan.status}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap mt-1">{service.workPlan.content}</p>
              
              {service.workPlan.status === 'Pendente de Aprovação' && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-gray-700 mb-2">Análise do Plano</h4>
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Se rejeitar, forneça o motivo aqui..." className="w-full input-style mb-3" rows={3}></textarea>
                    <div className="flex gap-4">
                        <button onClick={() => handleWorkPlanApproval(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold flex items-center gap-2"><Check size={18}/> Aprovar</button>
                        <button onClick={() => handleWorkPlanApproval(false)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold flex items-center gap-2"><X size={18}/> Rejeitar</button>
                    </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum plano de trabalho foi iniciado.</p>
          )}
        </div>

        {/* RELATÓRIO FINAL */}
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Relatório Final de Serviços</h3>
            {service.finalReport ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Status do Relatório</h4>
                        <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(service.finalReport.status)}`}>
                            {service.finalReport.status}
                        </span>
                    </div>
                     <p className="text-gray-800 whitespace-pre-wrap mt-1">{service.finalReport.content}</p>

                    {service.finalReport.status === 'Pendente de Análise' && (
                        <div className="mt-4 pt-4 border-t">
                             <h4 className="font-semibold text-gray-700 mb-2">Análise do Relatório</h4>
                            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Se rejeitar, forneça o motivo aqui..." className="w-full input-style mb-3" rows={3}></textarea>
                            <div className="flex gap-4">
                                <button onClick={() => handleFinalReportApproval(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold flex items-center gap-2"><Check size={18}/> Aprovar Relatório</button>
                                <button onClick={() => handleFinalReportApproval(false)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold flex items-center gap-2"><X size={18}/> Rejeitar Relatório</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-gray-500">Nenhum relatório final submetido.</p>
            )}
        </div>

        {/* Consultores */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Consultores Atribuídos</h3>
          {service.consultants && service.consultants.length > 0 ? (
            <ul className="space-y-3">
              {service.consultants.map((consultant, index) => (
                <li key={index} className="flex items-center bg-gray-50 p-3 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-gray-900">{consultant}</span></li>
              ))}
            </ul>
          ) : (<p className="text-gray-500">Nenhum consultor atribuído.</p>)}
        </div>

        {/* Custos */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes dos Custos</h3>
          {service.type !== 'Online' && totalCost > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">Viagem</p><p className="text-xl font-semibold text-gray-900 mt-1">R$ {service.costs?.travel?.toFixed(2) || '0.00'}</p></div><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">Hospedagem</p><p className="text-xl font-semibold text-gray-900 mt-1">R$ {service.costs?.accommodation?.toFixed(2) || '0.00'}</p></div><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">Alimentação</p><p className="text-xl font-semibold text-gray-900 mt-1">R$ {service.costs?.food?.toFixed(2) || '0.00'}</p></div><div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">Transporte</p><p className="text-xl font-semibold text-gray-900 mt-1">R$ {service.costs?.transport?.toFixed(2) || '0.00'}</p></div></div>
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end"><div className="text-right"><p className="text-md font-medium text-gray-500">Custo Total</p><p className="text-3xl font-bold text-indigo-600">R$ {totalCost.toFixed(2)}</p></div></div>
            </>
          ) : (<p className="text-gray-500">Nenhum custo registado.</p>)}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mt-4">Tem a certeza de que deseja apagar este serviço? Esta ação não pode ser desfeita.</p>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Apagar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage;