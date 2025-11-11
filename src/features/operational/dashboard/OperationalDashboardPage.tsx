import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // <- Descomentado
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, Video, Loader2, Users } from 'lucide-react'; // Adicionado Users
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../../../auth/AuthContext.tsx'; 

// Tipos (simplificados, ajuste conforme necessário)
interface Task {
  id: string;
  titulo: string;
  status: string; // 'a fazer', 'em andamento', 'concluído', etc.
  data?: string;
  user?: { id: string; nome: string };
}

interface Meet {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  horarioIni: string; // HH:MM
  horarioFim: string; // HH:MM
  googleMeetLink?: string;
}

interface Event {
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    id?: string;
}

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  status: string; // 'Ativo', 'Inativo'
}

// --- DADOS MOCK REMOVIDOS ---

// Componente de Card de Métrica
const MetricCard = ({ title, value, icon: Icon, color, linkTo }: any) => ( // Adicionado 'any' para simplicidade
  <Link to={linkTo} className={`block p-6 rounded-lg shadow-md flex items-start justify-between ${color} text-white hover:opacity-90 transition-opacity`}>
    <div>
      <h3 className="text-sm font-medium text-white/80">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
    <Icon className="h-8 w-8 text-white/50" />
  </Link>
);

// Componente Principal do Dashboard Operacional
const OperationalDashboardPage: React.FC = () => {
  const { user } = useAuth(); // Pega o usuário logado do contexto
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  // const [users, setUsers] = useState<User[]>([]); // 'users' não é usado neste componente
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar import.meta.env
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const googleId = localStorage.getItem('googleId');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError('Não foi possível identificar o usuário logado.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // CORREÇÃO 1: Tipar o array de promises como 'any[]'
        const fetchPromises: Promise<any>[] = [
          axios.get(`${API_URL}/tasks`), // Busca TODAS as tarefas
        ];

        // Só busca eventos e meets se tiver googleId
        if (googleId) {
          fetchPromises.push(axios.get(`${API_URL}/google/events/${googleId}`));
          fetchPromises.push(axios.get(`${API_URL}/google/meets/${googleId}`));
        } else {
          console.warn('Google ID não encontrado. Não foi possível buscar eventos e meets.');
          // CORREÇÃO 2: Usar 'as any' para bater com o tipo do array
           fetchPromises.push(Promise.resolve({ data: [] } as any)); // Para events
           fetchPromises.push(Promise.resolve({ data: [] } as any)); // Para meets
        }

        const [tasksRes, eventsRes, meetsRes] = await Promise.all(fetchPromises);

        // Filtra as tarefas no frontend para mostrar apenas as do usuário logado
        const allTasks: Task[] = tasksRes.data || [];
        const myTasks = allTasks.filter(task => task.user?.id === user.id);

        setTasks(myTasks);
        setEvents(eventsRes.data || []);
        setMeets(meetsRes.data || []);
      } catch (err: any) {
        console.error('Erro ao buscar dados do dashboard:', err);
        let errorMsg = 'Erro ao carregar dados do dashboard.';
        if (err.response?.status === 401) {
          errorMsg = 'Sessão expirada ou inválida. Faça login novamente.';
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
        setTasks([]);
        setEvents([]);
        setMeets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, API_URL, googleId]);

  // --- Cálculos para os Cards e Gráficos ---
  const taskSummary = useMemo(() => {
    const pending = tasks.filter(t => t.status?.toLowerCase() === 'a fazer').length;
    return { pending };
  }, [tasks]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .map(e => ({ ...e, startDateTime: new Date(e.start?.dateTime || `${e.start?.date}T00:00:00`) }))
      .filter(e => e.startDateTime >= now)
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime())
      .slice(0, 5);
  }, [events]);

  const upcomingMeets = useMemo(() => {
    const now = new Date();
    return meets
      .map(m => ({ ...m, startDateTime: new Date(`${m.data}T${m.horarioIni}`) }))
      .filter(m => m.startDateTime >= now)
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime())
      .slice(0, 5);
  }, [meets]);

  // Dados para o gráfico de status das tarefas
  const taskStatusData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      const statusKey = task.status || 'Sem Status';
      (acc as any)[statusKey] = ((acc as any)[statusKey] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value: value as number }));
  }, [tasks]);

  const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE'];

  // --- Renderização ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-6" role="alert">
        <strong className="font-bold">Erro!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800">Meu Dashboard</h1>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Minhas Tarefas Pendentes"
          value={taskSummary.pending}
          icon={CheckSquare}
          color="bg-brand-orange"
          linkTo="/operational/tasks"
        />
        <MetricCard
          title="Meus Próximos Eventos"
          value={upcomingEvents.length}
          icon={Calendar}
          color="bg-brand-teal"
          linkTo="/operational/agenda"
        />
        <MetricCard
          title="Minhas Próximas Reuniões"
          value={upcomingMeets.length}
          icon={Video}
          color="bg-brand-green-light"
          linkTo="/operational/meet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Status das Tarefas */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status das Minhas Tarefas</h3>
          {tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  // CORREÇÃO 3: Converter 'percent' para 'Number'
                  label={({ name, percent }) => `${name} (${(Number(percent) * 100).toFixed(0)}%)`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center mt-10">Nenhuma tarefa atribuída a você.</p>
          )}
        </div>

        {/* Listas Rápidas */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Próximos Eventos da Agenda */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Próximos Eventos (Agenda)</h3>
              <Link to="/operational/agenda" className="text-sm font-semibold text-indigo-600 hover:underline">
                Ver Agenda
              </Link>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div key={event.id || `event-${index}`} className="p-3 border rounded-md bg-gray-50">
                    <p className="font-semibold text-sm text-gray-800">{event.summary}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.start?.dateTime || `${event.start?.date}T00:00:00`).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum evento próximo na agenda.</p>
              )}
            </div>
          </div>

          {/* Próximas Reuniões */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Próximas Reuniões (Meet)</h3>
              <Link to="/operational/meet" className="text-sm font-semibold text-indigo-600 hover:underline">
                Ver Meets
              </Link>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {upcomingMeets.length > 0 ? (
                upcomingMeets.map(meet => (
                  <div key={meet.id} className="p-3 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-gray-800 flex-1 mr-2">{meet.titulo}</p>
                      {meet.googleMeetLink && (
                        <a
                          href={meet.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex-shrink-0"
                        >
                          Entrar
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(`${meet.data}T${meet.horarioIni}`).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma reunião próxima agendada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalDashboardPage;