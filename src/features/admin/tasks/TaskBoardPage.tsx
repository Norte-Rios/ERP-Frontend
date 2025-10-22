
import { useAuth} from "../../../auth/AuthContext"
const styles = `
  .tag-3b82f6 { background-color: #3B82F6 !important; color: white !important; }
  .tag-10b981 { background-color: #10B981 !important; color: white !important; }
  .tag-ef4444 { background-color: #EF4444 !important; color: white !important; }
  .tag-f59e0b { background-color: #F59E0B !important; color: white !important; }
  .tag-8b5cf6 { background-color: #8B5CF6 !important; color: white !important; }
  .tag-ec4899 { background-color: #EC4899 !important; color: white !important; }
`;


if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TaskBoard, Task, Comment, Tag } from './types';
import { 
  PlusCircle, User, Calendar, X, Edit, Trash2, MessageSquare, Settings, 
  AlertCircle, Loader2 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_TASKS_URL = `${API_BASE_URL}/tasks`;
const API_ETIQUETAS_URL = `${API_BASE_URL}/etiquetas`;
const API_USERS_URL = `${API_BASE_URL}/users`;
const API_COMMENT_URL = `${API_BASE_URL}/comments`

type NewTagData = { nome: string; color: string; };

// APIs
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

const apiCreateTask = async (taskData: any): Promise<Task> => {
  const cleanTaskData = { ...taskData };
  if (cleanTaskData.userId === null || cleanTaskData.userId === '') {
    delete cleanTaskData.userId;
  }
  
  const response = await fetch(API_TASKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanTaskData),
  });
  
  if (!response.ok) throw new Error(`Falha POST Task: ${response.status}`);
  return response.json();
};

const apiGetTasks = async (): Promise<Task[]> => {
  const response = await fetch(API_TASKS_URL);
  if (!response.ok) throw new Error(`Falha GET Tasks: ${response.status}`);
  return response.json();
};

const apiUpdateTask = async (id: string, taskData: any): Promise<Task> => {
  const cleanTaskData = { ...taskData };
  if (cleanTaskData.userId === null || cleanTaskData.userId === '') {
    delete cleanTaskData.userId;
  }
  
  const response = await fetch(`${API_TASKS_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanTaskData),
  });
  
  if (!response.ok) throw new Error(`Falha PATCH Task: ${response.status}`);
  return response.json();
};

const apiDeleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_TASKS_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Falha DELETE Task: ${response.status}`);
};

const apiAddComment = async (taskId: string, commentText: string, userId: string): Promise<Task> => {
  // Renomeei 'author' para 'userId' para corresponder ao DTO
  
  const response = await fetch(`${API_COMMENT_URL}`, {
    method: 'POST', 
    headers: { 
      'Content-Type': 'application/json',
    },
    // O backend (CreateCommentDto) espera este formato:
    body: JSON.stringify({ 
      comment: commentText, // Nome correto da propriedade
      userId: userId,       // ID do usuário logado
      taskId: taskId        // ID da tarefa
    }),
  });

  if (!response.ok) throw new Error(`Falha ADD Comment: ${response.status}`);
  return response.json();
};

const transformTagsArrayToObject = (tags: Tag[]): Record<string, Tag> => {
  return tags.reduce((acc, tag) => { acc[tag.id] = tag; return acc; }, {});
};

// ✅ COMPONENTE ETIQUETAS
const TaskTags = ({ tagIds, tags }: { tagIds: string[]; tags: Record<string, Tag> }) => {
  if (!tagIds?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tagIds.map(id => {
        const tag = tags[id];
        if (!tag) return null;
        const colorClass = `tag-${tag.color.replace('#', '').toLowerCase()}`;
        return (
          <span key={id} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}>
            {tag.nome}
          </span>
        );
      })}
    </div>
  );
};

