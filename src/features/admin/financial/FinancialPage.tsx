import React, { useMemo, useState } from 'react';
import { RevenueTransaction, Expense, Payment } from './types';
import { DollarSign, Clock, AlertTriangle, ArrowDownCircle, Plane, Car, Building, Utensils, BarChart2, List, CreditCard, PlusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Consultant } from '../consultants/types';
import { ServiceProvider } from '../providers/types';

// Props que a página irá receber
interface FinancialPageProps {
  revenues: RevenueTransaction[];
  expenses: Expense[];
  payments: Payment[];
  consultants: Consultant[];
  providers: ServiceProvider[];
  onUpdatePaymentStatus: (paymentId: string, status: 'Pago' | 'Pendente') => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
}

// NOVO: Modal para adicionar nova despesa
const AddExpenseModal = ({ isOpen, onClose, onSave, consultants }) => {
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<Expense['category']>('Alimentação');
    const [consultantId, setConsultantId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('PIX');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!description || !value || !date || !category) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSave({
            description,
            value: parseFloat(value),
            date,
            category,
            consultantId: consultantId || undefined,
            paymentMethod,
            provider: 'N/A' // Simplificado por agora
        });
        onClose(); // Fecha o modal após salvar
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Nova Despesa</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full input-style" />
                    <input type="number" placeholder="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} className="w-full input-style" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full input-style" />
                    <select value={category} onChange={e => setCategory(e.target.value as Expense['category'])} className="w-full input-style">
                        <option>Alimentação</option>
                        <option>Hospedagem</option>
                        <option>Passagens Aéreas</option>
                        <option>Transportes Terrestres</option>
                        <option>Compras Avulsas</option>
                    </select>
                     <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as Expense['paymentMethod'])} className="w-full input-style">
                        <option>PIX</option>
                        <option>Cartão de Crédito</option>
                        <option>Transferência</option>
                        <option>Dinheiro</option>
                    </select>
                    <select value={consultantId} onChange={e => setConsultantId(e.target.value)} className="w-full input-style">
                        <option value="">Despesa geral (sem consultor)</option>
                        {consultants.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </select>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Salvar Despesa</button>
                </div>
            </div>
        </div>
    );
};


// NOVO: Modal para agendar novo pagamento
const AddPaymentModal = ({ isOpen, onClose, onSave, consultants, providers }) => {
    const [payee, setPayee] = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!payee || !description || !value || !dueDate) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        const [type, id, name] = payee.split('|');
        onSave({
            payee: { id, name, type: type as 'Consultor' | 'Prestador' },
            description,
            value: parseFloat(value),
            dueDate,
            status: 'Pendente'
        });
        onClose();
    };

    const payeeOptions = [
        ...consultants.map(c => ({ value: `Consultor|${c.id}|${c.fullName}`, label: `${c.fullName} (Consultor)` })),
        ...providers.map(p => ({ value: `Prestador|${p.id}|${p.companyName}`, label: `${p.companyName} (Prestador)` }))
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Agendar Novo Pagamento</h3>
                <div className="space-y-4">
                     <select value={payee} onChange={e => setPayee(e.target.value)} className="w-full input-style">
                        <option value="">Selecione o Favorecido</option>
                        {payeeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <input type="text" placeholder="Descrição (Ex: Salário, NF 123)" value={description} onChange={e => setDescription(e.target.value)} className="w-full input-style" />
                    <input type="number" placeholder="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} className="w-full input-style" />
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full input-style" />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Agendar Pagamento</button>
                </div>
            </div>
        </div>
    );
};

// Componente reutilizável para os cartões de métricas
const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
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

// Função para obter o ícone da categoria de despesa
const getExpenseCategoryIcon = (category: Expense['category']) => {
    switch (category) {
        case 'Passagens Aéreas': return <Plane size={18} className="text-blue-500" />;
        case 'Transportes Terrestres': return <Car size={18} className="text-orange-500" />;
        case 'Hospedagem': return <Building size={18} className="text-purple-500" />;
        case 'Alimentação': return <Utensils size={18} className="text-red-500" />;
        default: return <DollarSign size={18} className="text-gray-500" />;
    }
}

