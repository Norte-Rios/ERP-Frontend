import { useMemo } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../auth/AuthContext.tsx'; 
// Auth
import { useAuth } from '../auth/AuthContext.tsx'; 

import LoginPage from '../auth/LoginPage.tsx'; 
import SetPasswordPage from '../auth/SetPasswordPage.tsx'; // <-- 1. IMPORTA A NOVA PÁGINA

// Layouts
import MainLayout from '../components/layout/MainLayout.tsx'; 
import ConsultantLayout from '../components/layout/ConsultantLayout.tsx'; 
import ClientLayout from '../components/layout/ClientLayout.tsx'; 
import OperationalLayout from '../components/layout/OperationalLayout.tsx'; 


// Páginas do Admin
import AdminDashboard from '../features/admin/dashboard/AdminDashboard.tsx'; 
import AgendaPage from '../features/admin/agenda/AgendaPage.tsx'; 
import TaskBoardPage from '../features/admin/tasks/TaskBoardPage.tsx'; 
import UserListPage from '../features/admin/users/UserListPage.tsx'; 
import MeetPage from '../features/admin/meet/MeetPage.tsx'; 


// Páginas do Consultor
import ConsultantDashboardPage from '../features/consultant/dashboard/ConsultantDashboardPage.tsx'; 
import ConsultantTasksPage from '../features/consultant/tasks/ConsultantTasksPage.tsx'; 
import ConsultantPaymentsPage from '../features/consultant/payments/ConsultantPaymentsPage.tsx'; 
import ConsultantServicesPage from '../features/consultant/services/ConsultantServicesPage.tsx'; 
import ConsultantServiceDetailPage from '../features/consultant/services/ConsultantServiceDetailPage.tsx'; 
import ConsultantDocumentsPage from '../features/consultant/documents/ConsultantDocumentsPage.tsx'; 
import ConsultantDocumentDetailPage from '../features/consultant/documents/ConsultantDocumentDetailPage.tsx'; 
import ConsultantLogbookPage from '../features/consultant/logbook/ConsultantLogbookPage.tsx'; 

// Páginas Operacionais
import OperationalDashboardPage from '../features/operational/dashboard/OperationalDashboardPage.tsx'; 
import OperationalTasksPage from '../features/operational/tasks/OperationalTasksPage.tsx'; 
import OperationalMeetPage from '../features/operational/meet/MeetPage.tsx'; 

// NOVA PÁGINA DE PERFIL
import ProfilePage from '../features/profile/ProfilePage.tsx'; 


// Páginas do Cliente
import ClientDashboardPage from '../features/client/dashboard/ClientDashboardPage.tsx'; 
import ClientServicesPage from '../features/client/services/ClientServicesPage.tsx'; 
import ClientServiceDetailPage from '../features/client/services/ClientServiceDetailPage.tsx'; 
import ClientDocumentsPage from "../features/client/documents/ClientDocumentsPage.tsx"; 
import ClientDocumentDetailPage from "../features/client/documents/ClientDocumentDetailPage.tsx"; 
import ClientFinancialPage from "../features/client/financial/ClientFinancialPage.tsx"; 


// Tipos
import { Service } from '../features/admin/services/types.ts';
import { Client } from '../features/admin/clients/types.ts';
import { Contract } from '../features/admin/contracts/types.ts';
import { Consultant } from '../features/admin/consultants/types.ts';
import { Document } from '../features/admin/documents/types.ts';
import { TaskBoard, Task, Tag } from '../features/admin/tasks/types.ts';
import { LogEntry, Announcement } from '../features/admin/logbook/types.ts';
import { RevenueTransaction } from '../features/admin/financial/types.ts';
import { CalendarEvent, Task as CalendarTask } from '../features/admin/agenda/types.ts';
import { User } from '../features/admin/users/types.ts';

// Tipo para o autor de uma entrada ou comentário no logbook
type LogAuthor = { id: string; name: string; avatarUrl: string };


interface AppRoutesProps {
  services: Service[];
  onAddService: (service: Omit<Service, 'id' | 'status'>) => void;
  onUpdateService: (service: Service) => void;
  clients: Client[];
  contracts: Contract[];
  consultants: Consultant[];
  documents: Document[];
  onAddCommentToDocument: (documentId: string, commentText: string, author: string) => void;
  onAddDocument: (document: Omit<Document, 'id' | 'sentAt' | 'history' | 'comments' | 'status' | 'sender'>, authorName?: string) => void;
  taskBoard: TaskBoard;
  onUpdateTaskBoard: (newBoard: TaskBoard) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskComment: (taskId: string, commentText: string, author?: string) => void;
  onUpdateTags: (tags: Tag[]) => void;
  announcements: Announcement[];
  logEntries: LogEntry[];
  onAddLogEntry: (text: string, author: LogAuthor) => void;
  onAddLogComment: (entryId: string, text: string, author: LogAuthor) => void;
  revenues: RevenueTransaction[];
  users: User[];
  onSaveUser: (user: Omit<User, 'id' | 'lastLogin'> | User) => void;
  onDeleteUser: (userId: string) => void;
}

