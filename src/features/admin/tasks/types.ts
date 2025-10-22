export interface Etiqueta {
  id: string;
  nome: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Tag = Etiqueta;

// ... resto dos types permanecem iguais
// Define um comentário dentro de uma tarefa
export interface Comment {
  author: string;
  date: string;
  text: string;
}

// Define a estrutura de uma única tarefa (card)
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
  };
  dueDate?: string;
  tagIds?: string[]; // Alterado de 'tags' para 'tagIds'
  comments?: Comment[];
}

// Define a estrutura de uma coluna do quadro
export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

// Define a estrutura completa do quadro de tarefas
export interface TaskBoard {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
  tags: { [key: string]: Tag }; // Adicionado: Dicionário de etiquetas disponíveis
}