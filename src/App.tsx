import { useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import { Service } from './features/admin/services/types';
import { mockServices } from './features/admin/services/mockData';
import { Client } from './features/admin/clients/types';
import { mockClients } from './features/admin/clients/mockData';
import { Contract } from './features/admin/contracts/types';
import { mockContracts } from './features/admin/contracts/mockData';
import { Consultant } from './features/admin/consultants/types';
import { mockConsultants } from './features/admin/consultants/mockData';
import { ServiceProvider } from './features/admin/providers/types';
import { mockServiceProviders } from './features/admin/providers/mockData';
import { Document } from './features/admin/documents/types';
import { mockDocuments } from './features/admin/documents/mockData';
import { TaskBoard, Task, Comment, Tag } from './features/admin/tasks/types';
import { mockTaskBoard } from './features/admin/tasks/mockData';
import { LogEntry, Announcement, LogComment } from './features/admin/logbook/types';
import { mockLogEntries, mockAnnouncements } from './features/admin/logbook/mockData';
import { RevenueTransaction, Expense, Payment } from './features/admin/financial/types';
import { mockRevenues, mockExpenses, mockPayments } from './features/admin/financial/mockData';


function App() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [consultants, setConsultants] = useState<Consultant[]>(mockConsultants);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(mockServiceProviders);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [taskBoard, setTaskBoard] = useState<TaskBoard>(mockTaskBoard);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(mockLogEntries);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [revenues, setRevenues] = useState<RevenueTransaction[]>(mockRevenues);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const handleAddService = (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: `S${Date.now()}` };
    setServices(prevServices => [newService, ...prevServices]);
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === updatedService.id ? updatedService : service
      )
    );
  };
  
  const handleDeleteService = (serviceId: string) => {
    setServices(prevServices => prevServices.filter(s => s.id !== serviceId));
  };

  const handleClientAndContractAdd = (
    clientData: Omit<Client, 'id' | 'registrationDate' | 'contractIds'>,
    contractData: Omit<Contract, 'id' | 'clientId' | 'clientName' | 'status'>
  ) => {
    const newClientId = `C${Date.now()}`;
    const newContractId = `CTR-${Date.now()}`;

    const newClient: Client = {
      ...clientData,
      id: newClientId,
      registrationDate: new Date().toISOString().split('T')[0],
      contractIds: [newContractId],
    };

    const newContract: Contract = {
      ...contractData,
      id: newContractId,
      clientId: newClientId,
      clientName: newClient.companyName,
      status: 'Em Negociação',
    };

    setClients(prev => [newClient, ...prev]);
    setContracts(prev => [newContract, ...prev]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prevClients => prevClients.filter(c => c.id !== clientId));
  };

  const handleAddContract = (contract: Omit<Contract, 'id'>) => {
    const newContract = { ...contract, id: `CTR-${Date.now()}` };
    setContracts(prevContracts => [newContract, ...prevContracts]);
    setClients(prevClients => prevClients.map(client => 
      client.id === newContract.clientId 
        ? { ...client, contractIds: [...(client.contractIds || []), newContract.id] }
        : client
    ));
  };

  const handleUpdateContract = (updatedContract: Contract) => {
    setContracts(prevContracts =>
      prevContracts.map(contract =>
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );
  };

  const handleDeleteContract = (contractId: string) => {
    setContracts(prevContracts => prevContracts.filter(c => c.id !== contractId));
  };
  
  const handleAddConsultant = (consultant: Omit<Consultant, 'id'>) => {
    const newConsultant = {
      ...consultant,
      id: `CON-${Date.now()}`,
    };
    setConsultants(prev => [newConsultant, ...prev]);
  };

  const handleUpdateConsultant = (updatedConsultant: Consultant) => {
    setConsultants(prevConsultants =>
      prevConsultants.map(consultant =>
        consultant.id === updatedConsultant.id ? updatedConsultant : consultant
      )
    );
  };

  const handleDeleteConsultant = (consultantId: string) => {
    setConsultants(prevConsultants => prevConsultants.filter(c => c.id !== consultantId));
  };
  
  const handleAddProvider = (provider: Omit<ServiceProvider, 'id'>) => {
    const newProvider = { ...provider, id: `PROV-${Date.now()}`};
    setServiceProviders(prev => [newProvider, ...prev]);
  };
  
  const handleUpdateProvider = (updatedProvider: ServiceProvider) => {
    setServiceProviders(prevProviders =>
      prevProviders.map(provider =>
        provider.id === updatedProvider.id ? updatedProvider : provider
      )
    );
  };

  const handleDeleteProvider = (providerId: string) => {
    setServiceProviders(prevProviders => prevProviders.filter(p => p.id !== providerId));
  };

  const handleAddCommentToDocument = (documentId: string, commentText: string, author: string) => {
    const newComment = {
      id: `COMMENT-${Date.now()}`,
      author: author,
      text: commentText,
      date: new Date().toISOString(),
    };
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId
          ? { ...doc, 
              comments: [...doc.comments, newComment],
              history: [...doc.history, { status: `Comentário de ${author}`, date: new Date().toISOString() }]
            }
          : doc
      )
    );
  };

  const handleAddDocument = (document: Omit<Document, 'id' | 'sentAt' | 'history' | 'comments' | 'status' | 'sender'>, authorName?: string) => {
    const newDocument: Document = {
      ...document,
      id: `DOC-${Date.now()}`,
      sender: { name: authorName || 'Admin' },
      sentAt: new Date().toISOString(),
      status: document.direction === 'sent' ? 'Enviado' : 'Recebido',
      history: [{ status: document.direction === 'sent' ? 'Enviado' : 'Recebido', date: new Date().toISOString() }],
      comments: [],
    };
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleUpdateTaskBoard = (newBoard: TaskBoard) => {
    setTaskBoard(newBoard);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const newBoard = { ...taskBoard };
    newBoard.tasks[updatedTask.id] = updatedTask;
    setTaskBoard(newBoard);
  };

  const handleDeleteTask = (taskId: string) => {
    const newBoard = { ...taskBoard };
    delete newBoard.tasks[taskId];
    Object.keys(newBoard.columns).forEach(columnId => {
      newBoard.columns[columnId].taskIds = newBoard.columns[columnId].taskIds.filter(id => id !== taskId);
    });
    setTaskBoard(newBoard);
  };

  const handleAddTaskComment = (taskId: string, commentText: string, author: string = 'Admin') => {
    const newComment: Comment = {
      author,
      date: new Date().toISOString(),
      text: commentText,
    };
    const newBoard = { ...taskBoard };
    const task = newBoard.tasks[taskId];
    if (task) {
      task.comments = [...(task.comments || []), newComment];
      setTaskBoard(newBoard);
    }
  };
  
  const handleUpdateTags = (updatedTags: Tag[]) => {
    const newTagsObject = updatedTags.reduce((acc, tag) => {
        acc[tag.id] = tag;
        return acc;
    }, {});
    setTaskBoard(prevBoard => ({
        ...prevBoard,
        tags: newTagsObject
    }));
  };

  const handleAddLogEntry = (text: string, author) => {
    const newEntry: LogEntry = {
        id: `LOG-${Date.now()}`,
        author,
        text,
        createdAt: new Date().toISOString(),
        comments: []
    };
    setLogEntries(prev => [newEntry, ...prev]);
  };

  const handleAddLogComment = (entryId: string, text: string, author) => {
    const newComment: LogComment = {
        id: `COMMENT-${Date.now()}`,
        author,
        text,
        createdAt: new Date().toISOString()
    };
    setLogEntries(prev => prev.map(entry => 
        entry.id === entryId
            ? { ...entry, comments: [...entry.comments, newComment] }
            : entry
    ));
  };

  const handleUpdatePaymentStatus = (paymentId: string, status: 'Pago' | 'Pendente') => {
    setPayments(prevPayments => prevPayments.map(p => 
        p.id === paymentId ? { ...p, status, paymentDate: status === 'Pago' ? new Date().toISOString() : undefined } : p
    ));
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `EXP-${Date.now()}`};
    setExpenses(prev => [newExpense, ...prev]);
  }

  const handleAddPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: `PAY-${Date.now()}`};
    setPayments(prev => [newPayment, ...prev]);
  }


  return (
    <div className="bg-gray-100">
      <AppRoutes 
        services={services}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
        clients={clients}
        onAddClientAndContract={handleClientAndContractAdd}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        contracts={contracts}
        onAddContract={handleAddContract}
        onUpdateContract={handleUpdateContract}
        onDeleteContract={handleDeleteContract}
        consultants={consultants}
        onAddConsultant={handleAddConsultant}
        onUpdateConsultant={handleUpdateConsultant}
        onDeleteConsultant={handleDeleteConsultant}
        providers={serviceProviders}
        onAddProvider={handleAddProvider}
        onUpdateProvider={handleUpdateProvider}
        onDeleteProvider={handleDeleteProvider}
        documents={documents}
        onAddCommentToDocument={handleAddCommentToDocument}
        onAddDocument={handleAddDocument}
        taskBoard={taskBoard}
        onUpdateTaskBoard={handleUpdateTaskBoard}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onAddTaskComment={handleAddTaskComment}
        onUpdateTags={handleUpdateTags}
        announcements={announcements}
        logEntries={logEntries}
        onAddLogEntry={handleAddLogEntry}
        onAddLogComment={handleAddLogComment}
        revenues={revenues}
        expenses={expenses}
        payments={payments}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        onAddExpense={handleAddExpense}
        onAddPayment={handleAddPayment}
      />
    </div>
  );
}

export default App;