// Define a estrutura de um documento trocado no sistema
export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'png' | 'jpeg';
  status: 'Enviado' | 'Visualizado' | 'Aprovado' | 'Rejeitado' | 'Recebido';
  direction: 'sent' | 'received'; // Novo: Indica se o documento foi enviado ou recebido
  sender: { // Novo: Quem enviou o documento
    name: string;
  };
  recipient: {
    id: string;
    name: string;
    type: 'Cliente' | 'Consultor' | 'Prestador';
  };
  sentAt: string; // Data de envio
  history: { status: string; date: string }[]; 
  comments: { author: string; text: string; date: string }[];
}