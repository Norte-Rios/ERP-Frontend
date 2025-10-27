// ATUALIZADO: Importa useEffect
import React, { useState, useEffect } from 'react';
// ATUALIZADO: Importa Outlet e useNavigate
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CheckSquare, LogOut, Bell, Sun, Calendar, Video, Home, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
const API_URL = import.meta.env.VITE_BACKEND_URL;

// Componente da Barra Lateral Operacional (ATUALIZADO)
const OperationalSidebar = () => {
  // ATUALIZADO: Hooks para logout e navegação
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

 
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/norte-logo.png" alt="Logótipo Norte Rios" className="h-16 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {/* Links... (inalterados) */}
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
        <NavLink to="/profile" className={navLinkClass}>
          <UserIcon className="mr-3 h-5 w-5" />
          Meu Perfil
        </NavLink>

        {/* ATUALIZADO: Botão "Sair" com onClick */}
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

// Componente do Cabeçalho Operacional (ATUALIZADO)
const OperationalHeader = ({ user }) => {
  const [weather, setWeather] = useState({ temp: 28, humidity: 45, condition: 'Ensolarado' });
  const showWaterReminder = weather.temp > 25 || weather.humidity < 50;

  // --- LÓGICA DO AVATAR (ATUALIZADA) ---
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = user?.id ? `${API_URL}/users/${user.id}/avatar` : null;

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const handleAvatarError = () => {
    setAvatarError(true);
  };
  // --- FIM DA LÓGICA DO AVATAR ---

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-700">Painel Operacional</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* ... Clima e Notificações (inalterados) ... */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Sun size={20} className="text-yellow-500" />
          <div>
            <p className="font-semibold">
              {weather.temp}°C - {weather.condition}
            </p>
            {showWaterReminder && (
              <p className="text-xs text-blue-500 font-bold animate-pulse">Beba água!</p>
            )}
          </div>
        </div>
        <div className="relative">
          <button className="relative text-gray-500 hover:text-gray-800">
            <Bell size={22} />
          </button>
        </div>

        {/* DADOS DO UTILIZADOR (ATUALIZADO) */}
        <div className="flex items-center gap-3">
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt="Avatar do Utilizador"
              className="h-10 w-10 rounded-full object-cover"
              onError={handleAvatarError}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-brand-green-light flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
          )}
          {/* FIM DA LÓGICA DO AVATAR */}

          <div>
            <p className="font-semibold text-sm text-gray-800">
              {user?.nome || 'Usuário Operacional'}
            </p>
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
