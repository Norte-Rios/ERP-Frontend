import React, { useMemo } from 'react';
import { Service } from '@/features/admin/services/types';
import { Contract } from '@/features/admin/contracts/types';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, PieChart } from 'lucide-react';

// Props que a página de relatórios irá receber
interface ReportsPageProps {
  services: Service[];
  contracts: Contract[];
}

// Componente para os cartões de métricas no topo
const ReportCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ReportsPage = ({ services, contracts }: ReportsPageProps) => {
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Análise de desempenho dos serviços
  const servicePerformanceData = useMemo(() => {
    return services.map(service => {
      // Simplificação: Assume que o primeiro contrato do cliente corresponde ao serviço
      const relatedContract = contracts.find(c => c.clientName === service.clientName);
      const revenue = relatedContract ? relatedContract.annualValue : 0;
      const costs = (service.costs?.travel || 0) + (service.costs?.accommodation || 0) + (service.costs?.food || 0) + (service.costs?.transport || 0);
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        ...service,
        revenue,
        costs,
        profit,
        profitMargin,
      };
    });
  }, [services, contracts]);

  // Métricas gerais para os cartões
  const summaryMetrics = useMemo(() => {
    if (servicePerformanceData.length === 0) {
      return { mostProfitable: 'N/A', leastProfitable: 'N/A', totalProfit: 0, completedServices: 0 };
    }

    const sortedByProfit = [...servicePerformanceData].sort((a, b) => b.profit - a.profit);
    const mostProfitable = sortedByProfit[0];
    const leastProfitable = sortedByProfit[sortedByProfit.length - 1];
    const totalProfit = servicePerformanceData.reduce((sum, s) => sum + s.profit, 0);
    const completedServices = services.filter(s => s.status === 'Concluído').length;

    return {
      mostProfitable: mostProfitable.clientName,
      leastProfitable: leastProfitable.clientName,
      totalProfit,
      completedServices,
    };
  }, [servicePerformanceData, services]);

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
    <div className="container mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Relatório de Desempenho de Serviços</h1>
      
      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard title="Serviço Mais Lucrativo" value={summaryMetrics.mostProfitable} icon={TrendingUp} colorClass="bg-brand-teal" />
        <ReportCard title="Serviço Menos Lucrativo" value={summaryMetrics.leastProfitable} icon={TrendingDown} colorClass="bg-brand-orange" />
        <ReportCard title="Lucro Total (Serviços)" value={formatCurrency(summaryMetrics.totalProfit)} icon={DollarSign} colorClass="bg-brand-green-light" />
        <ReportCard title="Serviços Concluídos" value={summaryMetrics.completedServices} icon={CheckCircle} colorClass="bg-blue-500" />
      </div>

      {/* Tabela de Desempenho */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Serviço (Cliente)</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Receita</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Custos</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Lucro</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Margem</th>
            </tr>
          </thead>
          <tbody>
            {servicePerformanceData.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{service.clientName}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(service.status)}`}>
                    {service.status}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-green-600">{formatCurrency(service.revenue)}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-red-600">{formatCurrency(service.costs)}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-bold">{formatCurrency(service.profit)}</td>
                <td className={`px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold ${service.profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {service.profitMargin.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;