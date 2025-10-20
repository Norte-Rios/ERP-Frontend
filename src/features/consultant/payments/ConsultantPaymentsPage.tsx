import React from 'react';

const getStatusClass = (status) => {
    switch (status) {
        case 'Pago': return 'bg-green-100 text-green-800';
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Agendado': return 'bg-blue-100 text-blue-800';
        case 'Atrasado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


const ConsultantPaymentsPage = ({ payments }) => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Pagamentos</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{payment.description}</td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{formatCurrency(payment.value)}</td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(payment.status)}`}>
                                  {payment.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ConsultantPaymentsPage;
