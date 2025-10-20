import React, { useMemo } from 'react';
import { Briefcase, FileText, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MetricCard = ({ title, value, icon: Icon, color, linkTo }) => (
  <Link to={linkTo} className={`p-6 rounded-lg shadow-md flex items-start justify-between ${color} text-white hover:opacity-90 transition-opacity`}>
    <div>
      <h3 className="text-sm font-medium text-white/80">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
    <Icon className="h-8 w-8 text-white/50" />
  </Link>
);

const ClientDashboardPage = ({ clientName, services, contracts, revenues }) => {

  const metrics = useMemo(() => {
    if (!services || !contracts || !revenues) {
      return { activeServices: 0, activeContracts: 0, pendingValue: 0 };
    }
    const activeServices = services.filter(s => s.status === 'Em Andamento').length;
    const activeContracts = contracts.filter(c => c.status === 'Ativo').length;
    const pendingValue = revenues
      .filter(r => r.status === 'Pendente' || r.status === 'Atrasado')
      .reduce((sum, r) => sum + r.value, 0);

    return { activeServices, activeContracts, pendingValue };
  }, [services, contracts, revenues]);

  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const getStatusClass = (status) => {
    switch (status) {
        case 'Em Andamento': return 'bg-blue-100 text-blue-800';
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Concluído': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Bem-vindo, {clientName}!</h2>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Serviços em Andamento" value={metrics.activeServices} icon={Briefcase} color="bg-brand-teal" linkTo="/client/services" />
        <MetricCard title="Contratos Ativos" value={metrics.activeContracts} icon={FileText} color="bg-brand-orange" linkTo="/client/financial" />
        <MetricCard title="Pagamentos Pendentes" value={formatCurrency(metrics.pendingValue)} icon={DollarSign} color="bg-red-500" linkTo="/client/financial" />
      </div>

      {/* Ações Rápidas e Informações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Serviços Recentes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Acompanhe os seus Serviços</h3>
            <Link to="/client/services" className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {services && services.slice(0, 3).map(service => (
              <Link to={`/client/services/${service.id}`} key={service.id} className="block p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800">{service.description || 'Serviço sem descrição'}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(service.status)}`}>{service.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Gestor: {service.projectManager}</p>
              </Link>
            ))}
            {(!services || services.length === 0) && <p className="text-sm text-gray-500">Nenhum serviço encontrado.</p>}
          </div>
        </div>

         {/* Acesso Rápido */}
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Acesso Rápido</h3>
           <div className="space-y-3">
              <Link to="/client/documents" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 transition-colors">
                Ver meus Documentos
              </Link>
              <Link to="/client/financial" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 transition-colors">
                Consultar Financeiro
              </Link>
               <Link to="/client/services" className="block p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-semibold text-indigo-700 transition-colors">
                Solicitar Novo Serviço
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;