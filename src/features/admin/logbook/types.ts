// Define a estrutura para um comentário numa entrada do diário
export interface LogComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string;
}

// Define a estrutura para uma entrada no diário de bordo
export interface LogEntry {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string;
  comments: LogComment[];
}

// Define a estrutura para um anúncio no mural
export interface Announcement {
    id: string;
    title: string;
    text: string;
    author: string;
    createdAt: string;
}