const AppRoutes = (props: AppRoutesProps) => {
    const { user } = useAuth(); // Obter o utilizador logado
    // Normaliza a role para minúsculas para evitar erros de case
    const userRole = user?.role?.toLowerCase();

  // Encontrar os dados do utilizador atual com base no seu ID
  const currentConsultant = props.consultants.find(c => c.contact.email === user?.email);
  const currentClient = props.clients.find(c => c.email === user?.email);
  


  // Dados filtrados para o Consultor
  const consultantServices = currentConsultant ? props.services.filter(service => service.consultants.includes(currentConsultant.fullName)) : [];
  const consultantTaskBoard: TaskBoard = {
    ...props.taskBoard,
    tasks: currentConsultant ? Object.fromEntries(
      Object.entries(props.taskBoard.tasks).filter(([, task]) => task.assignee?.id === currentConsultant.id)
    ) : {},
    columns: currentConsultant ? Object.fromEntries(
      Object.entries(props.taskBoard.columns).map(([columnId, column]) => [
        columnId,
        {
          ...column,
          taskIds: column.taskIds.filter(taskId =>
            props.taskBoard.tasks[taskId]?.assignee?.id === currentConsultant.id
          ),
        },
      ])
    ) : props.taskBoard.columns,
  };
  const consultantDocuments = currentConsultant ? props.documents.filter(doc =>
    (doc.recipient.type === 'Consultor' && doc.recipient.id === currentConsultant.id) ||
    (doc.sender.name === currentConsultant.fullName)
  ) : [];

  // Dados filtrados para o Cliente
  const clientServices = currentClient ? props.services.filter(s => s.clientName === currentClient.companyName) : [];
  const clientContracts = currentClient ? props.contracts.filter(c => c.clientId === currentClient.id) : [];
  const clientRevenues = currentClient ? props.revenues.filter(r => r.clientId === currentClient.id) : [];
  const clientDocuments = currentClient ? props.documents.filter(doc =>
    (doc.recipient.type === 'Cliente' && doc.recipient.id === currentClient.id) ||
    (doc.sender.name === currentClient.companyName)
  ) : [];


  // Autores para logs e comentários
  const consultantAuthor: LogAuthor | undefined = currentConsultant ? { id: currentConsultant.id, name: currentConsultant.fullName, avatarUrl: `https://i.pravatar.cc/150?u=${currentConsultant.id}` } : undefined;
  const clientAuthor = currentClient ? { name: currentClient.companyName } : undefined;
  const operationalUser = props.users.find(u => u.email === user?.email && u.role?.toLowerCase() === 'operational');

  const operationalEvents: CalendarEvent[] = useMemo(() => {
    // ... (lógica existente para eventos operacionais)
    return []; // Simplificado por agora
  }, [props.services]);


  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 2. ADICIONA A NOVA ROTA PÚBLICA AQUI */}
      <Route path="/set-password/:id" element={<SetPasswordPage />} />

      {/* Wrapper de Rotas Protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <Outlet context={props} />
          </ProtectedRoute>
        }
      >
      {/* Rotas Protegidas */}

        {/* ROTA DE PERFIL (ACESSÍVEL A TODOS OS LOGADOS) */}
        <Route
            path="/profile"
            element={
                // Determina o layout com base na role
                userRole === 'admin' || userRole === 'admin master' ? <MainLayout /> :
                userRole === 'operational' ? <OperationalLayout user={operationalUser} /> :
                userRole === 'consultant' ? <ConsultantLayout /> :
                userRole === 'client' ? <ClientLayout client={currentClient} /> :
                <MainLayout /> // Layout padrão
            }
        >
            <Route index element={<ProfilePage />} />
        </Route>


        {/* Passamos todas as props para as rotas aninhadas através do contexto do Outlet */}
        <Route element={<Outlet context={props} />}>
            {/* Rotas do Administrador */}
            {/* Verifica a role em minúsculas */}
            {user && (userRole === 'admin' || userRole === 'admin master') && (
                <Route path="/" element={<MainLayout />}>
                  {/* ALTERAÇÃO: Redireciona a raiz para o dashboard */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  {/* Atualiza a rota do dashboard para usar o AdminDashboard */}
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="tasks" element={<TaskBoardPage initialBoard={props.taskBoard} />} />
                  <Route path="agenda" element={<AgendaPage services={props.services} />} />
                  <Route path="meet" element={<MeetPage events={operationalEvents} />} />
                  {/* Passa as props necessárias para UserListPage */}
                  <Route path="users" element={<UserListPage />} />
                </Route>
            )}

            {/* Rotas do Consultor */}
             {/* Verifica a role em minúsculas */}
            {user && userRole === 'consultant' && currentConsultant && (
                <Route path="/consultant" element={<ConsultantLayout />}>
                    {/* Mantém o dashboard específico do consultor */}
                    <Route
                      path="dashboard"
                      element={<ConsultantDashboardPage
                          consultantName={currentConsultant.fullName}
                          tasks={Object.values(consultantTaskBoard.tasks)}
                          services={consultantServices}
                          payments={[]} // TODO: Fix payments
                          taskBoard={consultantTaskBoard}
                      />}
                    />
                    <Route path="services" element={<ConsultantServicesPage services={consultantServices} onUpdateService={props.onUpdateService} />} />
                    <Route path="services/:serviceId" element={<ConsultantServiceDetailPage services={props.services} onUpdateService={props.onUpdateService} currentConsultantName={currentConsultant.fullName} />} />
                    <Route path="agenda" element={<AgendaPage services={consultantServices} />} />
                    <Route
                      path="tasks"
                      element={<ConsultantTasksPage
                          consultantTaskBoard={consultantTaskBoard}
                          currentConsultant={currentConsultant}
                          onUpdateTaskBoard={props.onUpdateTaskBoard}
                          onUpdateTask={props.onUpdateTask}
                    D     onDeleteTask={props.onDeleteTask}
                          onAddTaskComment={props.onAddTaskComment}
                      />}
                    />
                     <Route
                      path="documents"
                      element={<ConsultantDocumentsPage
                          documents={consultantDocuments}
                          consultantName={currentConsultant.fullName}
                          onAddDocument={(doc) => props.onAddDocument(doc, currentConsultant.fullName)}
                      />}
                    />
                    <Route
                      path="documents/:documentId"
                      element={<ConsultantDocumentDetailPage
                          documents={consultantDocuments}
                          onAddComment={(docId, text) => props.onAddCommentToDocument(docId, text, currentConsultant.fullName)}
                          // Passa consultantName para o detalhe também, se necessário
                          consultantName={currentConsultant.fullName}
                      />}
                    />
                    <Route
                      path="logbook"
                      element={<ConsultantLogbookPage
                          announcements={props.announcements}
                          logEntries={props.logEntries}
                          currentConsultant={currentConsultant}
                          onAddEntry={(text) => consultantAuthor && props.onAddLogEntry(text, consultantAuthor)}
                          onAddComment={(entryId, text) => consultantAuthor && props.onAddLogComment(entryId, text, consultantAuthor)}
                      />}
                    />
                    <Route
                      path="payments"
                      element={<ConsultantPaymentsPage payments={[]} />} // TODO: Fix payments
                    />
                </Route>
            )}

            {/* Rotas do Cliente */}
             {/* Verifica a role em minúsculas */}
            {user && userRole === 'client' && currentClient && (
                <Route path="/client" element={<ClientLayout client={currentClient} />}>
                    <Route
                      path="dashboard"
                      element={<ClientDashboardPage
                          clientName={currentClient.companyName}
                          services={clientServices}
                          contracts={clientContracts}
                          revenues={clientRevenues}
                      />}
                    />
                    <Route path="services" element={
                      <ClientServicesPage
                        services={clientServices}
                        allServices={props.services} // Passa todos os serviços para o modal de solicitação
                        currentClient={currentClient}
                        onAddService={props.onAddService}
                      />}
                    />
                    <Route path="services/:serviceId" element={<ClientServiceDetailPage services={clientServices} />} />
                    <Route path="documents" element={
                      <ClientDocumentsPage
                        documents={clientDocuments}
                       currentClient={currentClient} // Passa currentClient
                        onAddDocument={(doc) => clientAuthor && props.onAddDocument(doc, clientAuthor.name)}
                      />
                    } />
                    <Route path="documents/:documentId" element={
                      <ClientDocumentDetailPage
                        documents={clientDocuments}
                        onAddComment={(docId, text) => clientAuthor && props.onAddCommentToDocument(docId, text, clientAuthor.name)}
                    />}
                    />
                    <Route path="financial" element={<ClientFinancialPage contracts={clientContracts} revenues={clientRevenues} />} />
                </Route>
            )}

            {/* Rotas Operacionais */}
            {/* Rotas Operacionais */}
              {user && user.role === 'operational' && (
                <Route path="/operational" element={<OperationalLayout />}>
                <Route index element={<Navigate to="tasks" replace />} />
                  <Route
                    path="tasks"
                    element={

                      <OperationalTasksPage
                        taskBoard={props.taskBoard}
                        currentUser={user}
                      />
                    }
                  />
                <Route 
                     path="dashboard" 
                     element={<OperationalDashboardPage />} 
                      />
            
                    <Route
                    path="agenda"
                      element={<AgendaPage services={props.services} />} // Pode filtrar serviços relevantes se necessário
                    />
                    <Route
                      path="meet"
                    element={<OperationalMeetPage events={operationalEvents} />}
                    />
                </Route>
            )}
        </Route>
      </Route>

       {/* Rota de fallback */}
       <Route path="*" element={<Navigate to={user ? (userRole === 'admin' || userRole === 'admin master' ? '/dashboard' : `/${userRole}/dashboard`) : "/login"} replace />} />


    </Routes>
  );
};

export default AppRoutes;