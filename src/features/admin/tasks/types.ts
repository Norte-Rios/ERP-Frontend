// Define a Etiqueta (Tag)
export interface Etiqueta {
  id: string;
  nome: string; // <-- Correto (em português, como seu código usa)
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Tag = Etiqueta;

// Define um comentário
export interface Comment {
  id: string; // <-- ADICIONADO (seu código usa comment.id como 'key')
  author: string;
  date: string;
  text: string;
}

// Define a estrutura de uma única tarefa (card)
export interface Task {
  id: string;
  titulo: string; // <-- CORRETO (em português)
  status: string; // <-- CORRETO (em português)

  description?: string | null;
  data?: string | null;        // <-- CORRETO (em português)
  
  // Seu código usa 'user' para exibir e 'userId' para salvar
  user?: { 
    id: string;
    nome: string; 
  };
  userId?: string | null; 
  
  etiquetaId?: string | null; // <-- CORRETO (em português)
  
  // O seu código em TaskBoardPage.tsx usa 'coment' (com erro de digitação)
  // O tipo DEVE bater com o código.
  coment: Comment[]; 
}

// Define a estrutura de uma coluna do quadro
export interface Column {
  id: string;
  title: string; // (Este 'title' está correto, pois o mock usa)
  taskIds: string[];
}

// Define a estrutura completa do quadro de tarefas
export interface TaskBoard {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
  tags: { [key: string]: Tag };
}