import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CheckSquare, LogOut, Bell, Sun, Calendar, Video } from 'lucide-react';

// Componente da Barra Lateral Operacional
const OperationalSidebar = () => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/logo.svg" alt="Logótipo" className="h-12 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
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
      <div className="px-4 py-4 border-t border-brand-green-light/30 mt-auto">
        <button className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

// Componente do Cabeçalho Operacional
const OperationalHeader = ({ user }) => {
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
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <img 
                        src={`https://i.pravatar.cc/150?u=${user?.id || 'operational'}`}
                        alt="Avatar do Utilizador"
                        className="h-10 w-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{user?.fullName || 'Usuário Operacional'}</p>
                        <p className="text-xs text-gray-500">Operacional</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


// O Layout Principal para a Área Operacional
const OperationalLayout = ({ user }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <OperationalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OperationalHeader user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OperationalLayout;