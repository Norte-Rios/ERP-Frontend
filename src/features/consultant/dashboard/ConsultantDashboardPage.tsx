import React, { useMemo } from 'react';
import { Briefcase, CheckSquare, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
// --- (Imports Adicionados) ---
import { Task, TaskBoard, Column } from '../../admin/tasks/types'; // (Ajuste o caminho se necessário)
import { Service } from '../../admin/services/types'; // (Ajuste o caminho se necessário)

// (Tipo Payment assumido, já que não temos o types.ts dele)
interface Payment {
  id: string;
  status: 'Pendente' | 'Agendado' | 'Pago';
  value: number;
}
// --- (Fim dos Imports) ---


// Card de métrica reutilizável (Tipado)
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}
const MetricCard = ({ title, value, icon: Icon, color }: MetricCardProps) => (
  <div className={`p-6 rounded-lg shadow-md flex items-start justify-between ${color}`}>
    <div>
      <h3 className="text-sm font-medium text-white/80">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
    <Icon className="h-8 w-8 text-white/50" />
  </div>
);

// Props da Página (Tipado)
interface ConsultantDashboardPageProps {
  consultantName: string;
  tasks: Task[];
  services: Service[];
  payments: Payment[];
  taskBoard: TaskBoard;
}

const ConsultantDashboardPage = ({ consultantName, tasks, services, payments, taskBoard }: ConsultantDashboardPageProps) => {
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const { pendingTasks, activeServices, pendingPaymentsValue } = useMemo(() => {
    // CORREÇÃO: 'c' agora é 'Column' e 'task' é 'Task'.
    // Os erros TS2339 (title, id, taskIds) desapareceram.
    const doneColumnIds = Object.values(taskBoard.columns)
      .filter((c: Column) => c.title === 'Concluído' || c.title === 'Em Revisão')
      .map((c: Column) => c.id);

    const pendingTasks = tasks.filter((task: Task) => {
      const column = Object.values(taskBoard.columns).find((c: Column) => c.taskIds.includes(task.id));
      return column && !doneColumnIds.includes(column.id);
    });

    const activeServices = services.filter((s: Service) => s.status === 'Em Andamento');

    const pendingPaymentsValue = payments
      .filter((p: Payment) => p.status === 'Pendente' || p.status === 'Agendado')
      .reduce((sum: number, p: Payment) => sum + p.value, 0);

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
                {/* CORREÇÃO: 'task.title' -> 'task.titulo' */}
                <h4 className="font-semibold text-gray-800">{task.titulo}</h4>
                {/* CORREÇÃO: 'task.dueDate' -> 'task.data' */}
                {task.data && <p className="text-xs text-red-500 mt-1">Prazo: {new Date(task.data).toLocaleDateString()}</p>}
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