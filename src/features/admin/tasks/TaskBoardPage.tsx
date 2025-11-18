import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from "../../../auth/AuthContext.tsx";
import { TaskBoard, Task, Comment as FrontendComment, Tag } from './types';
import {
  PlusCircle,
  User,
  Calendar,
  X,
  Edit,
  Trash2,
  MessageSquare,
  Settings,
  AlertCircle,
  Loader2,
  Check,
  Search,
  ChevronDown
} from 'lucide-react';

// dnd-kit
import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

import axios from 'axios';

// --- Injeção de estilos antigos (mantidos, mas agora usamos mais inline styles) ---
const styles = `
  .tag-3b82f6 { background-color: #3B82F6 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
  .tag-10b981 { background-color: #10B981 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
  .tag-ef4444 { background-color: #EF4444 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
  .tag-f59e0b { background-color: #F59E0B !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
  .tag-8b5cf6 { background-color: #8B5CF6 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
  .tag-ec4899 { background-color: #EC4899 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
`;

if (typeof document !== 'undefined') {
  const styleId = 'taskboard-tag-styles';
  let styleSheet = document.getElementById(styleId);
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }
}

// --- Constantes de API ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_TASKS_URL = `${API_BASE_URL}/tasks`;
const API_ETIQUETAS_URL = `${API_BASE_URL}/etiquetas`;
const API_USERS_URL = `${API_BASE_URL}/users`;
const API_COMMENT_URL = `${API_BASE_URL}/comments`;

type NewTagData = { nome: string; color: string; };

export interface BackendComment {
  id: string;
  comment: string;
  user: { id: string; nome: string; };
  tasks?: { id: string; };
  createdAt: string;
}

// --- Helper para transformar URLs em links clicáveis ---
const linkifyText = (text?: string): React.ReactNode => {
  if (!text) return null;

  // Detecta http(s)://... ou www....
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const startIndex = match.index;

    // Texto antes da URL
    if (startIndex > lastIndex) {
      elements.push(text.slice(lastIndex, startIndex));
    }

    const href = url.startsWith('http') ? url : `https://${url}`;

    elements.push(
      <a
        key={elements.length}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline break-all"
      >
        {url}
      </a>
    );

    lastIndex = startIndex + url.length;
  }

  // Resto do texto
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
};

// --- Funções de API ---

const apiGetUsers = async (): Promise<any[]> => {
  const response = await fetch(API_USERS_URL);
  if (!response.ok) throw new Error(`Falha GET Users: ${response.status}`);
  return response.json();
};

const apiGetTags = async (): Promise<Tag[]> => {
  const response = await fetch(API_ETIQUETAS_URL);
  if (!response.ok) throw new Error(`Falha GET Tags: ${response.status}`);
  return response.json();
};

