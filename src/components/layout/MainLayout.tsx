import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  // O useOutletContext permite receber as props passadas pelo AppRoutes
  const context = useOutletContext();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Passamos os dados recebidos para o Header */}
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