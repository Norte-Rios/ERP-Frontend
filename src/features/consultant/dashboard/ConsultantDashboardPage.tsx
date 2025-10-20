import React, { useMemo } from 'react';
import { Briefcase, CheckSquare, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Card de métrica reutilizável
const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 rounded-lg shadow-md flex items-start justify-between ${color}`}>
    <div>
      <h3 className="text-sm font-medium text-white/80">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
    <Icon className="h-8 w-8 text-white/50" />
  </div>
);

const ConsultantDashboardPage = ({ consultantName, tasks, services, payments, taskBoard }) => {
  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const { pendingTasks, activeServices, pendingPaymentsValue } = useMemo(() => {
    const doneColumnIds = Object.values(taskBoard.columns)
      .filter(c => c.title === 'Concluído' || c.title === 'Em Revisão')
      .map(c => c.id);

    const pendingTasks = tasks.filter(task => {
      const column = Object.values(taskBoard.columns).find(c => c.taskIds.includes(task.id));
      return column && !doneColumnIds.includes(column.id);
    });

    const activeServices = services.filter(s => s.status === 'Em Andamento');

    const pendingPaymentsValue = payments
      .filter(p => p.status === 'Pendente' || p.status === 'Agendado')
      .reduce((sum, p) => sum + p.value, 0);

    return { pendingTasks, activeServices, pendingPaymentsValue };
  }, [tasks, services, payments, taskBoard]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Bem-vindo, {consultantName}!</h2>
      
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Serviços Ativos" value={activeServices.length} icon={Briefcase} color="bg-brand-teal" />
        <MetricCard title="Tarefas Pendentes" value={pendingTasks.length} icon={CheckSquare} color="bg-brand-orange" />
        <MetricCard title="Pagamentos a Receber" value={formatCurrency(pendingPaymentsValue)} icon={DollarSign} color="bg-brand-green-light" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Tarefas Pendentes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tarefas Pendentes</h3>
            <Link to="/consultant/tasks" className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-3 border rounded-md hover:bg-gray-50">
                <h4 className="font-semibold text-gray-800">{task.title}</h4>
                {task.dueDate && <p className="text-xs text-red-500 mt-1">Prazo: {new Date(task.dueDate).toLocaleDateString()}</p>}
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="text-sm text-gray-500">Nenhuma tarefa pendente.</p>}
          </div>
        </div>

        {/* Lista de Serviços Ativos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Meus Serviços Ativos</h3>
          <div className="space-y-3">
            {activeServices.slice(0, 5).map(service => (
               <Link to={`/consultant/services/${service.id}`} key={service.id} className="block p-3 border rounded-md hover:bg-gray-50">
                  <h4 className="font-semibold text-gray-800">{service.clientName}</h4>
                  <p className="text-sm text-gray-500">{service.description}</p>
              </Link>
            ))}
            {activeServices.length === 0 && <p className="text-sm text-gray-500">Nenhum serviço em andamento.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboardPage;