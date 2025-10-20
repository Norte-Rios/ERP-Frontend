import { useMemo } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import ConsultantLayout from '@/components/layout/ConsultantLayout';
import ClientLayout from '@/components/layout/ClientLayout';
import OperationalLayout from '@/components/layout/OperationalLayout';


// Páginas do Admin
import AdminDashboard from '@/features/admin/dashboard/AdminDashboard';
import ServiceListPage from '@/features/admin/services/ServiceListPage';
import ServiceDetailPage from '@/features/admin/services/ServiceDetailPage';
import AddServicePage from '@/features/admin/services/AddServicePage';
import EditServicePage from '@/features/admin/services/EditServicePage';
import ClientListPage from '@/features/admin/clients/ClientListPage';
import ClientDetailPage from '@/features/admin/clients/ClientDetailPage';
import AddClientPage from '@/features/admin/clients/AddClientPage';
import EditClientPage from '@/features/admin/clients/EditClientPage';
import AgendaPage from '@/features/admin/agenda/AgendaPage';
import ContractListPage from '@/features/admin/contracts/ContractListPage';
import ContractDetailPage from '@/features/admin/contracts/ContractDetailPage';
import AddContractPage from '@/features/admin/contracts/AddContractPage';
import EditContractPage from '@/features/admin/contracts/EditContractPage';
import ConsultantListPage from '@/features/admin/consultants/ConsultantListPage';
import AddConsultantPage from '@/features/admin/consultants/AddConsultantPage';
import ConsultantDetailPage from '@/features/admin/consultants/ConsultantDetailPage';
import EditConsultantPage from '@/features/admin/consultants/EditConsultantPage';
import ProviderListPage from '@/features/admin/providers/ProviderListPage';
import ProviderDetailPage from '@/features/admin/providers/ProviderDetailPage';
import AddProviderPage from '@/features/admin/providers/AddProviderPage';
import EditProviderPage from '@/features/admin/providers/EditProviderPage';
import DocumentPage from '@/features/admin/documents/DocumentPage';
import DocumentDetailPage from '@/features/admin/documents/DocumentDetailPage';
import TaskBoardPage from '@/features/admin/tasks/TaskBoardPage';
import LogbookPage from '@/features/admin/logbook/LogbookPage';
import FinancialPage from '@/features/admin/financial/FinancialPage';
import ReportsPage from '@/features/admin/reports/ReportsPage';

// Páginas do Consultor
import ConsultantDashboardPage from '@/features/consultant/dashboard/ConsultantDashboardPage';
import ConsultantTasksPage from '@/features/consultant/tasks/ConsultantTasksPage';
import ConsultantPaymentsPage from '@/features/consultant/payments/ConsultantPaymentsPage';
import ConsultantServicesPage from '@/features/consultant/services/ConsultantServicesPage';
import ConsultantServiceDetailPage from '@/features/consultant/services/ConsultantServiceDetailPage';
import ConsultantDocumentsPage from '@/features/consultant/documents/ConsultantDocumentsPage';
import ConsultantDocumentDetailPage from '@/features/consultant/documents/ConsultantDocumentDetailPage';
import ConsultantLogbookPage from '@/features/consultant/logbook/ConsultantLogbookPage';

// Páginas Operacionais
import OperationalTasksPage from '@/features/operational/tasks/OperationalTasksPage';
import MeetPage from '@/features/operational/meet/MeetPage';

// Páginas do Cliente
import ClientDashboardPage from '@/features/client/dashboard/ClientDashboardPage';
import ClientServicesPage from '@/features/client/services/ClientServicesPage';
import ClientServiceDetailPage from '@/features/client/services/ClientServiceDetailPage';
import ClientDocumentsPage from "@/features/client/documents/ClientDocumentsPage";
import ClientDocumentDetailPage from "@/features/client/documents/ClientDocumentDetailPage";
import ClientFinancialPage from "@/features/client/financial/ClientFinancialPage";


// Tipos
import { Service } from '@/features/admin/services/types';
import { Client } from '@/features/admin/clients/types';
import { Contract } from '@/features/admin/contracts/types';
import { Consultant } from '@/features/admin/consultants/types';
import { ServiceProvider } from '@/features/admin/providers/types';
import { Document } from '@/features/admin/documents/types';
import { TaskBoard, Task, Tag } from '@/features/admin/tasks/types';
import { LogEntry, Announcement } from '@/features/admin/logbook/types';
import { RevenueTransaction, Expense, Payment } from '@/features/admin/financial/types';
import { CalendarEvent } from '@/features/admin/agenda/types';

// Tipo para o autor de uma entrada ou comentário no logbook
type LogAuthor = { id: string; name: string; avatarUrl: string };


interface AppRoutesProps {
  services: Service[];
  onAddService: (service: Omit<Service, 'id' | 'status'>) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  clients: Client[];
  onAddClientAndContract: (clientData: Omit<Client, 'id' | 'registrationDate' | 'contractIds'>, contractData: Omit<Contract, 'id' | 'clientId' | 'clientName' | 'status'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  contracts: Contract[];
  onAddContract: (contract: Omit<Contract, 'id'>) => void;
  onUpdateContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
  consultants: Consultant[];
  onAddConsultant: (consultant: Omit<Consultant, 'id'>) => void;
  onUpdateConsultant: (consultant: Consultant) => void;
  onDeleteConsultant: (consultantId: string) => void;
  providers: ServiceProvider[];
  onAddProvider: (provider: Omit<ServiceProvider, 'id'>) => void;
  onUpdateProvider: (provider: ServiceProvider) => void;
  onDeleteProvider: (providerId: string) => void; 
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
  expenses: Expense[];
  payments: Payment[];
  onUpdatePaymentStatus: (paymentId: string, status: 'Pago' | 'Pendente') => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
}

const AppRoutes = (props: AppRoutesProps) => {
  // Simulação de utilizador logado (no futuro, isto virá de um contexto de autenticação)
  const currentConsultant = props.consultants[0];
  const currentClient = props.clients[0];
  const mockOperationalUser = {
    id: 'OP-001',
    fullName: 'Sued Silva',
  };

  // Dados filtrados para o Consultor
  const consultantServices = props.services.filter(service => service.consultants.includes(currentConsultant.fullName));
  const consultantPayments = props.payments.filter(payment => payment.payee.id === currentConsultant.id);
  const consultantTaskBoard: TaskBoard = {
    ...props.taskBoard,
    tasks: Object.fromEntries(
      Object.entries(props.taskBoard.tasks).filter(([, task]) => task.assignee?.id === currentConsultant.id)
    ),
    columns: Object.fromEntries(
      Object.entries(props.taskBoard.columns).map(([columnId, column]) => [
        columnId,
        {
          ...column,
          taskIds: column.taskIds.filter(taskId => 
            props.taskBoard.tasks[taskId]?.assignee?.id === currentConsultant.id
          ),
        },
      ])
    ),
  };
  const consultantDocuments = props.documents.filter(doc => 
    (doc.recipient.type === 'Consultor' && doc.recipient.id === currentConsultant.id) || 
    (doc.sender.name === currentConsultant.fullName)
  );
  
  // Dados filtrados para o Cliente
  const clientServices = props.services.filter(s => s.clientName === currentClient.companyName);
  const clientContracts = props.contracts.filter(c => c.clientId === currentClient.id);
  const clientRevenues = props.revenues.filter(r => r.clientId === currentClient.id);
  const clientDocuments = props.documents.filter(doc => 
    (doc.recipient.type === 'Cliente' && doc.recipient.id === currentClient.id) ||
    (doc.sender.name === currentClient.companyName)
  );

  
  const adminAuthor: LogAuthor = { id: 'ADMIN', name: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' };
  const consultantAuthor: LogAuthor = { id: currentConsultant.id, name: currentConsultant.fullName, avatarUrl: `https://i.pravatar.cc/150?u=${currentConsultant.id}` };
  const clientAuthor = { name: currentClient.companyName };

  const operationalEvents: CalendarEvent[] = useMemo(() => {
    const serviceEvents = (props.services || [])
      .filter(service => service.status === 'Em Andamento' || service.status === 'Pendente')
      .map(service => ({
        id: `service-${service.id}`,
        title: `Serviço: ${service.clientName}`,
        start: new Date(`${service.startDate}T00:00:00`),
        end: new Date(`${service.endDate}T23:59:59`),
        type: 'service',
        color: 'cyan',
        data: service,
      } as CalendarEvent));

    const taskEvents: CalendarEvent[] = [];
    
    return [...serviceEvents, ...taskEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [props.services]);


  return (
    <Routes>
      {/* Rotas do Administrador */}
      <Route element={<Outlet context={props} />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<AdminDashboard services={props.services} contracts={props.contracts} />} />
          <Route path="services" element={<ServiceListPage services={props.services} />} />
          <Route path="services/:serviceId" element={<ServiceDetailPage services={props.services} onDeleteService={props.onDeleteService} onUpdateService={props.onUpdateService} />} />
          <Route path="services/new" element={<AddServicePage />} />
          <Route path="services/:serviceId/edit" element={<EditServicePage services={props.services} onUpdateService={props.onUpdateService} />} />
          <Route path="clients" element={<ClientListPage clients={props.clients} />} />
          <Route path="clients/:clientId" element={<ClientDetailPage clients={props.clients} onDeleteClient={props.onDeleteClient} />} />
          <Route path="clients/new" element={<AddClientPage onAddClientAndContract={props.onAddClientAndContract} />} />
          <Route path="clients/:clientId/edit" element={<EditClientPage clients={props.clients} onUpdateClient={props.onUpdateClient} />} />
          <Route path="agenda" element={<AgendaPage services={props.services} />} />
          <Route path="contracts" element={<ContractListPage contracts={props.contracts} />} />
          <Route path="contracts/:contractId" element={<ContractDetailPage contracts={props.contracts} onDeleteContract={props.onDeleteContract} />} />
          <Route path="contracts/new" element={<AddContractPage clients={props.clients} onAddContract={props.onAddContract} />} />
          <Route path="contracts/:contractId/edit" element={<EditContractPage clients={props.clients} contracts={props.contracts} onUpdateContract={props.onUpdateContract} />} />
          <Route path="consultants" element={<ConsultantListPage consultants={props.consultants} />} />
          <Route path="consultants/:consultantId" element={<ConsultantDetailPage consultants={props.consultants} onDeleteConsultant={props.onDeleteConsultant} />} />
          <Route path="consultants/new" element={<AddConsultantPage onAddConsultant={props.onAddConsultant} />} />
          <Route path="consultants/:consultantId/edit" element={<EditConsultantPage consultants={props.consultants} onUpdateConsultant={props.onUpdateConsultant} />} />
          <Route path="providers" element={<ProviderListPage providers={props.providers} />} />
          <Route path="providers/:providerId" element={<ProviderDetailPage providers={props.providers} onUpdateProvider={props.onUpdateProvider} onDeleteProvider={props.onDeleteProvider} />} />
          <Route path="providers/new" element={<AddProviderPage onAddProvider={props.onAddProvider} />} />
          <Route path="providers/:providerId/edit" element={<EditProviderPage providers={props.providers} onUpdateProvider={props.onUpdateProvider} />} />
          <Route path="documents" element={<DocumentPage documents={props.documents} />} />
          <Route path="documents/:documentId" element={<DocumentDetailPage documents={props.documents} onAddComment={(docId, text) => props.onAddCommentToDocument(docId, text, 'Admin')} />} />
          <Route path="tasks" element={<TaskBoardPage initialBoard={props.taskBoard} consultants={props.consultants} onUpdateTaskBoard={props.onUpdateTaskBoard} onUpdateTask={props.onUpdateTask} onDeleteTask={props.onDeleteTask} onAddTaskComment={props.onAddTaskComment} onUpdateTags={props.onUpdateTags} />} />
          <Route path="logbook" element={<LogbookPage announcements={props.announcements} logEntries={props.logEntries} onAddEntry={(text) => props.onAddLogEntry(text, adminAuthor)} onAddComment={(entryId, text) => props.onAddLogComment(entryId, text, adminAuthor)} />} />
          <Route 
            path="financial" 
            element={<FinancialPage 
              revenues={props.revenues} 
              expenses={props.expenses} 
              payments={props.payments}
              consultants={props.consultants}
              providers={props.providers}
              onUpdatePaymentStatus={props.onUpdatePaymentStatus}
              onAddExpense={props.onAddExpense}
              onAddPayment={props.onAddPayment}
            />} 
          />
          <Route path="relatorios" element={<ReportsPage services={props.services} contracts={props.contracts} />} />
        </Route>
      </Route>

      {/* Rotas do Consultor */}
      <Route element={<Outlet context={props} />}>
          <Route path="/consultant" element={<ConsultantLayout />}>
              <Route 
                path="dashboard" 
                element={<ConsultantDashboardPage 
                    consultantName={currentConsultant.fullName}
                    tasks={Object.values(consultantTaskBoard.tasks)}
                    services={consultantServices}
                    payments={consultantPayments}
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
                    onAddEntry={(text) => props.onAddLogEntry(text, consultantAuthor)}
                    onAddComment={(entryId, text) => props.onAddLogComment(entryId, text, consultantAuthor)}
                />}
              />
              <Route 
                path="payments"
                element={<ConsultantPaymentsPage payments={consultantPayments} />}
              />
          </Route>
      </Route>

      {/* Rotas do Cliente */}
       <Route element={<Outlet context={props} />}>
          <Route path="/client" element={<ClientLayout client={currentClient} />}>
              <Route 
                path="dashboard" 
                element={<ClientDashboardPage 
                    clientName={currentClient.companyName}
                    services={clientServices}
                    contracts={clientContracts}
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
                  onAddDocument={(doc) => props.onAddDocument(doc, clientAuthor.name)}
                />
              } />
              <Route path="documents/:documentId" element={
                <ClientDocumentDetailPage 
                  documents={clientDocuments}
                  onAddComment={(docId, text) => props.onAddCommentToDocument(docId, text, clientAuthor.name)}
                />} 
              />
              <Route path="financial" element={<ClientFinancialPage contracts={clientContracts} revenues={clientRevenues} />} />
          </Route>
      </Route>

      {/* Rotas Operacionais */}
      <Route element={<Outlet context={props} />}>
          <Route path="/operational" element={<OperationalLayout user={mockOperationalUser} />}>
              <Route index element={<Navigate to="tasks" replace />} />
              <Route 
                path="tasks" 
                element={<OperationalTasksPage 
                  taskBoard={props.taskBoard}
                  currentUser={mockOperationalUser}
                />} 
              />
              <Route 
                path="agenda" 
                element={<AgendaPage services={props.services} />}
              />
              <Route 
                path="meet" 
                element={<MeetPage events={operationalEvents} />}
              />
          </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;