const apiCreateTag = async (data: NewTagData): Promise<Tag> => {
  const response = await fetch(API_ETIQUETAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Falha POST Tag: ${response.status}`);
  return response.json();
};

const apiDeleteTag = async (id: string): Promise<void> => {
  const response = await fetch(`${API_ETIQUETAS_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Falha DELETE Tag: ${response.status}`);
};

// Envia chaves no SINGULAR ('userId', 'etiquetaId') como arrays
const apiCreateTask = async (taskData: any): Promise<Task> => {
  const cleanTaskData: any = {
    titulo: taskData.titulo,
    description: taskData.description,
    data: taskData.data,
    status: "a fazer",
    userId: taskData.userIds || [],
  };

  // Só envia 'etiquetaId' se tiver pelo menos uma
  if (taskData.etiquetaIds && taskData.etiquetaIds.length > 0) {
    cleanTaskData.etiquetaId = taskData.etiquetaIds;
  }

  const response = await fetch(API_TASKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanTaskData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMsg = errorBody.message
      ? (Array.isArray(errorBody.message) ? errorBody.message.join(', ') : errorBody.message)
      : 'Erro desconhecido';
    console.error("Erro ao criar task:", errorBody);
    throw new Error(`Falha POST Task: ${response.status} - ${errorMsg}`);
  }
  const newTask = await response.json();

  const etiquetas: Tag[] = Array.isArray(newTask.etiquetas)
    ? newTask.etiquetas
    : (Array.isArray(newTask.etiqueta) ? newTask.etiqueta : []);
  const users: any[] = Array.isArray(newTask.users)
    ? newTask.users
    : (Array.isArray(newTask.user) ? newTask.user : []);

  return {
    ...newTask,
    etiquetas,
    etiquetaIds: etiquetas.map(t => t.id),
    users,
    userIds: users.map(u => u.id),
    coment: [],
  };
};

// Mapeia GET tasks do backend para o tipo do frontend
const apiGetTasks = async (): Promise<Task[]> => {
  const response = await fetch(API_TASKS_URL);
  if (!response.ok) throw new Error(`Falha GET Tasks: ${response.status}`);
  const tasksFromApi: any[] = await response.json();

  return tasksFromApi.map((task: any): Task => {
    const etiquetas: Tag[] = Array.isArray(task.etiqueta) ? task.etiqueta : [];
    const users: any[] = Array.isArray(task.user) ? task.user : [];

    const etiquetaIds: string[] = etiquetas.map(t => t.id);
    const userIds: string[] = users.map(u => u.id);

    const frontendTask: Task = {
      ...task,
      etiquetas,
      etiquetaIds,
      users,
      userIds,
      coment: [],
    };

    delete (frontendTask as any).comments;
    delete (frontendTask as any).comment;
    delete (frontendTask as any).etiqueta;
    delete (frontendTask as any).etiquetaId;
    delete (frontendTask as any).user;
    delete (frontendTask as any).userId;

    return frontendTask;
  });
};

// PATCH tasks com payload limpo (usado em edição e etc)
const apiUpdateTask = async (id: string, taskData: any): Promise<Task> => {
  const cleanTaskData: any = {};

  if (taskData.titulo !== undefined) cleanTaskData.titulo = taskData.titulo;
  if (taskData.description !== undefined) cleanTaskData.description = taskData.description;
  if (taskData.data !== undefined) cleanTaskData.data = taskData.data;
  if (taskData.status !== undefined) cleanTaskData.status = taskData.status;

  if (taskData.userIds !== undefined) {
    cleanTaskData.userId = taskData.userIds;
  }

  if (taskData.etiquetaIds !== undefined) {
    if (taskData.etiquetaIds.length > 0) {
      cleanTaskData.etiquetaId = taskData.etiquetaIds;
    } else {
      cleanTaskData.etiquetaId = [];
    }
  }

  const response = await fetch(`${API_TASKS_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanTaskData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMsg = errorBody.message
      ? (Array.isArray(errorBody.message) ? errorBody.message.join(', ') : errorBody.message)
      : 'Erro desconhecido';
    console.error(`Erro ao atualizar task ${id}:`, errorBody);
    throw new Error(`Falha PATCH Task: ${response.status} - ${errorMsg}`);
  }
  const updatedTask = await response.json();

  const etiquetas: Tag[] = Array.isArray(updatedTask.etiquetas)
    ? updatedTask.etiquetas
    : (Array.isArray(updatedTask.etiqueta) ? updatedTask.etiqueta : []);
  const users: any[] = Array.isArray(updatedTask.users)
    ? updatedTask.users
    : (Array.isArray(updatedTask.user) ? updatedTask.user : []);

  return {
    ...updatedTask,
    etiquetas,
    etiquetaIds: etiquetas.map(t => t.id),
    users,
    userIds: users.map(u => u.id),
    coment: [],
  };
};

const apiDeleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_TASKS_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Falha DELETE Task: ${response.status}`);
};

const apiGetCommentsByTask = async (taskId: string): Promise<BackendComment[]> => {
  const response = await fetch(`${API_COMMENT_URL}/task/${taskId}`);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Erro ao buscar comentários para task ${taskId}:`, errorBody);
    throw new Error(`Falha GET Comments: ${response.status} - ${errorBody}`);
  }
  const comments = await response.json();
  return Array.isArray(comments) ? comments : [];
};

