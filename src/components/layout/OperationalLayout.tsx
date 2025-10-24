import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// ADICIONADO UserIcon
import { CheckSquare, LogOut, Bell, Sun, Calendar, Video, Home, User as UserIcon } from 'lucide-react';
// Importa o useAuth para o sidebar (embora o header receba via props)
import { useAuth } from '../../auth/AuthContext';

// Componente da Barra Lateral Operacional
const OperationalSidebar = () => {
    // const { user } = useAuth(); // Descomente se precisar do user aqui

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/norte-logo.png" alt="Logótipo Norte Rios" className="h-16 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {/* Link direto para o Dashboard Operacional */}
        <NavLink to="/operational/dashboard" end className={navLinkClass}>
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink to="/operational/tasks" className={navLinkClass}>
          <CheckSquare className="mr-3 h-5 w-5" />
          Tarefas
        </NavLink>
        <NavLink to="/operational/agenda" className={navLinkClass}>
          <Calendar className="mr-3 h-5 w-5" />
          Agenda
        </NavLink>
        <NavLink to="/operational/meet" className={navLinkClass}>
          <Video className="mr-3 h-5 w-5" />
          Meet
        </NavLink>
      </nav>
      {/* Perfil e Sair */}
      <div className="px-4 py-4 border-t border-brand-green-light/30 mt-auto">
        
        {/* LINK PARA O PERFIL (ADICIONADO) */}
        <NavLink to="/profile" className={navLinkClass}>
          <UserIcon className="mr-3 h-5 w-5" />
          Meu Perfil
        </NavLink>

        <button className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

// Componente do Cabeçalho Operacional
const OperationalHeader = ({ user }) => { // Recebe 'user' das props (via AppRoutes)
    const [weather, setWeather] = useState({ temp: 28, humidity: 45, condition: 'Ensolarado' });
    const showWaterReminder = weather.temp > 25 || weather.humidity < 50;

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div>
                 <h1 className="text-xl font-semibold text-gray-700">Painel Operacional</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Sun size={20} className="text-yellow-500" />
                    <div>
                        <p className="font-semibold">{weather.temp}°C - {weather.condition}</p>
                        {showWaterReminder && <p className="text-xs text-blue-500 font-bold animate-pulse">Beba água!</p>}
                    </div>
                </div>
                <div className="relative">
                    <button className="relative text-gray-500 hover:text-gray-800">
                        <Bell size={22} />
                        {/* Lógica de notificações pode ser adicionada aqui */}
                    </button>
                </div>
                {/* DADOS DO UTILIZADOR (ATUALIZADO) */}
                <div className="flex items-center gap-3">
                    <img
                        src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id || 'operational'}`} // Usa avatarUrl se existir
                        alt="Avatar do Utilizador"
                        className="h-10 w-10 rounded-full object-cover" // Adicionado object-cover
                    />
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{user?.nome || 'Usuário Operacional'}</p> {/* Usa user.nome */}
                        <p className="text-xs text-gray-500">Operacional</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


// O Layout Principal para a Área Operacional
const OperationalLayout = ({ user }) => { // Recebe user como prop (de AppRoutes)
  return (
    <div className="flex h-screen bg-gray-100">
      <OperationalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OperationalHeader user={user} /> {/* Passa user (operationalUser) para o Header */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet /> {/* O contexto das rotas pai será passado aqui */}
        </main>
      </div>
    </div>
  );
};

export default OperationalLayout;