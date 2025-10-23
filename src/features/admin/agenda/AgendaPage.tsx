import React, { useState, useMemo, useEffect } from 'react';

import { ChevronLeft, ChevronRight, X, CheckCircle, Video } from 'lucide-react';

import { Service } from '../services/types';

import { Task, CalendarEvent } from './types';

import { Link, useOutletContext } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL 

// Funções auxiliares para manipulação de datas
const getWeekDays = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
};

// COMPONENTE MODAL - DESIGN ORIGINAL
const NewEventModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<'Reunião' | 'Tarefa Pessoal' | 'Lembrete'>('Reunião');
  const [location, setLocation] = useState('');
  const [addMeet, setAddMeet] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAddParticipant = () => {
    if (currentParticipant.trim()) {
      setParticipants([...participants, currentParticipant.trim()]);
      setCurrentParticipant('');
    }
  };

  useEffect(() => {
    setStartDate(selectedDate);
    setEndDate(selectedDate);
    setSaveError(null);
  }, [selectedDate]);

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setAddMeet(false);
    setParticipants([]);
    setCurrentParticipant('');
    setType('Reunião');
    setStartTime('09:00');
    setEndTime('10:00');
    setIsSaving(false);
    setSaveError(null);
  };

  const handleRemoveParticipant = (participantToRemove: string) => {
    setParticipants(participants.filter((p) => p !== participantToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error('A data de fim não pode ser anterior à data de início.');
      }
      if (!title.trim()) {
        throw new Error('O título do evento é obrigatório.');
      }
      
      let locationOrLink = location;
      if (addMeet) {
        locationOrLink = `https://meet.google.com/gen-${Date.now()}`;
        console.log("Link do Meet gerado (simulação):", locationOrLink);
      }

      await onSave({ title, startDate, endDate, type, locationOrLink, participants, startTime, endTime });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Falha ao salvar evento:', error);
      setSaveError(error.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Criar Novo Evento</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          
          {/* Coluna da Esquerda */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full input-style"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Tipo de Evento
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1 block w-full input-style"
              >
                <option>Reunião</option>
                <option>Tarefa Pessoal</option>
                <option>Lembrete</option>
              </select>
            </div>
             {type === 'Reunião' && (
              <>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Local
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full input-style"
                    placeholder="Ex: Sala de Reuniões 1"
                    disabled={addMeet}
                  />
                </div>

                 <div className="flex items-center">
                      <button
                          type="button"
                          onClick={() => setAddMeet(!addMeet)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm ${addMeet ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      >
                          <Video size={16} />
                          {addMeet ? 'Videoconferência Adicionada' : 'Adicionar videoconferência'}
                      </button>
                  </div>
              </>
            )}
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full input-style"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full input-style"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full input-style"
                  />
                </div>
                {type !== 'Lembrete' && (
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      Hora de Fim
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full input-style"
                    />
                  </div>
                )}
              </div>
               {type === 'Reunião' && (
                  <div>
                    <label htmlFor="participants" className="block text-sm font-medium text-gray-700">
                      Participantes
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentParticipant}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddParticipant();
                          }
                        }}
                        onChange={(e) => setCurrentParticipant(e.target.value)}
                        placeholder="Nome ou e-mail"
                        className="mt-1 block w-full input-style"
                      />
                      <button
                        type="button"
                        onClick={handleAddParticipant}
                        className="px-4 py-2 mt-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 font-semibold whitespace-nowrap"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-20 overflow-y-auto">
                      {participants.map((p, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                          <span>{p}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(p)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
              )}
          </div>
        </div>
        {saveError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Erro:</strong> {saveError}
          </div>
        )}
        <div className="mt-8 flex justify-end gap-4 border-t pt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold disabled:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Salvando...' : 'Salvar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AgendaPageProps {
    services: Service[];
}

const AgendaPage: React.FC<AgendaPageProps> = ({ services }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleId, setGoogleId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // ✅ CARREGAR googleId DO localStorage AO INICIAR
  useEffect(() => {
    const storedGoogleId = localStorage.getItem('googleId');
    if (storedGoogleId) {
      setGoogleId(storedGoogleId);
      setIsAuthenticated(true);
    }
  }, []);

  // ✅ CARREGAR EVENTOS DO GOOGLE AUTOMATICAMENTE
  useEffect(() => {
    if (isAuthenticated && googleId) {
      loadEventsFromGoogle();
    }
  }, [isAuthenticated, googleId]);

  // ✅ FUNÇÃO PARA CARREGAR EVENTOS DO GOOGLE
  const loadEventsFromGoogle = async () => {
    if (!googleId) return;

    try {
      console.log('📥 Carregando eventos do Google...');
      const response = await fetch(`${API_URL}/google/events/${googleId}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar eventos');
      }
      
      const googleEvents = await response.json();
      console.log('✅ Eventos carregados:', googleEvents);
      
      // TRANSFORMA eventos do Google em Tasks
      const newTasks: Task[] = googleEvents.map((event: any) => ({
        id: event.id,
        title: event.summary,
        startDate: event.start.dateTime?.split('T')[0] || event.start.date,
        endDate: event.end.dateTime?.split('T')[0] || event.end.date,
        startTime: event.start.dateTime ? event.start.dateTime.split('T')[1].substring(0, 5) : '09:00',
        endTime: event.end.dateTime ? event.end.dateTime.split('T')[1].substring(0, 5) : '10:00',
        type: 'Reunião',
        locationOrLink: event.location || '',
        participants: event.attendees?.map((a: any) => a.email) || [],
      }));
      
      setTasks(newTasks);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setAuthError('Erro ao carregar eventos do Google Calendar');
    }
  };

  // AUTENTICAÇÃO GOOGLE
  const handleAuthentication = () => {
    setAuthError(null);
    const popup = window.open(`${API_URL}/google/auth`, 'authWindow', 'width=500,height=600');

    if (!popup) {
      setAuthError('Não foi possível abrir o popup de autenticação. Verifique as configurações do navegador.');
      return;
    }

    const messageListener = (event: MessageEvent) => {
      console.log('MENSAGEM RECEBIDA:', event);
      if (event.origin !== `${API_URL}`) {
        console.warn('Mensagem ignorada de origem desconhecida:', event.origin);
        return;
      }

      const authData = event.data;
      if (authData.status === 'auth_success' && authData.googleId) {
        console.log('Autenticação via pop-up bem-sucedida! Google ID:', authData.googleId);
        setIsAuthenticated(true);
        setGoogleId(authData.googleId);
        // ✅ ARMAZENAR googleId NO localStorage
        localStorage.setItem('googleId', authData.googleId);
        popup.close();
        cleanup();
      } else {
        console.warn('Mensagem recebida, mas dados inesperados:', event.data);
        setAuthError('Falha na autenticação: resposta inválida do servidor.');
      }
    };

    const popupTimer = setInterval(() => {
      if (popup.closed) {
        console.warn('Popup fechado pelo usuário.');
        setAuthError('Autenticação cancelada pelo usuário.');
        cleanup();
      }
    }, 500);

    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        setAuthError('Tempo limite para autenticação excedido.');
        cleanup();
      }
    }, 120000);

    const cleanup = () => {
      clearInterval(popupTimer);
      window.removeEventListener('message', messageListener);
    };

    window.addEventListener('message', messageListener);
  };

  // ✅ FUNÇÃO PARA DESCONECTAR (OPCIONAL, MAS RECOMENDADA)
  const handleDisconnect = () => {
    setIsAuthenticated(false);
    setGoogleId(null);
    localStorage.removeItem('googleId');
    setTasks([]); // Limpa tarefas locais
    setAuthError(null);
  };

  // SALVAR EVENTO - INTEGRADO
  const handleSaveEvent = async (eventData: Omit<Task, 'id'>) => {
    if (!googleId) {
      throw new Error('Usuário não autenticado. Conecte-se ao Google primeiro.');
    }

    console.log('Enviando dados para o backend:', eventData);
    console.log('Google ID:', googleId);

    const response = await fetch(`${API_URL}/google/create-event/${googleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.error('Erro do servidor:', errorResult);
      throw new Error(errorResult.message || 'Falha ao criar o evento.');
    }

    const createdEventFromGoogle = await response.json();
    console.log('Evento criado com sucesso via Google API:', createdEventFromGoogle);

    
    await loadEventsFromGoogle();
  };

  const events: CalendarEvent[] = useMemo(() => {
    const serviceEvents: CalendarEvent[] = services
      .filter((service) => service.status === 'Em Andamento' || service.status === 'Pendente')
      .map((service) => ({
        id: `service-${service.id}`,
        title: `Serviço: ${service.clientName}`,
        start: new Date(`${service.startDate}T00:00:00`),
        end: new Date(`${service.endDate}T23:59:59`),
        type: 'service',
        color: 'cyan',
        data: service,
      }));

    const taskEvents: CalendarEvent[] = tasks.map((task) => {
      let color: 'green' | 'blue' | 'orange';
      switch (task.type) {
        case 'Reunião':
          color = 'green';
          break;
        case 'Tarefa Pessoal':
          color = 'blue';
          break;
        case 'Lembrete':
          color = 'orange';
          break;
        default:
          color = 'blue';
      }
      return {
        id: `task-${task.id}`,
        title: task.title,
        start: new Date(`${task.startDate}T${task.startTime || '00:00'}`),
        end: new Date(`${task.endDate}T${task.endTime || task.startTime || '23:59'}`),
        type: 'task',
        color: color,
        data: task,
      };
    });

    return [...serviceEvents, ...taskEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [services, tasks]);

  const handleOpenModal = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(prev.getMonth() - 1);
      if (viewMode === 'week') newDate.setDate(prev.getDate() - 7);
      if (viewMode === 'day') newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(prev.getMonth() + 1);
      if (viewMode === 'week') newDate.setDate(prev.getDate() + 7);
      if (viewMode === 'day') newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const getHeaderText = () => {
    if (viewMode === 'month') return currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    if (viewMode === 'week') {
      const week = getWeekDays(currentDate);
      const start = week[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      const end = week[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `${start} - ${end}`;
    }
    if (viewMode === 'day')
      return currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return '';
  };

  const eventColors = {
    cyan: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-l-4 border-cyan-500',
    green: 'bg-green-100 text-green-800 hover:bg-green-200 border-l-4 border-green-500',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-l-4 border-blue-500',
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-l-4 border-orange-500',
  };

  const formatTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const renderMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = [];
    for (let day = new Date(firstDayOfMonth); day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
      daysInMonth.push(new Date(day));
    }
    const startingDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysInMonth.unshift(null);
    }
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-t border-l border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center py-2 font-medium text-sm text-gray-600 bg-gray-50 border-r border-b border-gray-200"
          >
            {day}
          </div>
        ))}
        {daysInMonth.map((day, index) => (
          <div
            key={index}
            onClick={() => day && handleOpenModal(day)}
            className="relative min-h-[120px] bg-white p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          >
            {day && <span className="text-sm font-semibold">{day.getDate()}</span>}
            <div className="mt-1 space-y-1">
              {day &&
                events
                  .filter((e) => day.toDateString() === e.start.toDateString() || (day >= e.start && day <= e.end))
                  .map((event) => (
                    <Link
                      to={event.type === 'service' ? `/services/${(event.data as Service).id}` : '#'}
                      key={event.id}
                      className={`block text-xs rounded px-2 py-1 truncate ${eventColors[event.color]}`}
                    >
                      {event.type === 'task' && <strong>{formatTime(event.start)} </strong>}
                      {event.title}
                    </Link>
                  ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const week = getWeekDays(currentDate);
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-t border-l border-gray-200">
        {week.map((day) => (
          <div
            key={day.toISOString()}
            className="text-center py-2 font-medium text-sm text-gray-600 bg-gray-50 border-r border-b border-gray-200"
          >
            {day.toLocaleDateString('pt-BR', { weekday: 'short' })} {day.getDate()}
          </div>
        ))}
        {week.map((day, index) => (
          <div
            key={index}
            onClick={() => handleOpenModal(day)}
            className="relative min-h-[240px] bg-white p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          >
            <div className="mt-1 space-y-1">
              {events
                .filter((e) => day.toDateString() === e.start.toDateString() || (day >= e.start && day <= e.end))
                .map((event) => (
                  <Link
                    to={event.type === 'service' ? `/services/${(event.data as Service).id}` : '#'}
                    key={event.id}
                    className={`block text-xs rounded px-2 py-1 truncate ${eventColors[event.color]}`}
                  >
                    {event.type === 'task' && <strong>{formatTime(event.start)} </strong>}
                    {event.title}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(
      (e) =>
        currentDate.toDateString() === e.start.toDateString() ||
        (currentDate.getTime() >= e.start.getTime() && currentDate.getTime() <= e.end.getTime())
    );
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

    return (
      <div className="border border-gray-200 rounded-lg">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-200 min-h-[60px]">
            <div className="w-20 text-center text-sm text-gray-500 py-2 border-r border-gray-200">
              {hour}:00
            </div>
            <div className="flex-1 p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleOpenModal(currentDate)}>
              {dayEvents
                .filter((event) => event.start.getHours() === hour)
                .map((event) => (
                  <Link
                    to={event.type === 'service' ? `/services/${(event.data as Service).id}` : '#'}
                    key={event.id}
                    className={`block text-sm rounded px-2 py-1 mb-1 ${eventColors[event.color]}`}
                  >
                    <strong>{formatTime(event.start)}</strong> - {event.title}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Erro:</strong> {authError}
        </div>
      )}
      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold capitalize text-center w-48">{getHeaderText()}</h2>
            <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200">
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Hoje
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle size={20} />
                <span>Conectado ao Google</span>
                {googleId && (
                  <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                    {googleId.slice(0, 8)}...
                  </span>
                )}
                {/* ✅ BOTÃO PARA DESCONECTAR (OPCIONAL, MAS ÚTIL) */}
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthentication}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-semibold"
              >
                Conectar com Google
              </button>
            )}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthError('Por favor, conecte-se ao Google antes de criar um evento.');
                  return;
                }
                handleOpenModal(new Date());
              }}
              disabled={!isAuthenticated}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              Criar Evento
            </button>
          </div>
          <div className="flex items-center gap-2 border-l pl-2 ml-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'day' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'week' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === 'month' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              Mês
            </button>
          </div>
        </div>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default AgendaPage;