import { TaskBoard } from './types';

export const mockTaskBoard: TaskBoard = {
  tags: {
    'tag-1': { id: 'tag-1', name: 'Urgente', color: 'bg-red-200 text-red-800' },
    'tag-2': { id: 'tag-2', name: 'Marketing', color: 'bg-blue-200 text-blue-800' },
    'tag-3': { id: 'tag-3', name: 'Desenvolvimento', color: 'bg-green-200 text-green-800' },
    'tag-4': { id: 'tag-4', name: 'Revisão', color: 'bg-yellow-200 text-yellow-800' },
    'tag-5': { id: 'tag-5', name: 'Bug', color: 'bg-pink-200 text-pink-800' },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Desenvolver a página de login',
      description: 'Criar a interface e a lógica de autenticação.',
      assignee: { id: 'CON-001', name: 'Carlos Silva' },
      dueDate: '2025-10-15',
      tagIds: ['tag-3', 'tag-1'],
      comments: [
        { author: 'Admin', date: '2025-10-03T10:00:00Z', text: 'Layout inicial aprovado.' }
      ]
    },
    'task-2': {
      id: 'task-2',
      title: 'Criar campanha de email para o novo produto',
      description: 'Definir o público-alvo e escrever o conteúdo do email.',
      assignee: { id: 'CON-002', name: 'Beatriz Lima' },
      tagIds: ['tag-2']
    },
    'task-3': {
      id: 'task-3',
      title: 'Rever proposta para o Cliente X',
      description: 'Verificar todos os valores e o escopo do projeto antes de enviar.',
      tagIds: ['tag-4']
    },
    'task-4': {
      id: 'task-4',
      title: 'Corrigir bug no formulário de contacto',
      description: 'O formulário não está a enviar os dados para o email correto.',
      assignee: { id: 'CON-001', name: 'Carlos Silva' },
      tagIds: ['tag-5', 'tag-1']
    },
    'task-5': {
      id: 'task-5',
      title: 'Agendar reunião de kickoff com a Tech Solutions',
      assignee: { id: 'CON-002', name: 'Beatriz Lima' },
      dueDate: '2025-10-10',
    },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'A Fazer',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'column-2': {
      id: 'column-2',
      title: 'Em Andamento',
      taskIds: ['task-4'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Em Revisão',
      taskIds: [],
    },
    'column-4': {
      id: 'column-4',
      title: 'Concluído',
      taskIds: ['task-5'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
};