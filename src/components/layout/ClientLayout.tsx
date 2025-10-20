import React, { useState } from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileArchive, DollarSign, LogOut, Bell, Zap, BookOpen, FileCheck2, X } from 'lucide-react';
import { Client } from '@/features/admin/clients/types';

interface ClientLayoutProps {
  client: Client;
}

// Modal para os módulos de marketing
const MarketingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <Zap className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Funcionalidade Exclusiva</h3>
        <p className="text-gray-600 mt-4">
          Este módulo ainda não está disponível para a sua rede. Para ter acesso a esta e outras vantagens, fale com a Norte Rios Consultoria.
        </p>
        <div className="mt-6">
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};


const ClientSidebar = ({ onMarketingClick }) => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;
    
    const marketingButtonClass = "w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200";

  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/logo.svg" alt="Logótipo" className="h-12 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink to="/client/dashboard" end className={navLinkClass}>
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Meu Painel
        </NavLink>
        <NavLink to="/client/services" className={navLinkClass}>
          <Briefcase className="mr-3 h-5 w-5" />
          Serviços
        </NavLink>
        <NavLink to="/client/documents" className={navLinkClass}>
          <FileArchive className="mr-3 h-5 w-5" />
          Documentos
        </NavLink>
        <NavLink to="/client/financial" className={navLinkClass}>
          <DollarSign className="mr-3 h-5 w-5" />
          Financeiro
        </NavLink>

        {/* Itens de Marketing */}
        <div className="pt-4 mt-4 border-t border-brand-green-light/30">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Novidades</h3>
            <button onClick={onMarketingClick} className={marketingButtonClass}>
                <Zap className="mr-3 h-5 w-5 text-yellow-400" />
                EJA Híbrido
            </button>
             <button onClick={onMarketingClick} className={marketingButtonClass}>
                <BookOpen className="mr-3 h-5 w-5 text-yellow-400" />
                EAD Gestão
            </button>
             <button onClick={onMarketingClick} className={marketingButtonClass}>
                <FileCheck2 className="mr-3 h-5 w-5 text-yellow-400" />
                Protocolo
            </button>
        </div>
      </nav>
      <div className="px-4 py-4 border-t border-brand-green-light/30 mt-auto">
        <button className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

const ClientHeader = ({ client }) => {
    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div></div> 
            <div className="flex items-center gap-6">
                <div className="relative">
                    <button className="relative text-gray-500 hover:text-gray-800">
                        <Bell size={22} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold">
                        {client.companyName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{client.companyName}</p>
                        <p className="text-xs text-gray-500">{client.contactName}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


const ClientLayout: React.FC<ClientLayoutProps> = ({ client }) => {
  const context = useOutletContext<any>();
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100">
      <MarketingModal isOpen={isMarketingModalOpen} onClose={() => setIsMarketingModalOpen(false)} />
      <ClientSidebar onMarketingClick={() => setIsMarketingModalOpen(true)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClientHeader client={client} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;