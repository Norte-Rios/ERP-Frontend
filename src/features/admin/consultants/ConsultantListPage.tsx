import React from 'react';
import { Link } from 'react-router-dom';
import { Consultant } from './types';

interface ConsultantListPageProps {
  consultants: Consultant[];
}

const ConsultantListPage: React.FC<ConsultantListPageProps> = ({ consultants }) => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Consultores</h1>
        <Link to="/consultants/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">
          Novo Consultor
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome Completo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Especialidade</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vínculo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {consultants.map((consultant) => (
              <tr key={consultant.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-medium">{consultant.fullName}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{consultant.specialty}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{consultant.employmentType}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Link to={`/consultants/${consultant.id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold">
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

export default ConsultantListPage;
