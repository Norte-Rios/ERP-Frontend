import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Service } from '../../admin/services/types';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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

interface ClientServiceDetailPageProps {
  services: Service[];
}

const ClientServiceDetailPage: React.FC<ClientServiceDetailPageProps> = ({ services }) => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Serviço não encontrado!</h2>
        <Link to="/client/services" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de serviços
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
         <Link to="/client/services" className="text-indigo-600 hover:underline">
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
       
        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
            <div><h3 className="text-sm font-medium text-gray-500">Gestor do Projeto</h3><p className="mt-1 text-lg text-gray-900">{service.projectManager}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Consultores</h3><p className="mt-1 text-lg text-gray-900">{service.consultants.join(', ')}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Data de Início</h3><p className="mt-1 text-lg text-gray-900">{new Date(service.startDate).toLocaleDateString()}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500">Data de Conclusão</h3><p className="mt-1 text-lg text-gray-900">{new Date(service.endDate).toLocaleDateString()}</p></div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200"><h3 className="text-sm font-medium text-gray-500">Descrição do Serviço</h3><p className="mt-1 text-lg text-gray-900">{service.description || 'Nenhuma descrição fornecida.'}</p></div>
        
        {/* Plano de Trabalho */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Plano de Trabalho</h3>
          {service.workPlan?.content ? (
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">Status do Plano</h4>
                    <span className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(service.workPlan.status)}`}>
                        {service.workPlan.status === 'Aprovado' && <CheckCircle size={14}/>}
                        {service.workPlan.status === 'Rejeitado' && <AlertTriangle size={14}/>}
                        {service.workPlan.status === 'Pendente de Aprovação' && <Clock size={14}/>}
                        {service.workPlan.status}
                    </span>
                </div>
              <p className="text-gray-800 whitespace-pre-wrap mt-1">{service.workPlan.content}</p>
              
              {service.workPlan.status === 'Rejeitado' && service.workPlan.feedback && (
                <div className="mt-4 pt-4 border-t text-sm">
                    <p className="font-semibold text-red-700">Motivo da Rejeição:</p>
                    <p className="text-red-600">{service.workPlan.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum plano de trabalho submetido ainda.</p>
          )}
        </div>

        {/* Relatório Final */}
        {service.finalReport?.content && (
             <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Relatório Final</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Status do Relatório</h4>
                        <span className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold leading-tight rounded-full ${getStatusClass(service.finalReport.status)}`}>
                            {service.finalReport.status === 'Aprovado' && <CheckCircle size={14}/>}
                            {service.finalReport.status === 'Rejeitado' && <AlertTriangle size={14}/>}
                            {service.finalReport.status === 'Pendente de Análise' && <Clock size={14}/>}
                            {service.finalReport.status}
                        </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap mt-1">{service.finalReport.content}</p>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default ClientServiceDetailPage;