// ==========================================================
//                  ETIQUETAS (TAGS)
// ==========================================================

export interface Etiqueta {
  id: string;
  nome: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Tag = Etiqueta;

// ==========================================================
//                      COMENTÁRIOS
// ==========================================================

export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
}

// ==========================================================
//                      TASK (CARD)
// ==========================================================
//
// 100% atualizado com:
//  - prazo
//  - múltiplos usuários
//  - múltiplas etiquetas
//  - comentários
//  - compatibilidade com backend NestJS
//  - compatibilidade com restos do frontend
//

export interface Task {
  id: string;
  titulo: string;
  status: string;

  description?: string | null;
  data?: string | null;      // data de início
  prazo?: string | null;     // PRAZO (NOVO)

  // ================================
  //   USUÁRIOS — MULTI-USERS
  // ================================
  users: {
    id: string;
    nome: string;
  }[];

  userIds: string[];

  // ================================
  //   ETIQUETAS — MULTI-TAGS
  // ================================
  etiquetas: Tag[];
  etiquetaIds: string[];

  // ================================
  //           COMENTÁRIOS
  // ================================
  coment: Comment[];

  // ==========================================================
  //     CAMPOS DE COMPATIBILIDADE TEMPORÁRIA
  // ==========================================================
  //
  // Servem para evitar quebra onde o código antigo ainda
  // usa user/UserId ou etiqueta/etiquetaId no singular
  //

  user?: any;
  userId?: any;
  etiquetaId?: any;
  projectId?: string | null; // 👈 adiciona isso
  projectName?: string
}

// ==========================================================
//                 ESTRUTURA DE COLUNA
// ==========================================================

export interface Column {
  id: string;
  title: string;
  taskIds: string[]; // IDs das tasks nesta coluna
}

// ==========================================================
//                 ESTRUTURA DO BOARD
// ==========================================================

export interface TaskBoard {
  newBoard?: any;
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
  tags: { [key: string]: Tag };
}