const apiAddComment = async (taskId: string, commentText: string, userId: string): Promise<BackendComment> => {
  const response = await fetch(`${API_COMMENT_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: commentText, userId, taskId }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro ao adicionar comentário:", errorBody);
    throw new Error(`Falha ADD Comment: ${response.status} - ${errorBody}`);
  }
  return response.json();
};

const transformTagsArrayToObject = (tags: Tag[]): Record<string, Tag> => {
  return tags.reduce((acc, tag) => { acc[tag.id] = tag; return acc; }, {} as Record<string, Tag>);
};

// --- Componente TaskTags (Exibe múltiplas etiquetas com cor marcada) ---
const TaskTags = ({ etiquetas }: { etiquetas: Tag[] | undefined }) => {
  if (!etiquetas || etiquetas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 mb-1">
      {etiquetas.map((tag) => {
        if (!tag) return null;
        const bg = tag.color || '#6B7280';

        return (
          <span
            key={tag.id}
            className="px-2 py-0.5 rounded-full text-[0.70rem] font-semibold"
            style={{ backgroundColor: bg, color: 'white' }}
          >
            {tag.nome}
          </span>
        );
      })}
    </div>
  );
};

// --- Componente TaskCard (para dnd-kit DragOverlay) ---
interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  style?: React.CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;
  [key: string]: any;
}

const TaskCard = ({ task, onClick, style, innerRef, ...rest }: TaskCardProps) => (
  <div
    ref={innerRef}
    onClick={() => onClick && onClick(task)}
    style={style}
    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-150 ease-in-out relative overflow-hidden"
    {...rest}
  >
    <h4 className="font-semibold text-sm text-gray-800 mb-1">
      {task.titulo || "Tarefa sem título"}
    </h4>
    <TaskTags etiquetas={task.etiquetas} />
    <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
      <div className="flex items-center gap-2">
        {task.data && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              {task.data
                ? new Date(task.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : ''}
            </span>
          </div>
        )}
      </div>
      {task.users && task.users.length > 0 ? (
        <div
          className="flex -space-x-2 overflow-hidden"
          title={task.users.map(u => u.nome).join(', ')}
        >
          {task.users.slice(0, 3).map(user => (
            <div
              key={user.id}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
              title={user.nome}
            >
              {user.nome ? user.nome.charAt(0).toUpperCase() : '?'}
            </div>
          ))}
          {task.users.length > 3 && (
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs font-semibold text-white">
              +{task.users.length - 3}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400 italic">N/A</span>
      )}
    </div>
  </div>
);

// --- Avatar de Usuário ---
const UserAvatar = ({ user }: { user: { nome: string } }) => (
  <div
    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
    title={user.nome}
  >
    {user.nome ? user.nome.charAt(0).toUpperCase() : '?'}
  </div>
);

// --- Seletor múltiplo de usuários ---
interface UserMultiSelectDropdownProps {
  allUsers: { id: string; nome: string }[];
  selectedUserIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

const UserMultiSelectDropdown: React.FC<UserMultiSelectDropdownProps> = ({
  allUsers,
  selectedUserIds,
  onChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = useMemo(
    () => allUsers.filter(user =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [allUsers, searchTerm]
  );

  const selectedUsersMap = useMemo(
    () => new Set(selectedUserIds),
    [selectedUserIds]
  );

  const selectedUsers = allUsers.filter(u => selectedUsersMap.has(u.id));

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    onChange(Array.from(newSelected));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Responsáveis
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between disabled:bg-gray-100"
      >
        <span className="flex-1">
          {selectedUsers.length === 0 ? (
            <span className="text-gray-500">Selecionar usuários...</span>
          ) : (
            <div className="flex -space-x-2 overflow-hidden">
              {selectedUsers.slice(0, 4).map(user => (
                <UserAvatar key={user.id} user={user} />
              ))}
              {selectedUsers.length > 4 && (
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs font-semibold text-white">
                  +{selectedUsers.length - 4}
                </div>
              )}
            </div>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md text-sm"
              />
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isSelected = selectedUsersMap.has(user.id);
                return (
                  <li
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className="px-3 py-2 text-sm rounded-md flex items-center gap-3 cursor-pointer hover:bg-gray-100"
                  >
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <User size={16} />
                    <span>{user.nome}</span>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 italic text-center">
                Nenhum usuário encontrado.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- MODAL: Nova Task ---
const NewTaskModal = ({
  isOpen,
  onClose,
  users,
  allTags,
  onTaskCreated,
  targetColumn,
}: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedUserIds([]);
    setSelectedTagIds([]);
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const handleTagClick = (tagId: string) => {
    setError('');
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    if (selectedTagIds.length === 0) {
      setError("Selecione pelo menos uma etiqueta.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const taskData = {
        titulo: title.trim(),
        userIds: selectedUserIds,
        etiquetaIds: selectedTagIds,
        description: description.trim() || null,
        data: dueDate || null,
        status: "a fazer",
      };

      const newTaskFromApi = await apiCreateTask(taskData);

      const populatedUsers = selectedUserIds
        .map((id: string) => users.find((u: any) => u.id === id))
        .filter(Boolean);

      const populatedEtiquetas = selectedTagIds
        .map((id: string) => allTags[id])
        .filter(Boolean);

      const finalNewTask: Task = {
        ...newTaskFromApi,
        users: populatedUsers,
        userIds: selectedUserIds,
        etiquetas: populatedEtiquetas,
        etiquetaIds: selectedTagIds,
        coment: [],
      };

      onTaskCreated(finalNewTask, targetColumn);
      onClose();
    } catch (err: any) {
      setError(`Falha ao criar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Nova Tarefa</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            className={`w-full px-3 py-2 border rounded-md ${
              error && !title.trim() ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            disabled={loading}
          />

          <UserMultiSelectDropdown
            allUsers={users}
            selectedUserIds={selectedUserIds}
            onChange={setSelectedUserIds}
            disabled={loading}
          />

          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiqueta
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(allTags || {}).map((tag: Tag) => {
                const selected = selectedTagIds.includes(tag.id);
                const bg = selected ? (tag.color || '#4F46E5') : '#FFFFFF';
                const border = tag.color || '#D1D5DB';
                const textColor = selected ? '#FFFFFF' : '#374151';

                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm font-semibold rounded-full transition-colors border shadow-sm"
                    style={{
                      backgroundColor: bg,
                      borderColor: border,
                      color: textColor,
                    }}
                  >
                    {tag.nome}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL: Detalhes da Task ---
const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  users,
  allTags,
  onTaskUpdated,
  onTaskDeleted,
  loggedInUser,
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editData, setEditData] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<FrontendComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTaskAndComments = async () => {
      if (task && isOpen) {
        setEditData({ ...task, coment: [] });
        setIsEditing(false);
        setIsConfirmingDelete(false);
        setError('');
        setNewComment('');
        setComments([]);

        setCommentLoading(true);
        try {
          const fetchedComments = await apiGetCommentsByTask(task.id);
          const frontendComments = fetchedComments
            .map(beComment => ({
              id: beComment.id,
              text: beComment.comment,
              author: beComment.user?.nome || 'Desconhecido',
              date: beComment.createdAt,
            }))
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          setComments(frontendComments);
        } catch (err: any) {
          console.error("Erro ao buscar comentários:", err);
          setError("Falha ao carregar comentários.");
          setComments([]);
        } finally {
          setCommentLoading(false);
        }
      } else if (!isOpen) {
        setEditData(null);
        setComments([]);
      }
    };
    loadTaskAndComments();
  }, [task, isOpen]);

  if (!isOpen || !editData) return null;

  const handleSave = async () => {
    if (!editData.etiquetaIds || editData.etiquetaIds.length === 0) {
      setError("Selecione pelo menos uma etiqueta.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updateData = {
        titulo: editData.titulo,
        userIds: editData.userIds || [],
        etiquetaIds: editData.etiquetaIds || [],
        description: editData.description || null,
        data: editData.data || null,
        status: editData.status,
      };

      const updatedTaskResult = await apiUpdateTask(editData.id, updateData);

      const taskWithLocalData: Task = {
        ...updatedTaskResult,
        users: editData.users,
        userIds: editData.userIds,
        etiquetas: editData.etiquetas,
        etiquetaIds: editData.etiquetaIds,
        coment: comments,
      };

      onTaskUpdated(taskWithLocalData);
      setEditData(taskWithLocalData);
      setIsEditing(false);
    } catch (err: any) {
      setError(`Falha ao atualizar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await apiDeleteTask(editData.id);
      onTaskDeleted(editData.id);
      onClose();
    } catch (err: any) {
      setError(`Falha: ${err.message}`);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && loggedInUser?.id && editData?.id) {
      setCommentLoading(true);
      setError('');
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticComment: FrontendComment = {
        id: optimisticId,
        text: newComment.trim(),
        author: loggedInUser.nome,
        date: new Date().toISOString(),
      };
      const previousComments = comments;

      try {
        setComments(prev => [optimisticComment, ...prev]);
        setNewComment('');

        const newBackendComment = await apiAddComment(
          editData.id,
          optimisticComment.text,
          loggedInUser.id
        );
        if (
          !newBackendComment?.id ||
          !newBackendComment.comment ||
          !newBackendComment.user ||
          !newBackendComment.createdAt
        ) {
          throw new Error("Resposta inválida.");
        }

        const finalFrontendComment: FrontendComment = {
          id: newBackendComment.id,
          text: newBackendComment.comment,
          author: newBackendComment.user.nome,
          date: newBackendComment.createdAt,
        };

        setComments(prev =>
          prev.map(c => (c.id === optimisticId ? finalFrontendComment : c))
        );

        setComments(currentComments => {
          const updatedTaskForBoard = {
            ...editData,
            coment: currentComments,
          };
          setEditData(updatedTaskForBoard);
          onTaskUpdated(updatedTaskForBoard);
          return currentComments;
        });
      } catch (err: any) {
        console.error("Erro comentário:", err);
        setError(`Falha ao adicionar comentário: ${err.message}`);
        setComments(previousComments);
        setNewComment(optimisticComment.text);
      } finally {
        setCommentLoading(false);
      }
    } else if (!loggedInUser?.id) {
      setError("Utilizador não logado.");
    } else if (!editData?.id) {
      setError("Erro: ID da tarefa.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData(prev => {
      if (!prev) return null;

      if (name === 'data') {
        const currentIsoDate = prev.data ? new Date(prev.data) : new Date(0);
        const newDate = value ? new Date(value) : null;
        if (newDate) {
          const hours = currentIsoDate.getUTCHours();
          const minutes = currentIsoDate.getUTCMinutes();
          const seconds = currentIsoDate.getUTCSeconds();
          newDate.setUTCHours(hours, minutes, seconds, 0);
          return { ...prev, data: newDate.toISOString() };
        } else {
          return { ...prev, data: null };
        }
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleTagClick = (tagId: string) => {
    setError('');
    setEditData(prev => {
      if (!prev) return null;
      const currentTagIds = prev.etiquetaIds || [];
      const newTagIds = currentTagIds.includes(tagId)
        ? currentTagIds.filter(id => id !== tagId)
        : [...currentTagIds, tagId];
      const newEtiquetas = newTagIds
        .map(id => allTags[id])
        .filter(Boolean);

      return {
        ...prev,
        etiquetaIds: newTagIds,
        etiquetas: newEtiquetas,
      };
    });
  };

  const handleCloseModal = () => onClose();

  const renderContent = () => {
    if (isConfirmingDelete) {
      return (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Confirmar Exclusão
          </h3>
          <p>Tem a certeza que deseja apagar a tarefa "{editData.titulo}"?</p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsConfirmingDelete(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center w-24"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                'Apagar'
              )}
            </button>
          </div>
        </>
      );
    }

    if (isEditing) {
      return (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Editar Tarefa
          </h3>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <input
              name="titulo"
              type="text"
              value={editData.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
            <textarea
              name="description"
              value={editData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              disabled={loading}
            />

            <UserMultiSelectDropdown
              allUsers={users}
              selectedUserIds={editData.userIds || []}
              onChange={(newIds) => {
                setEditData(prev =>
                  prev
                    ? {
                        ...prev,
                        userIds: newIds,
                        users: users.filter((u: any) => newIds.includes(u.id)),
                      }
                    : null
                );
              }}
              disabled={loading}
            />

            <input
              name="data"
              type="date"
              value={editData.data ? editData.data.split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(allTags || {}).map((tag: Tag) => {
                  const selected =
                    (editData.etiquetaIds || []).includes(tag.id);
                  const bg = selected ? (tag.color || '#4F46E5') : '#FFFFFF';
                  const border = tag.color || '#D1D5DB';
                  const textColor = selected ? '#FFFFFF' : '#374151';

                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm font-semibold rounded-full transition-colors border shadow-sm"
                      style={{
                        backgroundColor: bg,
                        borderColor: border,
                        color: textColor,
                      }}
                    >
                      {tag.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin h-4 w-4" />}
              Salvar
            </button>
          </div>
        </>
      );
    }

    // Modo visualização
    return (
      <>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{editData.titulo}</h3>
          <button
            onClick={handleCloseModal}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        {error && !commentLoading && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <div className="flex-grow overflow-y-auto pr-2 max-h-[calc(90vh-160px)]">
          <TaskTags etiquetas={editData.etiquetas} />

          {editData.description && (
            <p className="text-gray-600 my-4 whitespace-pre-wrap break-words">
              {linkifyText(editData.description)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <div>
              <strong className="block text-gray-500">Responsáveis:</strong>
              {editData.users && editData.users.length > 0
                ? editData.users.map(u => u.nome).join(', ')
                : 'Não atribuída'}
            </div>
            <div>
              <strong className="block text-gray-500">Data:</strong>
              {editData.data
                ? new Date(editData.data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC',
                  })
                : 'Não definida'}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-3">
              Comentários ({comments.length})
            </h4>
            {error && commentLoading && (
              <div className="mb-2 p-2 text-sm bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {commentLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-2">
                  Nenhum comentário.
                </p>
              ) : (
                comments.map((comment: FrontendComment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div
                      className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm text-gray-600 flex-shrink-0"
                      title={comment.author}
                    >
                      {comment.author
                        ? comment.author.charAt(0).toUpperCase()
                        : '?'}
                    </div>
                    <div className="flex-1 bg-white p-2 rounded shadow-sm border border-gray-200">
                      <p className="font-semibold text-sm text-gray-800">
                        {comment.author || 'Desconhecido'}{' '}
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          {comment.date
                            ? new Date(comment.date).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                        {linkifyText(comment.text)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e =>
                  e.key === 'Enter' && !commentLoading && handleAddComment()
                }
                placeholder="Adicionar comentário..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={commentLoading}
              />
              <button
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center w-28 text-sm"
              >
                {commentLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  'Comentar'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-end gap-3 border-t pt-4">
          <button
            onClick={() => setIsConfirmingDelete(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} /> Apagar
          </button>
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2 disabled:opacity-50"
          >
            <Edit size={16} /> Editar
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};

// --- MODAL: Gerir Etiquetas ---
const ManageTagsModal = ({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onDeleteTag,
}: any) => {
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTagList(
        typeof tags === 'object' && tags !== null ? Object.values(tags) : []
      );
      setError(null);
      setNewTagName('');
    }
  }, [tags, isOpen]);

  const colorOptions = [
    { nome: 'Azul', value: '#3B82F6' },
    { nome: 'Verde', value: '#10B981' },
    { nome: 'Vermelho', value: '#EF4444' },
    { nome: 'Amarelo', value: '#F59E0B' },
    { nome: 'Roxo', value: '#8B5CF6' },
    { nome: 'Rosa', value: '#EC4899' },
  ];

  if (!isOpen) return null;

  const handleAddTag = async () => {
    if (newTagName.trim()) {
      setLoading(true);
      setError(null);
      try {
        await onCreateTag({ nome: newTagName.trim(), color: newTagColor });
        setNewTagName('');
      } catch (err: any) {
        setError(`Falha: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setLoading(true);
    setError(null);
    try {
      await onDeleteTag(tagId);
    } catch (err: any) {
      setError(`Falha: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Gerir Etiquetas</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        )}

        <div className="mb-4 flex-1 overflow-y-auto pr-2">
          <h4 className="font-semibold mb-2">
            Etiquetas ({tagList.length})
          </h4>
          <div className="space-y-2">
            {tagList.length > 0 ? (
              tagList.map(tag => (
                <div
                  key={tag.id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                >
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: tag.color || '#6B7280',
                      color: 'white',
                    }}
                  >
                    {tag.nome}
                  </span>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded hover:bg-red-100"
                    aria-label={`Apagar ${tag.nome}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhuma etiqueta.
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Nova Etiqueta</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nome"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={loading}
            />
            <select
              value={newTagColor}
              onChange={e => setNewTagColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[100px]"
              disabled={loading}
            >
              {colorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.nome}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTag}
              disabled={!newTagName.trim() || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold whitespace-nowrap disabled:opacity-50 flex items-center justify-center w-28"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold disabled:opacity-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskBoardPageProps {
  initialBoard: TaskBoard;
}

// --- COMPONENTE PRINCIPAL ---
const TaskBoardPage: React.FC<TaskBoardPageProps> = ({ initialBoard }) => {
  const { user: loggedInUser } = useAuth();
  const [board, setBoard] = useState<TaskBoard>(initialBoard);
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // dnd sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tagsArray, tasksArrayFromApi, usersArray] = await Promise.all([
          apiGetTags(),
          apiGetTasks(),
          apiGetUsers(),
        ]);

        const tagsObject = transformTagsArrayToObject(tagsArray);
        setTags(tagsObject);
        setUsers(usersArray);

        const columnOrder = Object.keys(initialBoard.columns);

        const tasksById = tasksArrayFromApi.reduce((acc, task) => {
          acc[task.id] = task;
          return acc;
        }, {} as Record<string, Task>);

        const initialColumns = { ...initialBoard.columns };
        columnOrder.forEach(colId => {
          if (initialColumns[colId]) {
            initialColumns[colId] = {
              ...initialColumns[colId],
              taskIds: [],
            };
          }
        });

        tasksArrayFromApi.forEach(task => {
          const taskStatus = task.status?.toLowerCase();
          const targetColId = columnOrder.find(
            colId =>
              initialColumns[colId]?.title.toLowerCase() === taskStatus
          );
          const destinationColId = targetColId || columnOrder[0];
          if (initialColumns[destinationColId]) {
            initialColumns[destinationColId].taskIds.push(task.id);
          } else {
            const firstValidColId = columnOrder.find(
              colId => initialColumns[colId]
            );
            if (firstValidColId) {
              initialColumns[firstValidColId].taskIds.push(task.id);
            }
          }
        });

        const newBoard: TaskBoard = {
          ...initialBoard,
          columnOrder,
          columns: initialColumns,
          tasks: tasksById,
          tags: tagsObject,
        };
        setBoard(newBoard);
      } catch (err: any) {
        setError(`Falha ao carregar dados: ${err.message}`);
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [initialBoard]);

  const handleTaskCreated = useCallback((newTask: Task, columnId: string | null) => {
    const taskToAdd = {
      ...newTask,
      coment: [],
    };
    setBoard(prev => {
      const targetCol = columnId || prev.columnOrder[0];
      if (!prev.columns[targetCol]) return prev;
      const newTasks = { ...prev.tasks, [taskToAdd.id]: taskToAdd };
      const newColumns = {
        ...prev.columns,
        [targetCol]: {
          ...prev.columns[targetCol],
          taskIds: [taskToAdd.id, ...prev.columns[targetCol].taskIds],
        },
      };
      return { ...prev, tasks: newTasks, columns: newColumns };
    });
  }, []);

  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    const taskWithComments: Task = {
      ...updatedTask,
      etiquetas: Array.isArray(updatedTask.etiquetas)
        ? updatedTask.etiquetas
        : [],
      etiquetaIds: Array.isArray(updatedTask.etiquetaIds)
        ? updatedTask.etiquetaIds
        : [],
      users: Array.isArray(updatedTask.users) ? updatedTask.users : [],
      userIds: Array.isArray(updatedTask.userIds) ? updatedTask.userIds : [],
      coment: Array.isArray(updatedTask.coment) ? updatedTask.coment : [],
    };

    setBoard(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [taskWithComments.id]: taskWithComments },
    }));
  }, []);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setBoard(prev => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];
      const newColumns = { ...prev.columns };
      Object.keys(newColumns).forEach(colId => {
        if (newColumns[colId]?.taskIds) {
          newColumns[colId].taskIds = newColumns[colId].taskIds.filter(
            id => id !== taskId
          );
        }
      });
      return { ...prev, tasks: newTasks, columns: newColumns };
    });
  }, []);

  const handleCreateTag = async (newTagData: NewTagData) => {
    try {
      const newTag = await apiCreateTag(newTagData);
      setTags(prev => ({ ...prev, [newTag.id]: newTag }));
      setBoard(prev => ({
        ...prev,
        tags: { ...prev.tags, [newTag.id]: newTag },
      }));
    } catch (err: any) {
      setError(`Falha: ${err.message}`);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await apiDeleteTag(tagId);
      setTags(prev => {
        const d = { ...prev };
        delete d[tagId];
        return d;
      });

      setBoard(prevBoard => {
        const newTasks = { ...prevBoard.tasks };
        Object.keys(newTasks).forEach(taskId => {
          const task = newTasks[taskId];
          if (task.etiquetaIds && task.etiquetaIds.includes(tagId)) {
            newTasks[taskId] = {
              ...task,
              etiquetaIds: task.etiquetaIds.filter(id => id !== tagId),
              etiquetas: task.etiquetas.filter(et => et.id !== tagId),
            };
          }
        });
        const newBoardTags = { ...prevBoard.tags };
        delete newBoardTags[tagId];
        return { ...prevBoard, tasks: newTasks, tags: newBoardTags };
      });
    } catch (err: any) {
      setError(`Falha: ${err.message}`);
    }
  };

  const handleOpenNewTaskModal = (columnId: string) => {
    setTargetColumn(columnId);
    setIsNewTaskModalOpen(true);
  };

  const handleOpenDetailModal = (task: Task) => {
    const currentTaskState = board.tasks[task.id] || task;
    setSelectedTask({ ...currentTaskState, coment: [] });
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsNewTaskModalOpen(false);
    setIsDetailModalOpen(false);
    setIsManageTagsModalOpen(false);
    setSelectedTask(null);
  };

  const findContainer = (id: string) => {
    if (!board) return null;
    if (id in board.columns) return id;
    return board.columnOrder.find(colId =>
      board.columns[colId].taskIds.includes(id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (board) {
      setActiveTask(board.tasks[active.id as string] || null);
    }
    document.body.classList.add('dragging');
  };

  // --- NOVO handleDropOnBackend baseado no código que funciona ---
  const handleDropOnBackend = useCallback(
    async (taskToMove: Task, targetColumnId: string, previousBoard: TaskBoard) => {
      const taskId = taskToMove.id;

      try {
        const targetColumn = previousBoard.columns[targetColumnId];
        const newStatus = targetColumn?.title?.toLowerCase();
        if (!newStatus) {
          throw new Error('Coluna de destino ou título não encontrado.');
        }

        const updatedTaskFromApi = await axios.patch(`${API_TASKS_URL}/${taskId}`, {
          status: newStatus,
          userId: taskToMove.userIds || [],
          etiquetaId: taskToMove.etiquetaIds || [],
        });

        const taskFromPatch = updatedTaskFromApi.data;

        const etiquetas: Tag[] = Array.isArray(taskFromPatch.etiquetas)
          ? taskFromPatch.etiquetas
          : Array.isArray(taskFromPatch.etiqueta)
          ? taskFromPatch.etiqueta
          : [];
        const users: any[] = Array.isArray(taskFromPatch.users)
          ? taskFromPatch.users
          : Array.isArray(taskFromPatch.user)
          ? taskFromPatch.user
          : [];

        setBoard(prev => {
          if (!prev) return prev;
          const currentComments = previousBoard.tasks[taskId]?.coment || [];
          const finalDroppedTask: Task = {
            ...taskFromPatch,
            users,
            userIds: users.map((u: any) => u.id),
            etiquetas,
            etiquetaIds: etiquetas.map((t: Tag) => t.id),
            coment: currentComments,
          };

          return {
            ...prev,
            tasks: { ...prev.tasks, [taskId]: finalDroppedTask },
          };
        });
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message
          : err?.message;
        setError(`Falha ao mover: ${errorMsg}. Revertendo.`);
        setBoard(previousBoard);
      }
    },
    [],
  );

  // --- NOVO handleDragEnd com a mesma lógica do OperationalTasksPage ---
  const handleDragEnd = (event: DragEndEvent) => {
    document.body.classList.remove('dragging');
    setActiveTask(null);

    const { active, over } = event;
    if (!over || !board) return;

    const taskId = String(active.id);
    const overId = String(over.id);
    const taskToMove = board.tasks[taskId];
    if (!taskToMove) return;

    const startColumnId = findContainer(taskId);
    let targetColumnId = findContainer(overId);

    if (!startColumnId || !targetColumnId) return;

    // Se o "over" for um card (task), ajusta para a coluna desse card
    if (board.tasks[targetColumnId]) {
      targetColumnId = findContainer(targetColumnId) as string;
    }
    if (!targetColumnId) return;

    // Mudando de coluna (status)
    if (startColumnId !== targetColumnId) {
      const previousBoard = board;

      setBoard(prev => {
        if (!prev) return prev;
        const sourceCol = prev.columns[startColumnId];
        const targetCol = prev.columns[targetColumnId];
        if (!sourceCol || !targetCol) return prev;

        const sourceTaskIds = sourceCol.taskIds.filter(id => id !== taskId);

        let targetIndex = targetCol.taskIds.length;

        if (board.tasks[overId]) {
          const overTaskIndex = targetCol.taskIds.indexOf(overId);
          if (overTaskIndex !== -1) {
            targetIndex = overTaskIndex;
          }
        }

        const targetTaskIds = [...targetCol.taskIds];
        targetTaskIds.splice(targetIndex, 0, taskId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [startColumnId]: { ...sourceCol, taskIds: sourceTaskIds },
            [targetColumnId]: { ...targetCol, taskIds: targetTaskIds },
          },
        };
      });

      handleDropOnBackend(taskToMove, targetColumnId, previousBoard);
    } else {
      // Reordenar dentro da mesma coluna
      const targetIndex = board.columns[startColumnId].taskIds.indexOf(overId);
      const sourceIndex = board.columns[startColumnId].taskIds.indexOf(taskId);

      if (
        targetIndex !== -1 &&
        sourceIndex !== -1 &&
        targetIndex !== sourceIndex
      ) {
        setBoard(prev => {
          if (!prev) return prev;
          const newTaskIds = arrayMove(
            prev.columns[startColumnId].taskIds,
            sourceIndex,
            targetIndex
          );
          return {
            ...prev,
            columns: {
              ...prev.columns,
              [startColumnId]: {
                ...prev.columns[startColumnId],
                taskIds: newTaskIds,
              },
            },
          };
        });
      }
    }
  };

  if (loading && isInitialLoad.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (!board?.columnOrder?.length) {
    return (
      <div className="p-6 text-center text-red-600">
        Erro: Configuração inválida.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto p-4 md:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-200 rounded"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Modais */}
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseModals}
          users={users}
          allTags={tags}
          onTaskCreated={handleTaskCreated}
          targetColumn={targetColumn || board.columnOrder[0]}
        />

        {selectedTask && (
          <TaskDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseModals}
            task={board.tasks[selectedTask.id] || selectedTask}
            users={users}
            allTags={tags}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            loggedInUser={loggedInUser}
          />
        )}

        <ManageTagsModal
          isOpen={isManageTagsModalOpen}
          onClose={() => setIsManageTagsModalOpen(false)}
          tags={tags}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
        />

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsManageTagsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <Settings size={16} /> Etiquetas ({Object.keys(tags).length})
            </button>
            <button
              onClick={() => handleOpenNewTaskModal(board.columnOrder[0])}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"
            >
              <PlusCircle size={16} /> Nova Tarefa
            </button>
          </div>
        </div>

        {/* Quadro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {board.columnOrder.map(columnId => {
            const column = board.columns[columnId];
            if (!column) return null;

            const columnTasks = (Array.isArray(column.taskIds)
              ? column.taskIds
              : []
            )
              .map(id => board.tasks[id])
              .filter(task => !!task);

            return (
              <div
                key={column.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 min-h-[300px] flex flex-col shadow-sm border"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700 text-lg capitalize">
                    {column.title}{' '}
                    <span className="text-sm text-gray-500">
                      ({columnTasks.length})
                    </span>
                  </h3>
                  <button
                    onClick={() => handleOpenNewTaskModal(column.id)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                    aria-label={`Add to ${column.title}`}
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>

                <DroppableColumn column={column}>
                  <SortableContext
                    items={column.taskIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 flex-grow overflow-y-auto pr-1 min-h-[100px]">
                      {columnTasks.length > 0 ? (
                        columnTasks.map(task => (
                          <SortableTaskItem
                            key={task.id}
                            task={task as Task}
                            onClick={handleOpenDetailModal}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center mt-4">
                          Vazio.
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            style={{
              borderTop: `4px solid ${
                activeTask.etiquetas?.[0]?.color || 'transparent'
              }`,
            }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// --- Coluna droppable ---
const DroppableColumn = ({
  column,
  children,
}: {
  column: TaskBoard['columns'][string];
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-grow rounded-md transition-colors ${
        isOver ? 'bg-indigo-100' : 'bg-transparent'
      }`}
    >
      {children}
    </div>
  );
};

// --- Item sortável ---
const SortableTaskItem = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const firstTagColor = task.etiquetas?.[0]?.color || 'transparent';

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderTop: `4px solid ${firstTagColor}`,
  };

  return (
    <TaskCard
      task={task}
      innerRef={setNodeRef}
      style={style}
      onClick={() => onClick(task)}
      {...attributes}
      {...listeners}
    />
  );
};

export default TaskBoardPage;
