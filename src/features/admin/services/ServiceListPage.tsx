import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from './types';
import { mockServices } from '@/features/admin/services/mockData';

const getStatusClass = (status: Service['status']) => {
    switch (status) {
        case 'Em Andamento':
            return 'bg-blue-100 text-blue-800';
        case 'Pendente':
            return 'bg-yellow-100 text-yellow-800';
        case 'Concluído':
            return 'bg-green-100 text-green-800';
        case 'Cancelado':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const ServiceListPage = () => {
  return (
    <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Serviços</h2>
            <Link to="/services/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
                Novo Serviço
            </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cliente
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Gestor do Projeto
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Datas
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {mockServices.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{service.clientName}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{service.projectManager}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>
                                    <span className="relative">{service.status}</span>
                                </span>
                            </td>
                             <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                    {new Date(service.startDate).toLocaleDateString()} - {new Date(service.endDate).toLocaleDateString()}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <Link to={`/services/${service.id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                    Ver Detalhes
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ServiceListPage;