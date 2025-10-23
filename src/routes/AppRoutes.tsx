import { useMemo } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../auth/AuthContext';
// Auth
import { useAuth } from '../auth/AuthContext';

import LoginPage from '../auth/LoginPage';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import ConsultantLayout from '../components/layout/ConsultantLayout';
import ClientLayout from '../components/layout/ClientLayout';
import OperationalLayout from '../components/layout/OperationalLayout';


// Páginas do Admin
import AgendaPage from '../features/admin/agenda/AgendaPage';
import TaskBoardPage from '../features/admin/tasks/TaskBoardPage';
import UserListPage from '../features/admin/users/UserListPage';
import MeetPage from '../features/admin/meet/MeetPage';


// Páginas do Consultor
import ConsultantDashboardPage from '../features/consultant/dashboard/ConsultantDashboardPage';
import ConsultantTasksPage from '../features/consultant/tasks/ConsultantTasksPage';
import ConsultantPaymentsPage from '../features/consultant/payments/ConsultantPaymentsPage';
import ConsultantServicesPage from '../features/consultant/services/ConsultantServicesPage';
import ConsultantServiceDetailPage from '../features/consultant/services/ConsultantServiceDetailPage';
import ConsultantDocumentsPage from '../features/consultant/documents/ConsultantDocumentsPage';
import ConsultantDocumentDetailPage from '../features/consultant/documents/ConsultantDocumentDetailPage';
import ConsultantLogbookPage from '../features/consultant/logbook/ConsultantLogbookPage';

// Páginas Operacionais
import OperationalTasksPage from '../features/operational/tasks/OperationalTasksPage';
import OperationalMeetPage from '../features/operational/meet/MeetPage';


// Páginas do Cliente
import ClientDashboardPage from '../features/client/dashboard/ClientDashboardPage';
import ClientServicesPage from '../features/client/services/ClientServicesPage';
import ClientServiceDetailPage from '../features/client/services/ClientServiceDetailPage';
import ClientDocumentsPage from "../features/client/documents/ClientDocumentsPage";
import ClientDocumentDetailPage from "../features/client/documents/ClientDocumentDetailPage";
import ClientFinancialPage from "../features/client/financial/ClientFinancialPage";


// Tipos
import { Service } from '../features/admin/services/types';
import { Client } from '../features/admin/clients/types';
import { Contract } from '../features/admin/contracts/types';
import { Consultant } from '../features/admin/consultants/types';
import { Document } from '../features/admin/documents/types';
import { TaskBoard, Task, Tag } from '../features/admin/tasks/types';
import { LogEntry, Announcement } from '../features/admin/logbook/types';
import { RevenueTransaction } from '../features/admin/financial/types';
import { CalendarEvent, Task as CalendarTask } from '../features/admin/agenda/types';
import { User } from '../features/admin/users/types';

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

  // Encontrar os dados do utilizador atual com base no seu ID
  const currentConsultant = props.consultants.find(c => c.contact.email === user?.email);
  const currentClient = props.clients.find(c => c.email === user?.email);
  const operationalUser = props.users.find(u => u.email === user?.email && u.role === 'Operational');


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

  const operationalEvents: CalendarEvent[] = useMemo(() => {
    // ... (lógica existente para eventos operacionais)
    return []; // Simplificado por agora
  }, [props.services]);


  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Outlet context={props} />
          </ProtectedRoute>
        }
      >
      {/* Rotas Protegidas */}
      
        {/* Passamos todas as props para as rotas aninhadas através do contexto do Outlet */}
        <Route element={<Outlet context={props} />}>
            {/* Rotas do Administrador */}
            {user && (user.role === 'admin' || user.role === 'admin master') && (
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Navigate to="/tasks" replace />} />
                   <Route path="tasks" element={<TaskBoardPage initialBoard={props.taskBoard} consultants={props.consultants} onUpdateTaskBoard={props.onUpdateTaskBoard} onUpdateTask={props.onUpdateTask} onDeleteTask={props.onDeleteTask} onAddTaskComment={props.onAddTaskComment} onUpdateTags={props.onUpdateTags} />} />
                  <Route path="agenda" element={<AgendaPage services={props.services} />} />
                  <Route path="meet" element={<MeetPage events={operationalEvents} />} />
                  <Route path="users" element={<UserListPage users={props.users} onSaveUser={props.onSaveUser} onDeleteUser={props.onDeleteUser} />} />
                </Route>
            )}

            {/* Rotas do Consultor */}
            {user && user.role === 'consultant' && currentConsultant && (
                <Route path="/consultant" element={<ConsultantLayout />}>
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
                          onDeleteTask={props.onDeleteTask}
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
            {user && user.role === 'client' && currentClient && (
                <Route path="/client" element={<ClientLayout />}>
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
                        allServices={props.services}
                        currentClient={currentClient}
                        onAddService={props.onAddService}
                      />}
                    />
                    <Route path="services/:serviceId" element={<ClientServiceDetailPage services={clientServices} />} />
                    <Route path="documents" element={
                      <ClientDocumentsPage
                        documents={clientDocuments}
                        currentClient={currentClient}
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
            {user && user.role === 'operational' && operationalUser && (
                <Route path="/operational" element={<OperationalLayout />}>
                    <Route index element={<Navigate to="tasks" replace />} />
                    <Route
                      path="tasks"
                      element={<OperationalTasksPage
                        taskBoard={props.taskBoard}
                        currentUser={operationalUser}
                      />}
                    />
                    <Route
                      path="agenda"
                      element={<AgendaPage services={props.services} />}
                    />
                    <Route
                      path="meet"
                      element={<OperationalMeetPage events={operationalEvents} />}
                    />
                </Route>
            )}
        </Route>
      </Route>
      
       {/* Rota de fallback para redirecionar para o login se nenhuma outra rota corresponder */}
       <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />

    </Routes>
  );
};

export default AppRoutes;