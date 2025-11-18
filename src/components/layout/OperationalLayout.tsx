import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  LogOut,
  Bell,
  Sun,
  Calendar,
  Video,
  Home,
  User as UserIcon,
} from 'lucide-react';
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
        <img
          src="/norte-logo.png"
          alt="Logótipo Norte Rios"
          className="h-16 mx-auto"
        />
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
// HEADER – NOTIFICAÇÕES
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
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Tarefas "a fazer" em que o usuário está marcado
  const myPendingTasks = useMemo(() => {
    if (!user?.id || !Array.isArray(allTasks)) return [];

    return allTasks.filter((task: any) => {
      const statusOk =
        typeof task.status === 'string' &&
        task.status.toLowerCase() === 'a fazer';

      // Many-to-Many no campo "user" (array) vindo da API
      const isInUserArray =
        Array.isArray(task.user) &&
        task.user.some((u: any) => u?.id === user.id);

      // Se em algum momento você usar "users" ou "userIds", continua suportado:
      const isInUsersArray =
        Array.isArray(task.users) &&
        task.users.some((u: any) => u?.id === user.id);

      const isInUserIdsArray =
        Array.isArray(task.userIds) && task.userIds.includes(user.id);

      // Legado (userId simples ou user objeto único)
      const isLegacyAssigned =
        task.userId === user.id ||
        (!Array.isArray(task.user) && task.user?.id === user.id);

      const isAssignedToMe =
        isInUserArray || isInUsersArray || isInUserIdsArray || isLegacyAssigned;

      return statusOk && isAssignedToMe;
    });
  }, [allTasks, user?.id]);

  const totalNotifications = myPendingTasks.length;

  const getAssigneeNames = (task: any): string | null => {
    // Prioriza o shape atual: "user" como array
    if (Array.isArray(task.user) && task.user.length > 0) {
      return task.user
        .map(
          (u: any) =>
            u?.nome || u?.name || u?.email || 'Responsável sem identificação'
        )
        .join(', ');
    }

    // Suporte opcional a "users"
    if (Array.isArray(task.users) && task.users.length > 0) {
      return task.users
        .map(
          (u: any) =>
            u?.nome || u?.name || u?.email || 'Responsável sem identificação'
        )
        .join(', ');
    }

    // Caso venha um único objeto em "user"
    if (task.user && !Array.isArray(task.user)) {
      return (
        task.user.nome ||
        task.user.name ||
        task.user.email ||
        'Responsável sem identificação'
      );
    }

    return null;
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-700">
          Painel Operacional
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Sun size={20} className="text-yellow-500" />
          <div>
            <p className="font-semibold">
              {weather.temp}°C - {weather.condition}
            </p>
            {showWaterReminder && (
              <p className="text-xs text-blue-500 font-bold animate-pulse">
                Beba água!
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative outline-none"
          >
            <Bell
              size={22}
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 font-bold border-b bg-gray-50 text-gray-700 flex justify-between items-center">
                <span>Minhas Tarefas (A Fazer)</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {totalNotifications}
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {isLoading && (
                  <li className="px-4 py-3 text-sm text-gray-500 text-center">
                    Carregando...
                  </li>
                )}
                {error && (
                  <li className="px-4 py-3 text-red-600 text-sm text-center">
                    {error}
                  </li>
                )}
                {totalNotifications === 0 && !isLoading && !error && (
                  <li className="px-4 py-8 text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
                    <CheckSquare size={24} className="text-gray-300" />
                    <span>Tudo em dia! Nenhuma tarefa pendente.</span>
                  </li>
                )}

                {myPendingTasks.map((task: any) => {
                  const assignees = getAssigneeNames(task);

                  return (
                    <li
                      key={task.id}
                      className="hover:bg-indigo-50 transition-colors"
                    >
                      <NavLink
                        to="/operational/tasks"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block px-4 py-3"
                      >
                        <p className="font-semibold text-gray-800 text-sm mb-1">
                          {task.titulo}
                        </p>

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {task.data
                              ? new Date(task.data).toLocaleDateString(
                                  'pt-BR',
                                  { timeZone: 'UTC' }
                                )
                              : 'Sem data'}
                          </p>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                            Novo
                          </span>
                        </div>

                        {assignees && (
                          <p className="mt-1 text-[11px] text-gray-500 truncate">
                            Responsáveis: {assignees}
                          </p>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
              onError={handleAvatarError}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-brand-green-light flex items-center justify-center shadow-sm">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="hidden md:block">
            <p className="font-semibold text-sm text-gray-700">
              {user?.nome || 'Operacional'}
            </p>
            <p className="text-xs text-gray-500">Equipe Operacional</p>
          </div>
        </div>
      </div>
    </header>
  );
};

// -------------------------------------------------------------------
// LAYOUT
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
