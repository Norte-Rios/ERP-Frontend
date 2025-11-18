import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bell, FileText, Sun } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext'; // ajuste o caminho se necessário

// ---- Assume types are imported or defined here ----
type Document = {
  id: string;
  status: string; // e.g., 'Recebido', 'Enviado'
  // ... other document properties
};

type Service = {
  id: string;
  status: string; // e.g., 'Pendente'
  // ... other service properties
};

// Define Task type based on backend (mais flexível, igual ao usado em tarefas)
type Task = {
  id: string;
  titulo: string;
  status: string; // e.g., 'a fazer', 'em andamento'
  data?: string;
  user?: any | any[];
  users?: any[];
  userIds?: string[];
  userId?: string;
};
// ---------------------------------------------------

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Header = ({ documents, services }: { documents: Document[]; services: Service[] }) => {
  const { user } = useAuth();

  // Estados para controlar a visibilidade dos dropdowns
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Estado para simular dados do tempo
  const [weather] = useState({ temp: 28, humidity: 45, condition: 'Ensolarado' });

  // --- Estados para Tarefas ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // ---------------------------

  // --- Fetch Tasks ---
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoadingTasks(true);
      setFetchError(null);
      try {
        const response = await axios.get<Task[]>(`${API_URL}/tasks`);
        setTasks(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        setFetchError('Não foi possível carregar as tarefas.');
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);
  // -------------------

  // Helper: verifica se a task está atribuída ao usuário logado
  const isAssignedToMe = (task: any): boolean => {
    if (!user?.id) return false;

    const statusOk =
      typeof task.status === 'string' &&
      task.status.toLowerCase() === 'a fazer';

    if (!statusOk) return false;

    const isInUserArray =
      Array.isArray(task.user) &&
      task.user.some((u: any) => u?.id === user.id);

    const isInUsersArray =
      Array.isArray(task.users) &&
      task.users.some((u: any) => u?.id === user.id);

    const isInUserIdsArray =
      Array.isArray(task.userIds) && task.userIds.includes(user.id);

    const isLegacyAssigned =
      task.userId === user.id ||
      (!Array.isArray(task.user) && task.user?.id === user.id);

    return isInUserArray || isInUsersArray || isInUserIdsArray || isLegacyAssigned;
  };

  // Helper: nome(s) dos responsáveis (como no OperationalHeader)
  const getAssigneeNames = (task: any): string | null => {
    if (Array.isArray(task.user) && task.user.length > 0) {
      return task.user
        .map(
          (u: any) =>
            u?.nome || u?.name || u?.email || 'Responsável sem identificação'
        )
        .join(', ');
    }

    if (Array.isArray(task.users) && task.users.length > 0) {
      return task.users
        .map(
          (u: any) =>
            u?.nome || u?.name || u?.email || 'Responsável sem identificação'
        )
        .join(', ');
    }

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

  // Todas as tarefas "a fazer"
  const pendingTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          typeof task.status === 'string' &&
          task.status.toLowerCase() === 'a fazer'
      ),
    [tasks]
  );

  // Tarefas "a fazer" atribuídas ao usuário logado
  const myPendingTasks = useMemo(
    () => pendingTasks.filter((task) => isAssignedToMe(task)),
    [pendingTasks, user?.id]
  );



  const totalNotifications = myPendingTasks.length;

  // Lógica para o lembrete de beber água
  const showWaterReminder = weather.temp > 25 || weather.humidity < 50;

  // Fecha o dropdown ao clicar fora (se quiser ativar, descomente o setIsNotificationsOpen(false))
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNotificationsOpen) {
        // setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Título do Painel */}
      <h1 className="text-xl font-semibold text-gray-700">Painel do Administrador</h1>

      <div className="flex items-center gap-6">
        {/* Widget do Tempo */}
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

        {/* Ícones de Alerta */}
        <div className="flex items-center gap-4">
          {/* Alertas Gerais + Minhas Tarefas */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative text-gray-500 hover:text-gray-800 focus:outline-none"
            >
              <Bell size={22} />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg border z-20">
                <div className="p-3 font-bold border-b text-gray-800 flex justify-between items-center bg-gray-50">
                  <span>Notificações</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {totalNotifications}
                  </span>
                </div>

                <ul className="py-1 divide-y divide-gray-100">
                  {/* Loading / Erro */}
                  {isLoadingTasks && (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      A carregar tarefas...
                    </li>
                  )}
                  {fetchError && (
                    <li className="px-4 py-2 text-sm text-red-500">
                      {fetchError}
                    </li>
                  )}

                  {/* Se já carregou e não deu erro, mostra grupos */}
                  {!isLoadingTasks && !fetchError && (
                    <>
                     
                      
                      {/* Grupo: Minhas tarefas (a fazer) */}
                      {user?.id && (
                        <>
                          <li className="px-4 py-2 bg-gray-50 text-[11px] font-semibold text-gray-500">
                            Minhas tarefas (a fazer) ({myPendingTasks.length})
                          </li>

                          {myPendingTasks.length > 0 ? (
                            myPendingTasks.map((task) => {
                              const assignees = getAssigneeNames(task);

                              return (
                                <li
                                  key={task.id}
                                  className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
                                >
                                  <a
                                    href="/tasks"
                                    className="block"
                                    onClick={() => setIsNotificationsOpen(false)}
                                  >
                                    <p className="font-semibold text-gray-800 text-sm mb-1">
                                      {task.titulo || 'Tarefa sem título'}
                                    </p>
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
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
                                  </a>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-2 text-xs text-gray-400 italic">
                              Nenhuma tarefa atribuída em “a fazer”.
                            </li>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Sem nenhuma notificação (após carregar, sem erro, e nada nos dois grupos) */}
                  {!isLoadingTasks &&
                    !fetchError &&
                    
                    myPendingTasks.length === 0 && (
                      <li className="px-4 py-4 text-sm text-gray-500 text-center">
                        Nenhuma notificação nova.
                      </li>
                    )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