// Componente para a Aba de Receitas
const RevenuesTab = ({ revenues, formatCurrency, getStatusClass }) => (
    <div>
        <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
            <thead>
            <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
            </thead>
            <tbody>
            {revenues.map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{revenue.description}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{revenue.clientName}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{formatCurrency(revenue.value)}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{new Date(revenue.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                    <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(revenue.status)}`}>
                    {revenue.status}
                    </span>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
);

// Componente para a Aba de Despesas
const ExpensesTab = ({ expenses, formatCurrency, onAddClick }) => (
    <div>
        <div className="flex justify-end mb-4">
            <button onClick={onAddClick} className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-opacity-90 font-semibold">
                <PlusCircle size={18} />
                Adicionar Despesa
            </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
            <thead>
            <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Categoria</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
            </tr>
            </thead>
            <tbody>
            {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{expense.description}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center gap-2">
                        {getExpenseCategoryIcon(expense.category)}
                        <span>{expense.category}</span>
                    </div>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{formatCurrency(expense.value)}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
);

// Componente para a Aba de Pagamentos
const PaymentsTab = ({ payments, formatCurrency, onUpdatePaymentStatus, onAddClick }) => {
    const getPaymentStatusClass = (status: Payment['status']) => {
        switch (status) {
            case 'Pago': return 'bg-green-100 text-green-800';
            case 'Pendente': return 'bg-yellow-100 text-yellow-800';
            case 'Agendado': return 'bg-blue-100 text-blue-800';
            case 'Atrasado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={onAddClick} className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-opacity-90 font-semibold">
                    <PlusCircle size={18} />
                    Agendar Pagamento
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Favorecido</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <p className="font-semibold">{payment.payee.name}</p>
                                    <p className="text-xs text-gray-500">{payment.payee.type}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{payment.description}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{formatCurrency(payment.value)}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                    <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getPaymentStatusClass(payment.status)}`}>
                                      {payment.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                    {payment.status !== 'Pago' && (
                                        <button 
                                            onClick={() => onUpdatePaymentStatus(payment.id, 'Pago')}
                                            className="text-green-600 hover:text-green-900 font-semibold"
                                        >
                                            Marcar como Pago
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Componente para o Dashboard Financeiro
const DashboardTab = ({ revenues, expenses, revenueMetrics, expenseMetrics, formatCurrency }) => {
    
    const chartData = useMemo(() => {
        const dataByMonth = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        revenues.filter(r => r.status === 'Recebido').forEach(r => {
            const paymentDate = r.paymentDate ? new Date(r.paymentDate) : new Date(r.dueDate);
            const month = paymentDate.getMonth();
            const monthName = monthNames[month];
            if (!dataByMonth[monthName]) dataByMonth[monthName] = { name: monthName, Receitas: 0, Despesas: 0 };
            dataByMonth[monthName].Receitas += r.value;
        });

        expenses.forEach(e => {
            const month = new Date(e.date).getMonth();
            const monthName = monthNames[month];
            if (!dataByMonth[monthName]) dataByMonth[monthName] = { name: monthName, Receitas: 0, Despesas: 0 };
            dataByMonth[monthName].Despesas += e.value;
        });

        return monthNames.map(name => dataByMonth[name] || { name, Receitas: 0, Despesas: 0 });

    }, [revenues, expenses]);
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Recebido" value={formatCurrency(revenueMetrics.totalReceived)} icon={DollarSign} colorClass="bg-brand-teal" />
                <MetricCard title="Total de Despesas" value={formatCurrency(expenseMetrics.totalExpenses)} icon={ArrowDownCircle} colorClass="bg-brand-orange" />
                <MetricCard title="Pendente" value={formatCurrency(revenueMetrics.totalPending)} icon={Clock} colorClass="bg-yellow-500" />
                <MetricCard title="Vencido" value={formatCurrency(revenueMetrics.totalOverdue)} icon={AlertTriangle} colorClass="bg-red-500" />
            </div>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Entradas vs. Saídas (Mensal)</h3>
                <div className="h-80 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="Receitas" fill="#38806E" />
                            <Bar dataKey="Despesas" fill="#F0A23E" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


const FinancialPage = ({ revenues, expenses, payments, consultants, providers, onUpdatePaymentStatus, onAddExpense, onAddPayment }: FinancialPageProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenues' | 'expenses' | 'payments'>('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const revenueMetrics = useMemo(() => {
    const totalReceived = revenues.filter(r => r.status === 'Recebido').reduce((sum, r) => sum + r.value, 0);
    const totalPending = revenues.filter(r => r.status === 'Pendente').reduce((sum, r) => sum + r.value, 0);
    const totalOverdue = revenues.filter(r => r.status === 'Atrasado').reduce((sum, r) => sum + r.value, 0);
    return { totalReceived, totalPending, totalOverdue };
  }, [revenues]);

  const expenseMetrics = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
    return { totalExpenses };
  }, [expenses]);

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusClass = (status: RevenueTransaction['status']) => {
    switch (status) {
      case 'Recebido': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const TabButton = ({ isActive, onClick, children, icon: Icon }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${isActive ? 'bg-white text-brand-green-dark border-b-2 border-brand-green-dark' : 'text-gray-500 hover:text-gray-700'}`}>
        <Icon size={16} />
        {children}
    </button>
  )

  return (
    <div className="container mx-auto">
        <AddExpenseModal 
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSave={onAddExpense}
            consultants={consultants}
        />
        <AddPaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSave={onAddPayment}
            consultants={consultants}
            providers={providers}
        />

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Painel Financeiro</h1>
      <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-6">
              <TabButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={BarChart2}>Dashboard</TabButton>
              <TabButton isActive={activeTab === 'revenues'} onClick={() => setActiveTab('revenues')} icon={List}>Receitas</TabButton>
              <TabButton isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={List}>Despesas</TabButton>
              <TabButton isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={CreditCard}>Pagamentos</TabButton>
          </nav>
      </div>

      <div className="mt-6">
          {activeTab === 'dashboard' && <DashboardTab revenues={revenues} expenses={expenses} revenueMetrics={revenueMetrics} expenseMetrics={expenseMetrics} formatCurrency={formatCurrency} />}
          {activeTab === 'revenues' && <RevenuesTab revenues={revenues} formatCurrency={formatCurrency} getStatusClass={getStatusClass} />}
          {activeTab === 'expenses' && <ExpensesTab expenses={expenses} formatCurrency={formatCurrency} onAddClick={() => setIsExpenseModalOpen(true)} />}
          {activeTab === 'payments' && <PaymentsTab payments={payments} formatCurrency={formatCurrency} onUpdatePaymentStatus={onUpdatePaymentStatus} onAddClick={() => setIsPaymentModalOpen(true)} />}
      </div>
    </div>
  );
};

export default FinancialPage;