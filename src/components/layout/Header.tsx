import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // Import axios
import { Bell, FileText, Sun } from 'lucide-react'; // Removed unused icons

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

// Define Task type based on backend
type Task = {
  id: string;
  titulo: string; // Matches BackendTask
  status: string; // Matches BackendTask (e.g., 'a fazer', 'em andamento')
};
// ---------------------------------------------------

const API_URL = import.meta.env.VITE_BACKEND_URL; // Define API URL

const Header = ({ documents, services }: { documents: Document[]; services: Service[] }) => {
  // Estados para controlar a visibilidade dos dropdowns
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // const [isDocsOpen, setIsDocsOpen] = useState(false); // Docs dropdown seems removed/unused

  // Estado para simular dados do tempo
  const [weather, setWeather] = useState({ temp: 28, humidity: 45, condition: 'Ensolarado' });

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
        const response = await axios.get<Task[]>(`${API_URL}/tasks`); // Fetch from backend
        setTasks(response.data);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        setFetchError("Não foi possível carregar as tarefas.");
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []); // Executa apenas na montagem
  // -------------------

  // --- Calcula Tarefas Novas (Exemplo: status 'a fazer') ---
  const newTasks = useMemo(() => {
    // Define which status indicates a "new" task notification
    return tasks.filter(task => task.status === 'a fazer');
  }, [tasks]);
  // ----------------------------------------------------

  const totalNotifications =  newTasks.length;

  // Lógica para o lembrete de beber água (sem alterações)
  const showWaterReminder = weather.temp > 25 || weather.humidity < 50;

  // Fecha o dropdown ao clicar fora (opcional, mas boa prática)
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          // Lógica para verificar se o clique foi fora do botão e do dropdown
          // Esta parte pode precisar de refs para ser mais robusta
          if (isNotificationsOpen) { // Simple version: close if open and clicked anywhere
             // setIsNotificationsOpen(false); // Descomente se quiser fechar ao clicar fora
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
        {/* Widget do Tempo (sem alterações) */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
            <Sun size={20} className="text-yellow-500" />
            <div>
                <p className="font-semibold">{weather.temp}°C - {weather.condition}</p>
                {showWaterReminder && <p className="text-xs text-blue-500 font-bold animate-pulse">Beba água!</p>}
            </div>
        </div>

        {/* Ícones de Alerta */}
        <div className="flex items-center gap-4">
            {/* Alertas Gerais */}
            <div className="relative">
                <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative text-gray-500 hover:text-gray-800 focus:outline-none" // Added focus:outline-none
                >
                    <Bell size={22} />
                    {totalNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{totalNotifications}</span>
                        </span>
                    )}
                </button>
                {/* --- Dropdown de Notificações ATUALIZADO --- */}
                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg border z-20">
                        <div className="p-3 font-bold border-b text-gray-800">Notificações</div>
                        <ul className="py-1 divide-y divide-gray-100"> {/* Added dividers */}
                            {/* Loading/Error States for Tasks */}
                            {isLoadingTasks && (
                                <li className="px-4 py-2 text-sm text-gray-500">A carregar tarefas...</li>
                            )}
                            {fetchError && (
                                <li className="px-4 py-2 text-sm text-red-500">{fetchError}</li>
                            )}

                            {/* New Tasks List */}
                            {!isLoadingTasks && newTasks.length > 0 && (
                                <>
                                    {newTasks.map(task => (
                                        <li key={task.id} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                            {/* Link para a página de tarefas ou tarefa específica */}
                                            <a href="/tasks" className="flex items-center gap-2">
                                                <span className="font-semibold text-blue-600">Tarefa:</span>
                                                <span className='truncate'>{task.titulo || 'Tarefa sem título'}</span>
                                                {/* Poderia adicionar status ou data aqui se quisesse */}
                                            </a>
                                        </li>
                                    ))}
                                </>
                            )}

                            

                            
                            {/* No New Notifications Message */}
                            {!isLoadingTasks && totalNotifications === 0 && (
                                <li className="px-4 py-2 text-sm text-gray-500">Nenhuma notificação nova.</li>
                            )}
                        </ul>
                    </div>
                )}
                {/* --- Fim do Dropdown --- */}
            </div>
            {/* Outros ícones, se houver */}
        </div>
      </div>
    </header>
  );
};

export default Header;