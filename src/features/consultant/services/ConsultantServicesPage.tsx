import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '@/features/admin/services/types';

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

const ConsultantServicesPage = ({ services, onUpdateService }) => {

  const handleAcceptService = (service: Service) => {
    if (service) {
      onUpdateService({ ...service, status: 'Em Andamento' });
    }
  };

  const handleDeclineService = (service: Service) => {
    if (service) {
      onUpdateService({ ...service, status: 'Cancelado' });
    }
  };

  return (
    <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Meus Serviços</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
                <div key={service.id} className="bg-white shadow-md rounded-lg flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <Link to={`/consultant/services/${service.id}`} className="block p-6 flex-grow">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{service.clientName}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>
                                {service.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                            <p><strong>Gestor:</strong> {service.projectManager}</p>
                            <p><strong>Prazo:</strong> {new Date(service.startDate).toLocaleDateString()} - {new Date(service.endDate).toLocaleDateString()}</p>
                        </div>
                    </Link>
                    {service.status === 'Pendente' && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => handleDeclineService(service)} className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                                Recusar
                            </button>
                            <button onClick={() => handleAcceptService(service)} className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                                Aceitar
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {services.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                    <p>Nenhum serviço foi atribuído a si de momento.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ConsultantServicesPage;