const TaskCard = ({ task, onDragStart, onClick, tags }: any) => (
  <div 
    draggable 
    onDragStart={(e) => onDragStart(e, task.id)} 
    onClick={() => onClick(task)}
    className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-400 cursor-pointer transition-all"
  >
    <h4 className="font-semibold text-sm text-gray-800 mb-2">{task.titulo}</h4>
    <TaskTags tagIds={task.etiqueta ? [task.etiqueta.id] : []} tags={tags} />
    <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
      <div className="flex items-center gap-2">
        {task.data && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(task.data).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        {task.coment && (
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{Array.isArray(task.coment) ? task.coment.length : 1}</span>
          </div>
        )}
      </div>
      {task.user?.nome ? (
        <div className="flex items-center gap-1" title={task.user.nome}>
          <User size={14} />
          <span className="font-medium">{task.user.nome.split(' ')[0]}</span>
        </div>
      ) : (
        <span className="text-gray-400">Não atribuída</span>
      )}
    </div>
  </div>
);

// ✅ MODAL NOVA TASK
const NewTaskModal = ({ isOpen, onClose, users, allTags, onTaskCreated, targetColumn }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle(''); setDescription(''); setAssigneeId(''); setDueDate(''); 
    setSelectedTagId(null); setError('');
  };

  if (!isOpen) return null;

  const handleTagClick = (tagId: string) => {
    setSelectedTagId(tagId === selectedTagId ? null : tagId);
  };

  const handleSave = async () => {
    if (!title.trim()) { 
      setError("O título é obrigatório."); 
      return; 
    }

    setLoading(true);
    setError('');
    
    try {
      const taskData = {
        titulo: title.trim(),
        userId: assigneeId || null,
        etiquetaId: selectedTagId,
        description: description.trim() || null,
        data: dueDate || null
      };

      const newTask = await apiCreateTask(taskData);
      onTaskCreated(newTask, targetColumn);
      resetForm();
      onClose();
    } catch (error: any) {
      setError(`Falha ao criar tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Nova Tarefa</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Título da tarefa" 
            value={title} 
            onChange={e => { setTitle(e.target.value); setError(''); }} 
            className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`} 
            disabled={loading}
          />
          <textarea 
            placeholder="Descrição (opcional)" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            rows={3}
            disabled={loading}
          />
          <select 
            value={assigneeId} 
            onChange={e => setAssigneeId(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">👥 Não atribuir a ninguém</option>
            {users.map((user: any) => (
              <option key={user.id} value={user.id}>👤 {user.nome}</option>
            ))}
          </select>
          <input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            disabled={loading}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(allTags || {}).map((tag: Tag) => (
                <button 
                  key={tag.id} 
                  onClick={() => handleTagClick(tag.id)} 
                  disabled={loading}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                    selectedTagId === tag.id
                      ? `tag-${tag.color.replace('#', '').toLowerCase()} ring-2 ring-offset-1 ring-white shadow-lg`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ MODAL DETALHES TASK
const TaskDetailModal = ({ isOpen, onClose, task, users, allTags, onTaskUpdated, onTaskDeleted, loggedInUser}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editData, setEditData] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) { 
      setEditData(task); 
      setIsEditing(false); 
      setIsConfirmingDelete(false); 
    }
  }, [task]);

  if (!isOpen || !task || !editData) return null;

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const updateData = {
        titulo: editData.titulo,
        userId: editData.userId || null,
        etiquetaId: editData.etiquetaId || null,
        description: editData.description || null,
        data: editData.data || null
      };
      
      const updatedTask = await apiUpdateTask(task.id, updateData);
      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (error: any) {
      setError(`Falha ao atualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async () => {
    setLoading(true);
    try {
      await apiDeleteTask(task.id);
      onTaskDeleted(task.id);  // 👈 ADICIONE ESTA LINHA
      onClose();
    } catch (error: any) {
      setError(`Falha ao deletar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
const handleAddComment = async () => {
    if (newComment.trim() && loggedInUser?.id) { // Verifique se o ID do user logado existe
        setLoading(true);
        try {
            // Passe o ID do utilizador LOGADO, não o 'author'
            const updatedTask = await apiAddComment(
                task.id, 
                newComment.trim(), 
                loggedInUser.id  // <--- ESTA É A CORREÇÃO
            );
            setNewComment('');
            onTaskUpdated(updatedTask);
        } catch (error: any) {
            setError(`Falha ao adicionar comentário: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'userId') {
      const selectedUser = users.find((u: any) => u.id === value);
      setEditData({ 
        ...editData, 
        user: selectedUser ? { id: selectedUser.id, nome: selectedUser.nome } : null, 
        userId: value || null 
      });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleTagClick = (tagId: string) => {
    setEditData(prev => ({ ...prev, etiquetaId: prev.etiquetaId === tagId ? null : tagId }));
  };

  const handleCloseModal = () => { 
    setIsEditing(false); 
    setIsConfirmingDelete(false); 
    setError('');
    onClose(); 
  };

  const renderContent = () => {
    if (isConfirmingDelete) return (
      <>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Exclusão</h3>
        <p>Tem a certeza de que deseja apagar a tarefa "{task.titulo}"?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Apagar'}
          </button>
        </div>
      </>
    );

    if (isEditing) return (
      <>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Tarefa</h3>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
        <div className="space-y-4">
          <input name="titulo" type="text" value={editData.titulo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
          <textarea name="description" value={editData.description || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} disabled={loading} />
          <select name="userId" value={editData.userId || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading}>
            <option value="">👥 Não atribuir a ninguém</option>
            {users.map((user: any) => <option key={user.id} value={user.id}>👤 {user.nome}</option>)}
          </select>
          <input name="data" type="date" value={editData.data || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(allTags || {}).map((tag: Tag) => (
                <button 
                  key={tag.id} 
                  onClick={() => handleTagClick(tag.id)} 
                  disabled={loading}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                    editData.etiquetaId === tag.id
                      ? `tag-${tag.color.replace('#', '').toLowerCase()} ring-2 ring-offset-1 ring-white shadow-lg`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button onClick={() => setIsEditing(false)} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
            Salvar
          </button>
        </div>
      </>
    );

    return (
      <>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{task.titulo}</h3>
          <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 max-h-[60vh]">
          <TaskTags tagIds={task.etiqueta ? [task.etiqueta.id] : []} tags={allTags} />
          {task.description && <p className="text-gray-600 mb-4 whitespace-pre-wrap">{task.description}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <div><strong className="block text-gray-500">Responsável:</strong> {task.user?.nome || 'Não atribuída'}</div>
            <div><strong className="block text-gray-500">Data:</strong> {task.data ? new Date(task.data).toLocaleDateString('pt-BR') : 'Não definida'}</div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Comentários</h4>
            <div className="space-y-4 mb-4 max-h-40 overflow-y-auto">
              {(Array.isArray(task.coment) ? task.coment : []).map((comment: Comment, index: number) => (
                <div key={`${task.id}-comment-${index}`} className="flex items-start gap-3">
                  <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{comment.author} <span className="text-xs text-gray-400">{new Date(comment.date).toLocaleString('pt-BR')}</span></p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} 
                placeholder="Adicionar comentário..." 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                disabled={loading}
              />
              <button onClick={handleAddComment} disabled={loading || !newComment.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                Comentar
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button onClick={() => setIsConfirmingDelete(true)} className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-2">
            <Trash2 size={16} /> Apagar
          </button>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2">
            <Edit size={16} /> Editar
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

// ✅ MODAL GERIR ETIQUETAS - CORRIGIDO!
const ManageTagsModal = ({ isOpen, onClose, tags, onCreateTag, onDeleteTag }: any) => {
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTagList(Object.values(tags));
  }, [tags]);

  const colorOptions = [
    { nome: 'Azul', value: '#3B82F6' }, { nome: 'Verde', value: '#10B981' }, 
    { nome: 'Vermelho', value: '#EF4444' }, { nome: 'Amarelo', value: '#F59E0B' }, 
    { nome: 'Roxo', value: '#8B5CF6' }, { nome: 'Rosa', value: '#EC4899' }
  ];

  if (!isOpen) return null;

  const handleAddTag = async () => {
    if (newTagName.trim()) {
      setLoading(true); setError(null);
      try {
        await onCreateTag({ nome: newTagName.trim(), color: newTagColor });
        setNewTagName('');
      } catch (error: any) {
        setError(`Falha POST: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Tem certeza?')) return;
    setLoading(true); 
    setError(null);
    try {
      await onDeleteTag(tagId);
    } catch (error: any) {
      console.error("Erro ao apagar etiqueta:", error);
      setError(`Falha ao apagar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Gerir Etiquetas</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

        {loading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}

        <div className="mb-4 flex-1 overflow-y-auto">
          <h4 className="font-semibold mb-2">Etiquetas ({tagList.length})</h4>
          <div className="space-y-2">
            {tagList.map(tag => (
              <div key={tag.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className={`px-2 py-0.5 text-sm font-semibold rounded-full tag-${tag.color.replace('#', '').toLowerCase()}`}>
                  {tag.nome}
                </span>
                <button onClick={() => handleDeleteTag(tag.id)} disabled={loading} className="text-red-500 hover:text-red-700 disabled:opacity-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Nova Etiqueta</h4>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Nome da etiqueta" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[200px]" disabled={loading} />
            <select value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[100px]" disabled={loading}>
              {colorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.nome}</option>)}
            </select>
            <button onClick={handleAddTag} disabled={!newTagName.trim() || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold whitespace-nowrap disabled:opacity-50">
              Adicionar
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold disabled:opacity-50">
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

const TaskBoardPage: React.FC<TaskBoardPageProps> = ({ initialBoard }) => {
  const { user: loggedInUser } = useAuth();
  const [board, setBoard] = useState<TaskBoard>(initialBoard);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const distributeTasksSimply = useCallback((tasksArray: Task[], columnOrder: string[]) => {
    const firstColumnId = columnOrder[0];
    return tasksArray.map(task => task.id);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!isInitialLoad.current) return;
      isInitialLoad.current = false;
      
      setLoading(true);
      setError(null);
      
      try {
        const [tagsArray, tasksArray, usersArray] = await Promise.all([
          apiGetTags(),
          apiGetTasks(),
          apiGetUsers()
        ]);

        const tagsObject = transformTagsArrayToObject(tagsArray);
        setTags(tagsObject);
        setTasks(tasksArray);
        setUsers(usersArray);

        const columnOrder = Object.keys(initialBoard.columns);
        const firstColumnId = columnOrder[0];
        
        const newBoard = {
          ...initialBoard,
          columnOrder,
          columns: {
            ...initialBoard.columns,
            [firstColumnId]: {
              ...initialBoard.columns[firstColumnId],
              taskIds: distributeTasksSimply(tasksArray, columnOrder)
            }
          },
          tasks: tasksArray.reduce((acc, task) => ({ ...acc, [task.id]: task }), {}),
          tags: tagsObject
        };

        setBoard(newBoard);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [initialBoard]);

  const handleTaskCreated = useCallback((newTask: Task, columnId: string) => {
    setTasks(prev => [...prev, newTask]);
    
    setBoard(prev => {
      const newBoard = {
        ...prev,
        tasks: { ...prev.tasks, [newTask.id]: newTask },
        columns: {
          ...prev.columns,
          [columnId]: {
            ...prev.columns[columnId],
            taskIds: [newTask.id, ...prev.columns[columnId].taskIds]
          }
        }
      };
      return newBoard;
    });
  }, []);

  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setBoard(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [updatedTask.id]: updatedTask }
    }));
  }, []);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setBoard(prev => {
      const newBoard = { ...prev };
      delete newBoard.tasks[taskId];
      
      Object.keys(newBoard.columns).forEach(colId => {
        newBoard.columns[colId].taskIds = newBoard.columns[colId].taskIds.filter(id => id !== taskId);
      });
      
      return newBoard;
    });
  }, []);

  const handleCreateTag = async (newTagData: NewTagData) => {
    const newTag = await apiCreateTag(newTagData);
    setTags(prev => ({ ...prev, [newTag.id]: newTag }));
    setBoard(prev => ({ ...prev, tags: { ...prev.tags, [newTag.id]: newTag } }));
  };

  const handleDeleteTag = async (tagId: string) => {
    await apiDeleteTag(tagId);
    setTags(prev => {
      const newTags = { ...prev };
      delete newTags[tagId];
      return newTags;
    });
    setBoard(prev => {
      const newTags = { ...prev.tags };
      delete newTags[tagId];
      return { ...prev, tags: newTags };
    });
  };

  const handleOpenNewTaskModal = (columnId: string) => {
    setTargetColumn(columnId);
    setIsNewTaskModalOpen(true);
  };

  const handleOpenDetailModal = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsNewTaskModalOpen(false);
    setIsDetailModalOpen(false);
    setIsManageTagsModalOpen(false);
    setSelectedTask(null);
    setError(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => e.dataTransfer.setData('taskId', taskId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (!tasks.find(t => t.id === taskId)) return;

    setBoard(prev => {
      const sourceColumnId = Object.keys(prev.columns).find(id => 
        prev.columns[id].taskIds.includes(taskId)
      );
      
      if (!sourceColumnId || sourceColumnId === columnId) return prev;

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColumnId]: {
            ...prev.columns[sourceColumnId],
            taskIds: prev.columns[sourceColumnId].taskIds.filter(id => id !== taskId)
          },
          [columnId]: {
            ...prev.columns[columnId],
            taskIds: [taskId, ...prev.columns[columnId].taskIds.filter(id => id !== taskId)]
          }
        }
      };
    });
  }, [tasks]);

  if (loading) return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <p>Carregando quadro...</p>
      </div>
    </div>
  );

  if (!board?.columnOrder) return <div>A carregar quadro...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle size={20} /> {error}
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-200 rounded"><X size={16} /></button>
        </div>
      )}

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseModals}
        users={users}
        allTags={tags}
        onTaskCreated={handleTaskCreated}
        targetColumn={targetColumn || board.columnOrder[0]}
      />
      
           
       <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModals}
          task={selectedTask}
          users={users}
          allTags={tags}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          loggedInUser={loggedInUser} // <-- ADICIONE ESTA LINHA
          />
      
      <ManageTagsModal
        isOpen={isManageTagsModalOpen}
        onClose={() => setIsManageTagsModalOpen(false)}
        tags={tags}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas da Equipa</h1>
        <div className="flex gap-3">
          <button onClick={() => setIsManageTagsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
            <Settings size={16} /> Etiquetas ({Object.keys(tags).length})
          </button>
          <button onClick={() => handleOpenNewTaskModal(board.columnOrder[0])}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
            <PlusCircle size={16} /> Nova Tarefa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {board.columnOrder.map((columnId) => {
          const column = board.columns[columnId];
          const columnTasks = column.taskIds
            .map(id => board.tasks[id])
            .filter(Boolean);
          
          return (
            <div 
              key={column.id} 
              onDrop={(e) => handleDrop(e, column.id)} 
              onDragOver={handleDragOver}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 min-h-[300px] flex flex-col shadow-sm border"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-lg">
                  {column.title} <span className="text-sm text-gray-500">({columnTasks.length})</span>
                </h3>
                <button onClick={() => handleOpenNewTaskModal(column.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                  <PlusCircle size={20} />
                </button>
              </div>
              <div className="space-y-3 flex-grow">
                {columnTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onDragStart={handleDragStart} 
                    onClick={handleOpenDetailModal} 
                    tags={tags} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoardPage;