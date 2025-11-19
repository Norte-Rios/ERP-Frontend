import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, Video, Loader2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '../../../auth/AuthContext.tsx';

// ====================== TIPOS CORRIGIDOS ======================
interface TaskUser {
  id: string;
  nome: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: any;
}

interface Task {
  id: string;
  titulo: string;
  status: string;
  data?: string;
  description?: string;
  prazo?: string | null;
  user: TaskUser[]; // ← AGORA É ARRAY!
  etiqueta?: Array<{ id: string; nome: string; color: string }>;
}

interface Meet {
  id: string;
  titulo: string;
  data: string;
  horarioIni: string;
  horarioFim: string;
  googleMeetLink?: string;
}

interface Event {
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  id?: string;
}

// ====================== CARD ======================
const MetricCard = ({ title, value, icon: Icon, color, linkTo }: any) => (
  <Link
    to={linkTo}
    className={`block p-6 rounded-lg shadow-md flex items-start justify-between ${color} text-white hover:opacity-90 transition-opacity`}
  >
    <div>
      <h3 className="text-sm font-medium text-white/80">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
    <Icon className="h-8 w-8 text-white/50" />
  </Link>
);

// ====================== DASHBOARD ======================
const OperationalDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const googleId = localStorage.getItem('googleId');

  // Normalização forte de status
  const normalizeStatus = (rawStatus: any): string => {
    if (!rawStatus) return 'Sem Status';
    const s = String(rawStatus).trim().toLowerCase();
    if (s.includes('a fazer') || s.includes('pendente') || s.includes('todo')) return 'A fazer';
    if (s.includes('andamento') || s.includes('progresso') || s.includes('doing')) return 'Em andamento';
    if (s.includes('conclu') || s.includes('feito') || s.includes('done') || s.includes('finaliz') || s.includes('revisão')) return 'Concluído';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // ====================== FETCH ======================
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError('Usuário não identificado.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const promises: Promise<any>[] = [axios.get(`${API_URL}/tasks`)];

        if (googleId) {
          promises.push(axios.get(`${API_URL}/google/events/${googleId}`));
          promises.push(axios.get(`${API_URL}/google/meets/${googleId}`));
        } else {
          promises.push(Promise.resolve({ data: [] }));
          promises.push(Promise.resolve({ data: [] }));
        }

        const [tasksRes, eventsRes, meetsRes] = await Promise.all(promises);

        const allTasks: Task[] = tasksRes.data || [];

        // FILTRAGEM CORRETA: user é um array de responsáveis
        const myTasks = allTasks.filter((task) =>
          Array.isArray(task.user) &&
          task.user.some((u) => u.id === user.id)
        );

        console.log('TODAS as tarefas:', allTasks.length);
        console.log('Minhas tarefas (atribuídas a mim):', myTasks);

        setTasks(myTasks);
        setEvents(eventsRes.data || []);
        setMeets(meetsRes.data || []);
      } catch (err: any) {
        console.error('Erro no dashboard:', err);
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, API_URL, googleId]);

  // ====================== DADOS DO GRÁFICO ======================
  const taskStatusData = useMemo(() => {
    if (tasks.length === 0) return [];

    const counts: Record<string, number> = {};

    tasks.forEach((task) => {
      const status = normalizeStatus(task.status);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);

  const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#FF6B6B'];

  // ====================== OUTROS MEMOS ======================
  const taskSummary = useMemo(() => ({
    pending: tasks.filter(t => normalizeStatus(t.status) === 'A fazer').length,
  }), [tasks]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .map(e => ({
        ...e,
        startDateTime: new Date(e.start?.dateTime || `${e.start?.date || ''}T00:00:00`),
      }))
      .filter(e => e.startDateTime >= now)
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime())
      .slice(0, 5);
  }, [events]);

  const upcomingMeets = useMemo(() => {
    const now = new Date();
    return meets
      .map(m => ({
        ...m,
        startDateTime: new Date(`${m.data}T${m.horarioIni}`),
      }))
      .filter(m => m.startDateTime >= now)
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime())
      .slice(0, 5);
  }, [meets]);

  // ====================== RENDER ======================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg m-6">
        <strong>Erro: </strong>{error}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Meu Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Tarefas Pendentes" value={taskSummary.pending} icon={CheckSquare} color="bg-brand-orange" linkTo="/operational/tasks" />
        <MetricCard title="Próximos Eventos" value={upcomingEvents.length} icon={Calendar} color="bg-brand-teal" linkTo="/operational/agenda" />
        <MetricCard title="Próximas Reuniões" value={upcomingMeets.length} icon={Video} color="bg-brand-green-light" linkTo="/operational/meet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRÁFICO */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Status das Minhas Tarefas
          </h3>

          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {taskStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} tarefa(s)`} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500">
              <p className="text-center">
                <strong>Nenhuma tarefa atribuída a você ainda.</strong><br />
                Total de tarefas no sistema: {tasks.length === 0 ? 'carregando...' : tasks.length}
              </p>
            </div>
          )}
        </div>

        {/* Listas rápidas */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Eventos */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Próximos Eventos</h3>
              <Link to="/operational/agenda" className="text-indigo-600 hover:underline text-sm">Ver todos</Link>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingEvents.length > 0 ? upcomingEvents.map((e, i) => (
                <div key={e.id || i} className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium text-sm">{e.summary}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(e.start?.dateTime || e.start?.date || '').toLocaleString('pt-BR')}
                  </p>
                </div>
              )) : <p className="text-gray-500 text-sm">Nenhum evento próximo.</p>}
            </div>
          </div>

          {/* Reuniões */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Próximas Reuniões</h3>
              <Link to="/operational/meet" className="text-indigo-600 hover:underline text-sm">Ver todas</Link>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingMeets.length > 0 ? upcomingMeets.map(meet => (
                <div key={meet.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{meet.titulo}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(`${meet.data}T${meet.horarioIni}`).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {meet.googleMeetLink && (
                      <a href={meet.googleMeetLink} target="_blank" rel="noopener noreferrer"
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 whitespace-nowrap">
                        Entrar
                      </a>
                    )}
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm">Nenhuma reunião agendada.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalDashboardPage;