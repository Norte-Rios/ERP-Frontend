import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Service } from '../../admin/services/types';
import { AlertTriangle, Check, X, Send, FileText, Info } from 'lucide-react';

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

interface ConsultantServiceDetailPageProps {
  services: Service[];
  onUpdateService: (service: Service) => void;
  currentConsultantName: string;
}

const ConsultantServiceDetailPage = ({ services, onUpdateService, currentConsultantName }: ConsultantServiceDetailPageProps) => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const service = services.find(s => s.id === serviceId);

  const [workPlanContent, setWorkPlanContent] = useState('');
  const [finalReportContent, setFinalReportContent] = useState('');

  useEffect(() => {
    if (service?.workPlan?.content) {
        setWorkPlanContent(service.workPlan.content);
    }
    if (service?.finalReport?.content) {
        setFinalReportContent(service.finalReport.content);
    }
  }, [service]);


  const handleAcceptService = () => {
    if (service) {
      onUpdateService({ ...service, status: 'Em Andamento' });
    }
  };

  const handleDeclineService = () => {
    if (service) {
      onUpdateService({ ...service, status: 'Cancelado' });
      navigate('/consultant/services');
    }
  };

  const handleWorkPlanSubmit = () => {
    if (service && workPlanContent.trim()) {
        onUpdateService({
            ...service,
            workPlan: {
                ...service.workPlan,
                content: workPlanContent,
                status: 'Pendente de Aprovação',
                feedback: '', // Limpa o feedback anterior ao reenviar
            }
        });
    }
  };

  const handleFinalReportSubmit = () => {
    if(service && finalReportContent.trim()){
        onUpdateService({
            ...service,
            finalReport: {
                content: finalReportContent,
                status: 'Pendente de Análise',
            }
        });
    }
  }

  if (!service) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Serviço não encontrado!</h2>
        <Link to="/consultant/services" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de serviços
        </Link>
      </div>
    );
  }

  // Lógica para determinar quem envia o relatório
  const isReportSubmitter = service.projectManager === currentConsultantName || service.consultants.length === 1;

  return (
    <div className="container mx-auto">
      <div className="mb-6">
         <Link to="/consultant/services" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de serviços
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Detalhes do Serviço #{service.id}</h2>
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>{service.status}</span>
            </div>
        </div>
       
        {/* Ações do Consultor */}
        {service.status === 'Pendente' && (
            <div className="my-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                <p className="text-yellow-800 font-medium">Este serviço está pendente da sua aceitação.</p>
                <div className="flex gap-4">
                    <button onClick={handleAcceptService} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold">Aceitar</button>
                    <button onClick={handleDeclineService} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Recusar</button>
                </div>
            </div>
        )}

        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
            <div><h3 className="text-sm font-medium text-gray-500">Cliente</h3><p className="mt-1 text-lg text-gray-900">{service.clientName}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Gestor do Projeto</h3><p className="mt-1 text-lg text-gray-900">{service.projectManager}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Data de Início</h3><p className="mt-1 text-lg text-gray-900">{new Date(service.startDate).toLocaleDateString()}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Data de Conclusão</h3><p className="mt-1 text-lg text-gray-900">{new Date(service.endDate).toLocaleDateString()}</p></div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200"><h3 className="text-sm font-medium text-gray-500">Descrição</h3><p className="mt-1 text-lg text-gray-900">{service.description || 'Nenhuma descrição fornecida.'}</p></div>
        
        {/* Plano de Trabalho */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Plano de Trabalho</h3>
            {service.status === 'Em Andamento' && service.workPlan?.status !== 'Aprovado' ? (
                <div>
                     {service.workPlan?.status === 'Rejeitado' && (
                        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            <h4 className="font-bold flex items-center gap-2"><AlertTriangle size={18}/>Plano Rejeitado</h4>
                            <p className="mt-2 text-sm"><strong>Feedback do gestor:</strong> {service.workPlan.feedback}</p>
                        </div>
                    )}
                    <textarea value={workPlanContent} onChange={(e) => setWorkPlanContent(e.target.value)} className="w-full input-style" rows={8} placeholder="Descreva o plano de trabalho detalhado aqui..."></textarea>
                    <div className="flex justify-end mt-4">
                        <button onClick={handleWorkPlanSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold flex items-center gap-2">
                           <Send size={16}/> {service.workPlan?.status === 'Rejeitado' ? 'Reenviar Plano' : 'Enviar para Análise'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                    {service.workPlan?.content ? (
                         <p className="text-gray-800 whitespace-pre-wrap mt-1">{service.workPlan.content}</p>
                    ) : (
                        <p className="text-gray-500">Nenhum plano de trabalho submetido ainda.</p>
                    )}
                </div>
            )}
        </div>

        {/* Relatório Final */}
        {service.status === 'Concluído' && (
             <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Relatório Final</h3>
                {isReportSubmitter ? (
                    service.finalReport?.status !== 'Aprovado' ? (
                         <div>
                            {service.finalReport?.status === 'Rejeitado' && (
                                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                    <h4 className="font-bold flex items-center gap-2"><AlertTriangle size={18}/>Relatório Rejeitado</h4>
                                    <p className="mt-2 text-sm"><strong>Feedback do gestor:</strong> {service.finalReport.feedback}</p>
                                </div>
                            )}
                            <textarea value={finalReportContent} onChange={(e) => setFinalReportContent(e.target.value)} className="w-full input-style" rows={8} placeholder="Escreva o relatório final do serviço aqui..."></textarea>
                            <div className="flex justify-end mt-4">
                                <button onClick={handleFinalReportSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold flex items-center gap-2">
                                <Send size={16}/> {service.finalReport?.status === 'Rejeitado' ? 'Reenviar Relatório' : 'Enviar Relatório Final'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg">
                           <p className="text-gray-800 whitespace-pre-wrap mt-1">{service.finalReport.content}</p>
                        </div>
                    )
                ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-3">
                        <Info size={18}/> O relatório final para este serviço será enviado pelo gestor do projeto: {service.projectManager}.
                    </div>
                )}
             </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantServiceDetailPage;