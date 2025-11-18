// Define a Etiqueta (Tag)
export interface Etiqueta {
  id: string;
  nome: string; 
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Tag = Etiqueta;

// Define um comentário
export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
}

// Define a estrutura de uma única tarefa (card)
// --- ATUALIZADO PARA MÚLTIPLOS USUÁRIOS E ETIQUETAS ---
export interface Task {
  id: string;
  titulo: string; 
  status: string; 

  description?: string | null;
  data?: string | null;        
  
  // Propriedades NOVAS (Plural)
  users: { id: string; nome: string; }[]; // Array de objetos de usuário
  userIds: string[]; // Array de IDs de usuário

  etiquetas: Tag[]; // Array de objetos de etiqueta
  etiquetaIds: string[]; // Array de IDs de etiqueta
  
  coment: Comment[]; 

  // Propriedades antigas (opcionais) para compatibilidade temporária
  // Isso evita que outras partes do app quebrem se ainda as usarem
  user?: any;
  userId?: any;
  etiquetaId?: any;
}
// --- FIM DA ATUALIZAÇÃO ---

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
  tags: { [key: string]: Tag };
}