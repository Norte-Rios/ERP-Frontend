// src/layouts/OperationalLayout.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CheckSquare, LogOut, Bell, Sun, Calendar, Video, Home, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// -------------------------------------------------------------------
// SIDEBAR
const OperationalSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

  const handleLogout = () => {
    logout?.();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/norte-logo.png" alt="Logótipo Norte Rios" className="h-16 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink to="/operational/dashboard" end className={navLinkClass}>
          <Home className="mr-3 h-5 w-5" /> Dashboard
        </NavLink>
        <NavLink to="/operational/tasks" className={navLinkClass}>
          <CheckSquare className="mr-3 h-5 w-5" /> Tarefas
        </NavLink>
        <NavLink to="/operational/agenda" className={navLinkClass}>
          <Calendar className="mr-3 h-5 w-5" /> Agenda
        </NavLink>
        <NavLink to="/operational/meet" className={navLinkClass}>
          <Video className="mr-3 h-5 w-5" /> Meet
        </NavLink>
      </nav>
      <div className="px-4 py-4 border-t border-brand-green-light/30 mt-auto">
        <NavLink to="/profile" className={navLinkClass}>
          <UserIcon className="mr-3 h-5 w-5" /> Meu Perfil
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" /> Sair
        </button>
      </div>
    </aside>
  );
};

// -------------------------------------------------------------------
// HEADER – PEGA USER DIRETO DO CONTEXTO
const OperationalHeader = () => {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const weather = { temp: 28, humidity: 45, condition: 'Ensolarado' };
  const showWaterReminder = weather.temp > 25 || weather.humidity < 50;
  const avatarUrl = user?.id ? `${API_URL}/users/${user.id}/avatar` : null;

  useEffect(() => setAvatarError(false), [user?.id]);
  const handleAvatarError = () => setAvatarError(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setAllTasks([]);
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/tasks`);
        setAllTasks(res.data);
      } catch (err: any) {
        console.error('Erro ao buscar tarefas:', err);
        setError('Falha ao carregar tarefas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  const myPendingTasks = useMemo(() => {
    if (!user?.id || !Array.isArray(allTasks)) return [];

    return allTasks.filter((task: any) => {
      const statusOk = task.status === 'a fazer';
      const assignedToMe =
        task.assignedToId === user.id ||
        task.user?.id === user.id ||
        task.assignedTo?.id === user.id ||
        task.userId === user.id;

      return statusOk && assignedToMe;
    });
  }, [allTasks, user?.id]);

  const totalNotifications = myPendingTasks.length;

  console.log('NOTIFICAÇÕES:', totalNotifications, myPendingTasks.map(t => t.titulo));

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
          <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative">
            <Bell size={22} />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs font-bold">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border z-50">
              <div className="p-3 font-bold border-b bg-gray-50">Minhas Tarefas</div>
              <ul className="divide-y">
                {isLoading && <li className="px-4 py-3 text-sm text-gray-500">Carregando...</li>}
                {error && <li className="px-4 py-3 text-red-600">Erro: {error}</li>}
                {totalNotifications === 0 && !isLoading && (
                  <li className="px-4 py-3 text-sm text-gray-500">Nenhuma tarefa pendente.</li>
                )}
                {myPendingTasks.map((task: any) => (
                  <li key={task.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <NavLink to={`/operational/tasks?highlight=${task.id}`} onClick={() => setIsNotificationsOpen(false)}>
                      <p className="font-semibold text-brand-green-dark text-sm">{task.titulo}</p>
                      <p className="text-xs text-gray-500">{task.data ? new Date(task.data).toLocaleDateString('pt-BR') : ''}</p>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {avatarUrl && !avatarError ? (
            <img src={avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover" onError={handleAvatarError} />
          ) : (
            <div className="h-10 w-10 rounded-full bg-brand-green-light flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{user?.nome || 'Operacional'}</p>
            <p className="text-xs text-gray-500">Equipe Operacional</p>
          </div>
        </div>
      </div>
    </header>
  );
};

// -------------------------------------------------------------------
// LAYOUT – SEM PROPS
const OperationalLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <OperationalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OperationalHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OperationalLayout;