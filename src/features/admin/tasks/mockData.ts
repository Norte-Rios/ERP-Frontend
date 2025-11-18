import { TaskBoard } from './types';

export const mockTaskBoard: TaskBoard = {
  tags: {
    // MODIFICADO: 'color' agora é HEX para corresponder ao CSS em TaskBoardPage.tsx
    'tag-1': { id: 'tag-1', nome: 'Urgente', color: '#EF4444' }, // Vermelho
    'tag-2': { id: 'tag-2', nome: 'Marketing', color: '#3B82F6' }, // Azul
    'tag-3': { id: 'tag-3', nome: 'Desenvolvimento', color: '#10B981' }, // Verde
    'tag-4': { id: 'tag-4', nome: 'Revisão', color: '#F59E0B' }, // Amarelo
    'tag-5': { id: 'tag-5', nome: 'Bug', color: '#EC4899' }, // Rosa
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      titulo: 'Desenvolver a página de login',
      description: 'Criar a interface e a lógica de autenticação.',
      data: '2025-10-15',
      coment: [
        { id: 'c1', author: 'Admin', date: '2025-10-03T10:00:00Z', text: 'Layout inicial aprovado.' }
      ],
      status: 'a fazer', // MODIFICADO: Lowercase
      
      // --- ATUALIZADO ---
      users: [{ id: 'CON-001', nome: 'Carlos Silva' }],
      userIds: ['CON-001'],
      etiquetas: [ { id: 'tag-3', nome: 'Desenvolvimento', color: '#10B981' } ],
      etiquetaIds: ['tag-3']
    },
    'task-2': {
      id: 'task-2',
      titulo: 'Criar campanha de email para o novo produto',
      description: 'Definir o público-alvo e escrever o conteúdo do email.',
      coment: [],
      status: 'a fazer', // MODIFICADO: Lowercase

      // --- ATUALIZADO ---
      users: [{ id: 'CON-002', nome: 'Beatriz Lima' }],
      userIds: ['CON-002'],
      etiquetas: [ { id: 'tag-2', nome: 'Marketing', color: '#3B82F6' } ],
      etiquetaIds: ['tag-2']
    },
    'task-3': {
      id: 'task-3',
      titulo: 'Rever proposta para o Cliente X',
      description: 'Verificar todos os valores e o escopo do projeto antes de enviar.',
      coment: [],
      status: 'a fazer', // MODIFICADO: Lowercase

      // --- ATUALIZADO ---
      users: [],
      userIds: [],
      etiquetas: [ { id: 'tag-4', nome: 'Revisão', color: '#F59E0B' } ],
      etiquetaIds: ['tag-4']
    },
    'task-4': {
      id: 'task-4',
      titulo: 'Corrigir bug no formulário de contacto',
      description: 'O formulário não está a enviar os dados para o email correto.',
      coment: [],
      status: 'em andamento', // MODIFICADO: Lowercase

      // --- ATUALIZADO (Exemplo com múltiplas tags) ---
      users: [{ id: 'CON-001', nome: 'Carlos Silva' }],
      userIds: ['CON-001'],
      etiquetas: [
        { id: 'tag-5', nome: 'Bug', color: '#EC4899' },
        { id: 'tag-1', nome: 'Urgente', color: '#EF4444' }
      ],
      etiquetaIds: ['tag-5', 'tag-1']
    },
    'task-5': {
      id: 'task-5',
      titulo: 'Agendar reunião de kickoff com a Tech Solutions',
      data: '2025-10-10',
      coment: [],
      status: 'concluído', // MODIFICADO: Lowercase

      // --- ATUALIZADO (Exemplo com múltiplos usuários) ---
      users: [
        { id: 'CON-002', nome: 'Beatriz Lima' },
        { id: 'CON-001', nome: 'Carlos Silva' }
      ],
      userIds: ['CON-002', 'CON-001'],
      etiquetas: [],
      etiquetaIds: []
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