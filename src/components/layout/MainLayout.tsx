import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
// 1. Importe os tipos que seu contexto usa
import { Service } from '../../features/admin/services/types';
import { Document } from '../../features/admin/documents/types';

// 2. Defina uma interface para o seu contexto
// (Adicione outras props do App.tsx aqui se precisar delas)
interface AppContextType {
  documents: Document[];
  services: Service[];
  // Adicione outras props que você passa, ex:
  // clients: Client[];
  // users: User[];
  // etc.
}

const MainLayout = () => {
  // O useOutletContext permite receber as props passadas pelo AppRoutes
  // 3. Use a interface para "tipar" o contexto
  const context = useOutletContext<AppContextType>();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Agora o TypeScript sabe o que são 'documents' e 'services' */}
        <Header documents={context.documents} services={context.services} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {/* Passamos o contexto para as rotas aninhadas */}
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;