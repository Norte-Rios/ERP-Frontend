import React, { useState, useMemo } from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, DollarSign, LogOut, Calendar, Briefcase, FileArchive, BookOpen, Bell } from 'lucide-react';
import { Service } from '../../features/admin/services/types';
import { Document } from '../../features/admin/documents/types';


const API_URL = import.meta.env.VITE_BACKEND_URL;
// Componente da Barra Lateral do Consultor (inalterado)
const ConsultantSidebar = () => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/logo-norte.png" alt="Logótipo" className="h-12 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink to="/consultant/dashboard" end className={navLinkClass}>
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Meu Painel
        </NavLink>
        <NavLink to="/consultant/services" className={navLinkClass}>
          <Briefcase className="mr-3 h-5 w-5" />
          Meus Serviços
        </NavLink>
        <NavLink to="/consultant/agenda" className={navLinkClass}>
          <Calendar className="mr-3 h-5 w-5" />
          Agenda
        </NavLink>
        <NavLink to="/consultant/tasks" className={navLinkClass}>
          <CheckSquare className="mr-3 h-5 w-5" />
          Minhas Tarefas
        </NavLink>
        <NavLink to="/consultant/documents" className={navLinkClass}>
          <FileArchive className="mr-3 h-5 w-5" />
          Meus Documentos
        </NavLink>
         <NavLink to="/consultant/logbook" className={navLinkClass}>
          <BookOpen className="mr-3 h-5 w-5" />
          Diário de Bordo
        </NavLink>
        <NavLink to="/consultant/payments" className={navLinkClass}>
          <DollarSign className="mr-3 h-5 w-5" />
          Meus Pagamentos
        </NavLink>
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

// Componente do Cabeçalho do Consultor (AGORA COM NOTIFICAÇÕES)
const ConsultantHeader = ({ consultantName, services, documents, consultantId }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const avatarUrl = user?.id ? `${API_URL}/users/${user.id}/avatar` : null;
    const notifications = useMemo(() => {
        const alerts: { text: string, path: string }[] = [];

        // 1. Novos serviços pendentes
        const pendingServices = services.filter(s => s.status === 'Pendente');
        if (pendingServices.length > 0) {
            alerts.push({ text: `${pendingServices.length} novo(s) serviço(s) pendente(s).`, path: '/consultant/services' });
        }

        // 2. Planos de trabalho rejeitados
        const rejectedWorkPlans = services.filter(s => s.workPlan?.status === 'Rejeitado');
        if (rejectedWorkPlans.length > 0) {
            alerts.push({ text: `${rejectedWorkPlans.length} plano(s) de trabalho para rever.`, path: '/consultant/services' });
        }

        // 3. Relatórios finais rejeitados
        const rejectedReports = services.filter(s => s.finalReport?.status === 'Rejeitado');
         if (rejectedReports.length > 0) {
            alerts.push({ text: `${rejectedReports.length} relatório(s) final(is) para rever.`, path: '/consultant/services' });
        }

        // 4. Novos documentos recebidos (que não foram enviados pelo próprio consultor)
        const newDocuments = documents.filter(doc => doc.sender.name !== consultantName && doc.status !== 'Visualizado' && doc.status !== 'Aprovado');
        if (newDocuments.length > 0) {
             alerts.push({ text: `${newDocuments.length} novo(s) documento(s) recebido(s).`, path: '/consultant/documents' });
        }
        
        return alerts;
    }, [services, documents, consultantName]);

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            {/* Espaçador para alinhar à direita */}
            <div></div> 

            <div className="flex items-center gap-6">
                 {/* Ícone de Notificações */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                        className="relative text-gray-500 hover:text-gray-800"
                    >
                        <Bell size={22} />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{notifications.length}</span>
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-20">
                            <div className="p-3 font-bold border-b">Notificações</div>
                            <ul className="py-1 max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((note, index) => (
                                         <li key={index} className="text-sm text-gray-700 hover:bg-gray-100">
                                            <NavLink to={note.path} className="block px-4 py-2" onClick={() => setIsNotificationsOpen(false)}>{note.text}</NavLink>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-sm text-gray-500">Nenhuma notificação nova.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Perfil do Consultor */}
                <div className="flex items-center gap-3">
                    <img 
                        src={avatarUrl}
                        alt="Avatar do Consultor"
                        className="h-10 w-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{consultantName}</p>
                        <p className="text-xs text-gray-500">Consultor</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


// O Layout Principal para a Área do Consultor
const ConsultantLayout = () => {
  const context = useOutletContext<any>();
  
  if (!context || !context.consultants) {
    return <div>A carregar...</div>;
  }

  const currentConsultant = context.consultants[0];

  // Filtra os dados específicos para o consultor logado
  const consultantServices = context.services.filter(service => service.consultants.includes(currentConsultant.fullName));
  const consultantDocuments = context.documents.filter(doc => 
    (doc.recipient.type === 'Consultor' && doc.recipient.id === currentConsultant.id) ||
    (doc.sender.name === currentConsultant.fullName)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <ConsultantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ConsultantHeader 
            consultantName={currentConsultant?.fullName || 'Consultor'} 
            consultantId={currentConsultant?.id}
            services={consultantServices}
            documents={consultantDocuments}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
};

export default ConsultantLayout;