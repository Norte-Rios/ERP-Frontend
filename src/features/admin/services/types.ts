export interface Service {
  id: string;
  clientName: string;
  projectManager: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  startDate: string;
  endDate: string;
  type: 'Presencial' | 'Online' | 'Híbrido';
  description?: string;
  consultants: string[];
  costs?: {
    travel?: number;
    accommodation?: number;
    food?: number;
    transport?: number;
  };
  workPlan?: {
    status: 'Pendente de Aprovação' | 'Aprovado' | 'Rejeitado';
    content: string;
    feedback?: string;
  };
  finalReport?: {
    submittedBy: string;
    content: string;
    fileUrl?: string;
    submittedAt: string;
    status: 'Pendente de Análise' | 'Aprovado' | 'Rejeitado';
    feedback?: string;
  };
}