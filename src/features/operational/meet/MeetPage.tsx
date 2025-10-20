import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, UserPlus, Search, X } from 'lucide-react';
import { CalendarEvent } from '../../admin/agenda/types';

interface MeetPageProps {
  events: CalendarEvent[];
}

// Modal para Agendar Reunião
const ScheduleMeetingModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState('');

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    if (currentParticipant.trim() && !participants.includes(currentParticipant.trim())) {
      setParticipants([...participants, currentParticipant.trim()]);
      setCurrentParticipant('');
    }
  };

  const handleRemoveParticipant = (participantToRemove: string) => {
    setParticipants(participants.filter(p => p !== participantToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, insira um título para a reunião.');
      return;
    }
    // Aqui seria a lógica para salvar/enviar os dados da reunião
    console.log({
      title,
      date,
      startTime,
      endTime,
      participants
    });
    alert('Reunião agendada com sucesso! (Simulação)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Agendar Nova Reunião</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título da Reunião</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full input-style" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Hora de Início</label>
              <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Hora de Fim</label>
              <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full input-style" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Participantes</label>
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                value={currentParticipant} 
                onChange={e => setCurrentParticipant(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddParticipant(); }}}
                placeholder="Digite o e-mail e pressione Enter" 
                className="mt-1 block w-full input-style" 
              />
              <button type="button" onClick={handleAddParticipant} className="px-4 py-2 mt-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 font-semibold whitespace-nowrap">Adicionar</button>
            </div>
            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                  <span>{p}</span>
                  <button type="button" onClick={() => handleRemoveParticipant(p)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Salvar Reunião</button>
        </div>
      </div>
    </div>
  );
};


const MeetPage: React.FC<MeetPageProps> = ({ events }) => {
  const [link, setLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const itemsPerPage = 10;

  const meetings = useMemo(() => 
    events.filter(event => 
      (event.type === 'task' && event.data.type === 'Reunião') || 
      (event.title.toLowerCase().includes('reunião'))
    ).filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [events, searchTerm]);

  const paginatedMeetings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return meetings.slice(startIndex, startIndex + itemsPerPage);
  }, [meetings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(meetings.length / itemsPerPage);

  const handleParticipate = () => {
    if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
      window.open(link, '_blank');
    } else {
      alert('Por favor, insira um link válido.');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleSaveMeeting = (meetingData) => {
    // Lógica para adicionar a nova reunião à lista principal (será implementada com a integração)
    console.log("Nova reunião para salvar:", meetingData);
  };


  return (
    <div className="container mx-auto space-y-8">
      <ScheduleMeetingModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveMeeting}
      />
      <h1 className="text-2xl font-bold text-gray-800">Google Meet</h1>

      {/* Cartões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><UserPlus /> Participar de uma reunião</h2>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Cole o link da reunião aqui"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full input-style"
            />
            <button onClick={handleParticipate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold whitespace-nowrap">
              Participar
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsScheduleModalOpen(true)}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-full"><Video className="h-6 w-6 text-indigo-600" /></div>
                <div>
                    <h2 className="font-bold text-gray-800">Agendar Nova Reunião</h2>
                    <p className="text-sm text-gray-600 mt-1">Isto abrirá a sua agenda para criar um novo evento.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Lista de Reuniões Agendadas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Reuniões Agendadas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar reunião..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Título</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Horário</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedMeetings.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{event.title}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{event.start.toLocaleDateString()}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    {`${event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">
                    <button 
                        onClick={() => window.open((event.data as any).locationOrLink, '_blank')}
                        disabled={!(event.data as any).locationOrLink}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Abrir Link
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedMeetings.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">Nenhuma reunião encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
            <span className="text-xs xs:text-sm text-gray-900">
              Página {currentPage} de {totalPages}
            </span>
            <div className="inline-flex mt-2 xs:mt-0">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l disabled:opacity-50"
              >
                Anterior
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetPage;