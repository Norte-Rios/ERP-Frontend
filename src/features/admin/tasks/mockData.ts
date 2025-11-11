import { TaskBoard } from './types';

export const mockTaskBoard: TaskBoard = {
  tags: {
    // 'name' -> 'nome'
    'tag-1': { id: 'tag-1', nome: 'Urgente', color: 'bg-red-200 text-red-800' },
    'tag-2': { id: 'tag-2', nome: 'Marketing', color: 'bg-blue-200 text-blue-800' },
    'tag-3': { id: 'tag-3', nome: 'Desenvolvimento', color: 'bg-green-200 text-green-800' },
    'tag-4': { id: 'tag-4', nome: 'Revisão', color: 'bg-yellow-200 text-yellow-800' },
    'tag-5': { id: 'tag-5', nome: 'Bug', color: 'bg-pink-200 text-pink-800' },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      titulo: 'Desenvolver a página de login', // 'title' -> 'titulo'
      description: 'Criar a interface e a lógica de autenticação.',
      user: { id: 'CON-001', nome: 'Carlos Silva' }, // 'assignee' -> 'user', 'name' -> 'nome'
      data: '2025-10-15', // 'dueDate' -> 'data'
      etiquetaId: 'tag-3', // 'tagIds' -> 'etiquetaId' (e mudado de array para string)
      coment: [ // 'comments' -> 'coment'
        { id: 'c1', author: 'Admin', date: '2025-10-03T10:00:00Z', text: 'Layout inicial aprovado.' } // 'id' adicionado
      ],
      status: 'A Fazer' // 'status' adicionado
    },
    'task-2': {
      id: 'task-2',
      titulo: 'Criar campanha de email para o novo produto', // 'title' -> 'titulo'
      description: 'Definir o público-alvo e escrever o conteúdo do email.',
      user: { id: 'CON-002', nome: 'Beatriz Lima' }, // 'assignee' -> 'user', 'name' -> 'nome'
      etiquetaId: 'tag-2', // 'tagIds' -> 'etiquetaId'
      coment: [], // 'coment' adicionado
      status: 'A Fazer' // 'status' adicionado
    },
    'task-3': {
      id: 'task-3',
      titulo: 'Rever proposta para o Cliente X', // 'title' -> 'titulo'
      description: 'Verificar todos os valores e o escopo do projeto antes de enviar.',
      etiquetaId: 'tag-4', // 'tagIds' -> 'etiquetaId'
      coment: [], // 'coment' adicionado
      status: 'A Fazer' // 'status' adicionado
    },
    'task-4': {
      id: 'task-4',
      titulo: 'Corrigir bug no formulário de contacto', // 'title' -> 'titulo'
      description: 'O formulário não está a enviar os dados para o email correto.',
      user: { id: 'CON-001', nome: 'Carlos Silva' }, // 'assignee' -> 'user', 'name' -> 'nome'
      etiquetaId: 'tag-5', // 'tagIds' -> 'etiquetaId'
      coment: [], // 'coment' adicionado
      status: 'Em Andamento' // 'status' adicionado
    },
    'task-5': {
      id: 'task-5',
      titulo: 'Agendar reunião de kickoff com a Tech Solutions', // 'title' -> 'titulo'
      user: { id: 'CON-002', nome: 'Beatriz Lima' }, // 'assignee' -> 'user', 'name' -> 'nome'
      data: '2025-10-10', // 'dueDate' -> 'data'
      etiquetaId: null, // 'etiquetaId' adicionado
      coment: [], // 'coment' adicionado
      status: 'Concluído' // 'status' adicionado
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