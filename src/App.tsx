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
import { Document } from './features/admin/documents/types';
import { mockDocuments } from './features/admin/documents/mockData';
import { TaskBoard, Task, Comment, Tag } from './features/admin/tasks/types';
import { mockTaskBoard } from './features/admin/tasks/mockData';
import { LogEntry, Announcement, LogComment } from './features/admin/logbook/types';
import { mockLogEntries, mockAnnouncements } from './features/admin/logbook/mockData';
import { RevenueTransaction } from './features/admin/financial/types';
import { mockRevenues } from './features/admin/financial/mockData';
import { User } from './features/admin/users/types';
import { mockUsers } from './features/admin/users/mockData';


function App() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [consultants, setConsultants] = useState<Consultant[]>(mockConsultants);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [taskBoard, setTaskBoard] = useState<TaskBoard>(mockTaskBoard);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(mockLogEntries);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [revenues, setRevenues] = useState<RevenueTransaction[]>(mockRevenues);
  const [users, setUsers] = useState<User[]>(mockUsers);

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

  const handleSaveUser = (user: Omit<User, 'id' | 'lastLogin'> | User) => {
    if ('id' in user) {
      // Update existing user
      setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? { ...u, ...user } : u));
    } else {
      // Add new user
      const newUser: User = {
        ...user,
        id: `USR-${Date.now()}`,
        lastLogin: new Date().toISOString(),
      };
      setUsers(prevUsers => [newUser, ...prevUsers]);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };


  return (
    <div className="bg-gray-100">
      <AppRoutes 
        services={services}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        clients={clients}
        contracts={contracts}
        consultants={consultants}
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
        users={users}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default App;