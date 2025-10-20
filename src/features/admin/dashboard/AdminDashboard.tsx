import React, { useMemo } from 'react';
import { Service } from '../services/types';
import { Contract } from '../contracts/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminDashboardProps {
  services: Service[];
  contracts: Contract[];
}

// Componente reutilizável para os cartões de métricas, agora com correção de layout
const MetricCard = ({ title, value, icon: Icon, color, subtext = "" }) => (
  <div className="p-6 bg-white rounded-lg shadow-md flex items-start justify-between">
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-900 whitespace-nowrap">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ services, contracts }) => {

  const financialMetrics = useMemo(() => {
    const receivables = contracts
      .filter(c => c.status === 'Ativo' || c.status === 'Aguardando Assinatura')
      .reduce((sum, c) => sum + (c.monthlyValue || c.annualValue), 0);
    const pendingNegotiation = contracts
      .filter(c => c.status === 'Em Negociação')
      .reduce((sum, c) => sum + c.annualValue, 0);
    const totalExpenses = services.reduce((sum, service) => {
      return sum + (service.costs?.travel || 0) + (service.costs?.accommodation || 0) + (service.costs?.food || 0) + (service.costs?.transport || 0);
    }, 0);

    return { receivables, pendingNegotiation, totalExpenses };
  }, [contracts, services]);

  const expenseData = useMemo(() => {
    const data = [
      { name: 'Viagens', value: 0, fill: '#3b82f6' },
      { name: 'Hospedagem', value: 0, fill: '#8b5cf6' },
      { name: 'Alimentação', value: 0, fill: '#ec4899' },
      { name: 'Transporte', value: 0, fill: '#f97316' },
    ];
    services.forEach(service => {
      data[0].value += service.costs?.travel || 0;
      data[1].value += service.costs?.accommodation || 0;
      data[2].value += service.costs?.food || 0;
      data[3].value += service.costs?.transport || 0;
    });
    return data.filter(d => d.value > 0);
  }, [services]);
  
  const recentServices = useMemo(() => {
    return [...services]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
  }, [services]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    return contracts
      .filter(c => c.status === 'Ativo' && new Date(c.endDate) <= next30Days && new Date(c.endDate) >= now)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [contracts]);
  
  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusClass = (status: Service['status']) => {
    switch (status) {
        case 'Em Andamento': return 'bg-blue-100 text-blue-800';
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Concluído': return 'bg-green-100 text-green-800';
        case 'Cancelado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard do Administrador</h2>
      
      {/* Métricas Financeiras Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Receita (Contratos Ativos)" value={formatCurrency(financialMetrics.receivables)} subtext="Soma de valores anuais/mensais" icon={DollarSign} color="bg-green-500" />
        <MetricCard title="Potencial (Em Negociação)" value={formatCurrency(financialMetrics.pendingNegotiation)} icon={TrendingUp} color="bg-blue-500" />
        <MetricCard title="Despesas (Serviços)" value={formatCurrency(financialMetrics.totalExpenses)} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal (2/3 da largura) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Últimos Serviços Solicitados */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Serviços Solicitados</h3>
             <div className="space-y-4">
              {recentServices.length > 0 ? (
                recentServices.map(service => (
                  <Link to={`/services/${service.id}`} key={service.id} className="block hover:bg-gray-50 p-3 rounded-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{service.clientName}</p>
                        <p className="text-sm text-gray-500">{service.projectManager} • Início: {new Date(service.startDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(service.status)}`}>{service.status}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum serviço recente.</p>
              )}
             </div>
          </div>
        </div>

        {/* Coluna Lateral (1/3 da largura) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Gráfico de Despesas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Despesas</h3>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Nenhuma despesa registrada.</div>
            )}
          </div>
          {/* Prazos Próximos */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Contratos a Expirar</h3>
             <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(contract => (
                  <Link to={`/contracts/${contract.id}`} key={contract.id} className="block hover:bg-gray-50 p-3 rounded-md transition-colors">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-full mr-4"><Clock className="h-5 w-5 text-red-600" /></div>
                      <div>
                        <p className="font-semibold text-gray-800">{contract.clientName}</p>
                        <p className="text-sm text-gray-500">{contract.title}</p>
                        <p className="text-sm text-red-500 font-medium">Expira em: {new Date(contract.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum contrato a expirar nos próximos 30 dias.</p>
              )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;