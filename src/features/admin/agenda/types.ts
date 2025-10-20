import { Service } from '../services/types';

// Define a estrutura para uma tarefa ou evento manual
export interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  type: 'Reunião' | 'Tarefa Pessoal' | 'Lembrete';
  description?: string;
  participants?: string[];
  locationOrLink?: string;
}

// Define um evento genérico do calendário
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'service' | 'task';
  color: 'green' | 'blue' | 'orange' | 'cyan'; // Cores atualizadas
  data: Service | Task;
}