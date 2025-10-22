// ATUALIZADO: Usando caminho relativo novamente e adicionando extensão .tsx.
// VERIFIQUE se esta é a localização correta:
// TaskBoardPage.tsx está em 'src/features/admin/tasks/'
// AuthContext.tsx estaria em 'src/auth/AuthContext.tsx'
import { useAuth } from "../../../auth/AuthContext.tsx"; 
const styles = `
 /* Estilos das Etiquetas Coloridas - Adicionado display e padding/radius */
 .tag-3b82f6 { background-color: #3B82F6 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
 .tag-10b981 { background-color: #10B981 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
 .tag-ef4444 { background-color: #EF4444 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
 .tag-f59e0b { background-color: #F59E0B !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
 .tag-8b5cf6 { background-color: #8B5CF6 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
 .tag-ec4899 { background-color: #EC4899 !important; color: white !important; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
`;

// Injeção de Estilos
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Certifique-se que os tipos em './types' estão corretos
import { TaskBoard, Task, Comment as FrontendComment, Tag } from './types';
import {
 PlusCircle, User, Calendar, X, Edit, Trash2, MessageSquare, Settings,
 AlertCircle, Loader2
} from 'lucide-react';

// ATENÇÃO: import.meta.env só funciona com Vite.
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_TASKS_URL = `${API_BASE_URL}/tasks`;
const API_ETIQUETAS_URL = `${API_BASE_URL}/etiquetas`;
const API_USERS_URL = `${API_BASE_URL}/users`;
const API_COMMENT_URL = `${API_BASE_URL}/comments`

type NewTagData = { nome: string; color: string; };

// Tipo do comentário como vem do Backend (para clareza)
export interface BackendComment {
 id: string;
 comment: string;
 user: { id: string; nome: string; };
 tasks?: { id: string; }; // Pode não vir sempre
 createdAt: string;
}


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
 if (!cleanTaskData.userId) delete cleanTaskData.userId;
 cleanTaskData.status = "a fazer"; // Garante status inicial

 const response = await fetch(API_TASKS_URL, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(cleanTaskData),
 });

 if (!response.ok) {
     const errorBody = await response.text();
     console.error("Erro ao criar task:", errorBody);
     throw new Error(`Falha POST Task: ${response.status} - ${errorBody}`);
 }
 const newTask = await response.json();
 // Garante que a nova task tem 'coment' como array vazio e etiquetaId
 return {
    ...newTask,
    etiquetaId: newTask.etiqueta?.id || newTask.etiquetaId || null,
    coment: [] // Nova task começa sem comentários
 };
};

// --- FUNÇÃO CRÍTICA PARA COMENTÁRIOS E ETIQUETAS ---
const apiGetTasks = async (): Promise<Task[]> => {
 // console.log("Buscando tasks...");
 const response = await fetch(API_TASKS_URL);
 if (!response.ok) throw new Error(`Falha GET Tasks: ${response.status}`);
 const tasksFromApi: any[] = await response.json();
 // console.log("Tasks recebidas da API (antes do map):", JSON.stringify(tasksFromApi, null, 2));

 // Mapeia a resposta para o formato Task do frontend
 return tasksFromApi.map((task: any): Task => { // Tipagem explícita do retorno
    // 1. Processa Comentários - REMOVIDO DAQUI
    // const backendComments: BackendComment[] = Array.isArray(task.comments) ? task.comments : [];
    // const frontendComments: FrontendComment[] = backendComments.map(...).filter(...);

    // 2. Processa Etiqueta
    const etiquetaId = task.etiqueta?.id || task.etiquetaId || null;

    // 3. Monta o objeto Task final (SEM COMENTÁRIOS INICIAIS)
    const frontendTask: Task = {
      ...task,
      etiquetaId: etiquetaId,
      coment: [] // Inicializa SEMPRE como array vazio
    };

    // Remove propriedades originais que podem causar conflito ou redundância
    delete (frontendTask as any).comments;
    delete (frontendTask as any).comment;
    delete (frontendTask as any).etiqueta; // Remove o objeto etiqueta, usamos só o ID

    return frontendTask;
  });
};
// --- FIM DA FUNÇÃO CRÍTICA ---


const apiUpdateTask = async (id: string, taskData: any): Promise<Task> => {
 const cleanTaskData = { ...taskData };
 if (!cleanTaskData.userId) delete cleanTaskData.userId;
 delete cleanTaskData.coment; // Não envia comentários

 const response = await fetch(`${API_TASKS_URL}/${id}`, {
   method: 'PATCH',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(cleanTaskData),
 });

 if (!response.ok) {
     const errorBody = await response.text();
     console.error(`Erro ao atualizar task ${id}:`, errorBody);
     throw new Error(`Falha PATCH Task: ${response.status} - ${errorBody}`);
 }
 const updatedTask = await response.json();
 // Garante 'coment' como array (vazio) e preserva etiquetaId
 return {
    ...updatedTask,
    etiquetaId: updatedTask.etiqueta?.id || updatedTask.etiquetaId || null,
    coment: [] // Assume que a API não retorna comentários aqui
 };
};

const apiDeleteTask = async (id: string): Promise<void> => {
 const response = await fetch(`${API_TASKS_URL}/${id}`, { method: 'DELETE' });
 if (!response.ok) throw new Error(`Falha DELETE Task: ${response.status}`);
};

// --- NOVA FUNÇÃO PARA BUSCAR COMENTÁRIOS ---
const apiGetCommentsByTask = async (taskId: string): Promise<BackendComment[]> => {
  console.log(`Buscando comentários para task ${taskId}...`);
  const response = await fetch(`${API_COMMENT_URL}/task/${taskId}`); // Usa a nova rota do controller
  if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erro ao buscar comentários para task ${taskId}:`, errorBody);
      throw new Error(`Falha GET Comments: ${response.status} - ${errorBody}`);
  }
  const comments = await response.json();
  console.log(`Comentários recebidos para task ${taskId}:`, comments);
  // Garante que retorna sempre um array
  return Array.isArray(comments) ? comments : [];
};
// --- FIM DA NOVA FUNÇÃO ---

const apiAddComment = async (taskId: string, commentText: string, userId: string): Promise<BackendComment> => {
 const response = await fetch(`${API_COMMENT_URL}`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ comment: commentText, userId: userId, taskId: taskId }),
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

// ✅ COMPONENTE ETIQUETAS
const TaskTags = ({ tagId, tags }: { tagId: string | null; tags: Record<string, Tag> }) => {
  if (!tagId || !tags || !tags[tagId]) return null;
  const tag = tags[tagId];
  if (!tag.color) return null;
  const cleanColor = tag.color.startsWith('#') ? tag.color.substring(1) : tag.color;
  const colorClass = `tag-${cleanColor.toLowerCase()}`;
  return (
    // Removido div extra, a classe é aplicada diretamente no span
    <span className={`${colorClass} mt-1 mb-1`}> {/* Aplica a classe e margens */}
      {tag.nome}
    </span>
  );
};


// ✅ TASK CARD ATUALIZADO
const TaskCard = ({ task, onDragStart, onDragEnd, onClick, tags }: { task: Task; onDragStart: Function; onDragEnd: Function; onClick: Function; tags: Record<string, Tag> }) => (
 <div
   draggable
   onDragStart={(e) => onDragStart(e, task.id)}
   onDragEnd={onDragEnd}
   onClick={() => onClick(task)}
   className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-150 ease-in-out"
 >
   <h4 className="font-semibold text-sm text-gray-800 mb-1">{task.titulo || "Tarefa sem título"}</h4>
   {/* Passa o ID da etiqueta e o objeto completo de tags */}
   <TaskTags tagId={task.etiquetaId} tags={tags} />
   <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
     <div className="flex items-center gap-2">
       {task.data && (
         <div className="flex items-center gap-1">
           <Calendar size={12} />
           {/* Adicionado timeZone UTC para consistência */}
           <span>{task.data ? new Date(task.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</span>
         </div>
       )}
       {/* Contagem de comentários removida, pois não vem mais com a task */}
     </div>
     {task.user?.nome ? (
       <div className="flex items-center gap-1" title={task.user.nome}>
         <User size={14} />
         <span className="font-medium">{task.user.nome.split(' ')[0]}</span>
       </div>
     ) : (
       <span className="text-gray-400 italic">N/A</span>
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

 const resetForm = useCallback(() => {
   setTitle(''); setDescription(''); setAssigneeId(''); setDueDate('');
   setSelectedTagId(null); setError('');
 }, []);

 useEffect(() => { if (isOpen) resetForm(); }, [isOpen, resetForm]);
 if (!isOpen) return null;

 const handleTagClick = (tagId: string) => setSelectedTagId(prev => prev === tagId ? null : tagId);

 const handleSave = async () => {
   if (!title.trim()) { setError("O título é obrigatório."); return; }
   setLoading(true); setError('');
   try {
     const taskData = {
       titulo: title.trim(), userId: assigneeId || null, etiquetaId: selectedTagId,
       description: description.trim() || null, data: dueDate || null, status: "a fazer"
     };
     const newTask = await apiCreateTask(taskData);
     onTaskCreated(newTask, targetColumn);
     onClose();
   } catch (error: any) { setError(`Falha: ${error.message}`); }
   finally { setLoading(false); }
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
       <h3 className="text-xl font-bold text-gray-800 mb-4">Nova Tarefa</h3>
       {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
       <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
         <input type="text" placeholder="Título" value={title} onChange={e => { setTitle(e.target.value); setError(''); }} className={`w-full px-3 py-2 border rounded-md ${error && !title.trim() ? 'border-red-500' : 'border-gray-300'}`} disabled={loading} />
         <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} disabled={loading} />
         <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading}>
           <option value="">👥 Não atribuir</option>
           {users.map((user: any) => <option key={user.id} value={user.id}>👤 {user.nome}</option>)}
         </select>
         <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta</label>
           <div className="flex flex-wrap gap-2">
             {Object.values(allTags || {}).map((tag: Tag) => <button key={tag.id} onClick={() => handleTagClick(tag.id)} disabled={loading} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedTagId === tag.id ? `tag-${tag.color.replace('#', '').toLowerCase()} ring-2 ring-offset-1 ring-white shadow-lg` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{tag.nome}</button>)}
           </div>
         </div>
       </div>
       <div className="mt-6 flex justify-end gap-3 border-t pt-4">
         <button onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
         <button onClick={handleSave} disabled={loading || !title.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="animate-spin h-4 w-4" /> : null} Salvar</button>
       </div>
     </div>
   </div>
 );
};

// --- MODAL DETALHES TASK ATUALIZADO ---
const TaskDetailModal = ({ isOpen, onClose, task, users, allTags, onTaskUpdated, onTaskDeleted, loggedInUser }: any) => {
 const [isEditing, setIsEditing] = useState(false);
 const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
 const [editData, setEditData] = useState<Task | null>(null); // Dados da task para edição/visualização
 const [newComment, setNewComment] = useState('');
 const [comments, setComments] = useState<FrontendComment[]>([]); // Estado SÓ para comentários
 const [loading, setLoading] = useState(false); // Loading geral (save task, delete task)
 const [commentLoading, setCommentLoading] = useState(false); // Loading para buscar/adicionar comentários
 const [error, setError] = useState('');

 // Efeito para carregar dados da task E buscar comentários da API
 useEffect(() => {
    const loadTaskAndComments = async () => {
      if (task && isOpen) {
        // Inicializa editData com a task passada (sem comentários inicialmente)
        setEditData({ ...task, coment: [] }); // Garante 'coment' vazio
        setIsEditing(false); setIsConfirmingDelete(false); setError(''); setNewComment('');
        setComments([]); // Limpa comentários antigos antes de buscar novos

        // Busca comentários específicos da task
        setCommentLoading(true);
        try {
          const fetchedComments = await apiGetCommentsByTask(task.id);
          // Mapeia para o formato FrontendComment e ordena
          const frontendComments = fetchedComments.map(beComment => ({
              id: beComment.id,
              text: beComment.comment,
              author: beComment.user?.nome || 'Desconhecido',
              date: beComment.createdAt
          })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setComments(frontendComments); // Define o estado 'comments' com os dados buscados
        } catch (err: any) {
          console.error("Erro ao buscar comentários:", err);
          setError("Falha ao carregar comentários.");
          setComments([]); // Define como vazio em caso de erro
        } finally {
          setCommentLoading(false);
        }

      } else if (!isOpen) {
        setEditData(null); setComments([]); // Limpa tudo ao fechar
      }
    };
    loadTaskAndComments();
 }, [task, isOpen]); // Roda quando a task ou o estado 'isOpen' mudam

 if (!isOpen || !editData) return null; // Não renderiza se não estiver pronto

 const handleSave = async () => {
   setLoading(true); setError('');
   try {
     const updateData = {
       titulo: editData.titulo, userId: editData.userId || null, etiquetaId: editData.etiquetaId || null,
       description: editData.description || null, data: editData.data || null, status: editData.status
     };
     const updatedTaskResult = await apiUpdateTask(editData.id, updateData);
     // Cria a task atualizada com os comentários do ESTADO LOCAL 'comments'
     const taskWithLocalComments = { ...updatedTaskResult, coment: comments };
     onTaskUpdated(taskWithLocalComments); // Propaga para o board
     setEditData(taskWithLocalComments); // Atualiza estado local do modal
     setIsEditing(false);
   } catch (error: any) { setError(`Falha: ${error.message}`); }
   finally { setLoading(false); }
 };

 const handleDelete = async () => {
   setLoading(true); setError('');
   try { await apiDeleteTask(editData.id); onTaskDeleted(editData.id); onClose(); }
   catch (error: any) { setError(`Falha: ${error.message}`); setLoading(false); }
 };

 const handleAddComment = async () => {
   if (newComment.trim() && loggedInUser?.id && editData?.id) {
     setCommentLoading(true); setError('');
     const optimisticId = `optimistic-${Date.now()}`;
     const optimisticComment: FrontendComment = { id: optimisticId, text: newComment.trim(), author: loggedInUser.nome, date: new Date().toISOString() };
     const previousComments = comments;

     try {
       setComments(prev => [optimisticComment, ...prev]); setNewComment(''); // Adição otimista

       const newBackendComment = await apiAddComment(editData.id, optimisticComment.text, loggedInUser.id);
       if (!newBackendComment?.id || !newBackendComment.comment || !newBackendComment.user || !newBackendComment.createdAt) throw new Error("Resposta inválida.");

       // Atualiza comentário otimista com dados reais
       const finalFrontendComment: FrontendComment = { id: newBackendComment.id, text: newBackendComment.comment, author: newBackendComment.user.nome, date: newBackendComment.createdAt };
       setComments(prev => prev.map(c => c.id === optimisticId ? finalFrontendComment : c));

       // Atualiza a task no board (onTaskUpdated) passando a lista de comentários ATUALIZADA
       // Usa uma função no setComments para garantir acesso ao estado mais recente
       setComments(currentComments => {
            const updatedTaskForBoard = { ...editData, coment: currentComments }; // Usa o estado 'comments' atualizado
            // Atualiza editData localmente para manter consistência interna do modal
            setEditData(updatedTaskForBoard);
            onTaskUpdated(updatedTaskForBoard); // Propaga para o board
            return currentComments; // Retorna o estado atualizado para setComments
       });


     } catch (error: any) {
       console.error("Erro comentário:", error); setError(`Falha ao adicionar comentário: ${error.message}`);
       setComments(previousComments); // Reverte para a lista anterior
       setNewComment(optimisticComment.text); // Devolve texto
     } finally {
       setCommentLoading(false); // Termina loading específico
     }
   } else if (!loggedInUser?.id) setError("Utilizador não logado.");
   else if (!editData?.id) setError("Erro: ID da tarefa.");
 };


 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setEditData(prev => {
      if (!prev) return null;
      if (name === 'userId') {
          const selectedUser = users.find((u: any) => u.id === value);
          return { ...prev, user: selectedUser ? { id: selectedUser.id, nome: selectedUser.nome } : null, userId: value || null };
      } else if (name === 'data') {
           // Garante formato YYYY-MM-DD para input e guarda como ISO string ou null
           const dateValue = value ? new Date(value).toISOString() : null;
           // Atualiza apenas a data, mantendo a hora se já existir (ou define como T00:00:00.000Z)
           const currentIsoDate = prev.data ? new Date(prev.data) : new Date(0);
           const newDate = value ? new Date(value) : null;
           if (newDate) {
               // Mantém a hora existente se houver, senão usa meia-noite UTC
               const hours = currentIsoDate.getUTCHours(); const minutes = currentIsoDate.getUTCMinutes(); const seconds = currentIsoDate.getUTCSeconds();
               newDate.setUTCHours(hours, minutes, seconds, 0);
               return { ...prev, data: newDate.toISOString() };
           } else { return { ...prev, data: null }; }
      } else {
          return { ...prev, [name]: value };
      }
  });
 };


 const handleTagClick = (tagId: string) => {
   setEditData(prev => prev ? ({ ...prev, etiquetaId: prev.etiquetaId === tagId ? null : tagId }) : null);
 };

 const handleCloseModal = () => onClose();

 const renderContent = () => {
   // ... (código de renderização para isConfirmingDelete e isEditing permanece igual) ...
   if (isConfirmingDelete) return (
     <>
       <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Exclusão</h3>
       <p>Tem a certeza que deseja apagar a tarefa "{editData.titulo}"?</p>
       {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
       <div className="mt-6 flex justify-end gap-3">
         <button onClick={() => setIsConfirmingDelete(false)} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
         <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center w-24">{loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Apagar'}</button>
       </div>
     </>
   );

   if (isEditing) return (
     <>
       <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Tarefa</h3>
       {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
       <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
         <input name="titulo" type="text" value={editData.titulo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
         <textarea name="description" value={editData.description || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} disabled={loading} />
         <select name="userId" value={editData.userId || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading}>
           <option value="">👥 Não atribuir</option>
           {users.map((user: any) => <option key={user.id} value={user.id}>👤 {user.nome}</option>)}
         </select>
         <input name="data" type="date" value={editData.data ? editData.data.split('T')[0] : ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta</label>
           <div className="flex flex-wrap gap-2">
             {Object.values(allTags || {}).map((tag: Tag) => <button key={tag.id} onClick={() => handleTagClick(tag.id)} disabled={loading} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${editData.etiquetaId === tag.id ? `tag-${tag.color.replace('#', '').toLowerCase()} ring-2 ring-offset-1 ring-white shadow-lg` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{tag.nome}</button>)}
           </div>
         </div>
       </div>
       <div className="mt-6 flex justify-end gap-3 border-t pt-4">
         <button onClick={() => setIsEditing(false)} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
         <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="animate-spin h-4 w-4" /> : null} Salvar</button>
       </div>
     </>
   );

   // Modo de visualização
   return (
     <>
       <div className="flex justify-between items-start mb-4">
         <h3 className="text-xl font-bold text-gray-800">{editData.titulo}</h3>
         <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
       </div>
       {/* Mostra erro geral apenas se não for erro de comentário */}
       {error && !commentLoading && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
       <div className="flex-grow overflow-y-auto pr-2 max-h-[calc(90vh-160px)]"> {/* Ajustado max-h */}
         <TaskTags tagId={editData.etiquetaId} tags={allTags} />
         {editData.description && <p className="text-gray-600 my-4 whitespace-pre-wrap">{editData.description}</p>}
         <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
           <div><strong className="block text-gray-500">Responsável:</strong> {editData.user?.nome || 'Não atribuída'}</div>
           <div><strong className="block text-gray-500">Data:</strong> {editData.data ? new Date(editData.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não definida'}</div>
         </div>
         <div className="border-t pt-4">
           <h4 className="font-semibold text-gray-700 mb-3">Comentários ({comments.length})</h4>
           {/* Mostra erro específico de comentários aqui */}
           {error && commentLoading && <div className="mb-2 p-2 text-sm bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}
           <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50"> {/* Estilo e scroll para comentários */}
             {commentLoading ? <div className="flex justify-center items-center py-4"><Loader2 className="animate-spin h-5 w-5 text-gray-400" /></div> // Usando commentLoading
               : comments.length === 0 ? <p className="text-sm text-gray-500 italic text-center py-2">Nenhum comentário.</p>
               : comments.map((comment: FrontendComment) => ( // Renderiza a partir do estado 'comments'
                   <div key={comment.id} className="flex items-start gap-3">
                     <div className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm text-gray-600 flex-shrink-0" title={comment.author}>{comment.author ? comment.author.charAt(0).toUpperCase() : '?'}</div>
                     <div className="flex-1 bg-white p-2 rounded shadow-sm border border-gray-200">
                       <p className="font-semibold text-sm text-gray-800">{comment.author || 'Desconhecido'} <span className="text-xs text-gray-400 font-normal ml-1">{comment.date ? new Date(comment.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : ''}</span></p>
                       <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.text}</p>
                     </div>
                   </div>
                  ))}
           </div>
           <div className="flex items-center gap-2 mt-2">
             <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && !commentLoading && handleAddComment()} placeholder="Adicionar comentário..." className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" disabled={commentLoading} />
             <button onClick={handleAddComment} disabled={commentLoading || !newComment.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center w-28 text-sm">
               {commentLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Comentar'}
             </button>
           </div>
         </div>
       </div>
       <div className="mt-auto flex justify-end gap-3 border-t pt-4"> {/* mt-auto para empurrar para baixo */}
         <button onClick={() => setIsConfirmingDelete(true)} disabled={loading} className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-2 disabled:opacity-50"><Trash2 size={16} /> Apagar</button>
         <button onClick={() => setIsEditing(true)} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2 disabled:opacity-50"><Edit size={16} /> Editar</button>
       </div>
     </>
   );
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
       {renderContent()}
     </div>
   </div>
 );
};

// ✅ MODAL GERIR ETIQUETAS
const ManageTagsModal = ({ isOpen, onClose, tags, onCreateTag, onDeleteTag }: any) => {
 const [tagList, setTagList] = useState<Tag[]>([]);
 const [newTagName, setNewTagName] = useState('');
 const [newTagColor, setNewTagColor] = useState('#3B82F6');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   if (isOpen) {
     setTagList(typeof tags === 'object' && tags !== null ? Object.values(tags) : []);
     setError(null); setNewTagName('');
   }
 }, [tags, isOpen]);

 const colorOptions = [
   { nome: 'Azul', value: '#3B82F6' }, { nome: 'Verde', value: '#10B981' },
   { nome: 'Vermelho', value: '#EF4444' }, { nome: 'Amarelo', value: '#F59E0B' },
   { nome: 'Roxo', value: '#8B5CF6' }, { nome: 'Rosa', value: '#EC4899' }
 ];

 if (!isOpen) return null;

 const handleAddTag = async () => {
   if (newTagName.trim()) {
     setLoading(true); setError(null);
     try { await onCreateTag({ nome: newTagName.trim(), color: newTagColor }); setNewTagName(''); }
     catch (error: any) { setError(`Falha: ${error.message}`); }
     finally { setLoading(false); }
   }
 };

 const handleDeleteTag = async (tagId: string) => {
   // REMOVIDO: window.confirm - idealmente usar um modal
   // const confirmed = window.confirm('Apagar etiqueta? Tarefas associadas perderão a etiqueta.');
   // if (!confirmed) return;
   setLoading(true); setError(null);
    try { await onDeleteTag(tagId); }
    catch (error: any) { setError(`Falha: ${error.message}`); }
    finally { setLoading(false); }
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
       <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-bold text-gray-800">Gerir Etiquetas</h3>
         <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
       </div>
       {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
       {loading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}
       <div className="mb-4 flex-1 overflow-y-auto pr-2">
         <h4 className="font-semibold mb-2">Etiquetas ({tagList.length})</h4>
         <div className="space-y-2">
           {tagList.length > 0 ? tagList.map(tag => (
             <div key={tag.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
               <span className={`tag-${tag.color.replace('#', '').toLowerCase()}`}>{tag.nome}</span>
               <button onClick={() => handleDeleteTag(tag.id)} disabled={loading} className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded hover:bg-red-100" aria-label={`Apagar ${tag.nome}`}><Trash2 size={16} /></button>
             </div>
           )) : <p className="text-sm text-gray-500 italic">Nenhuma etiqueta.</p>}
         </div>
       </div>
       <div className="border-t pt-4">
         <h4 className="font-semibold mb-2">Nova Etiqueta</h4>
         <div className="flex items-center gap-2">
           <input type="text" placeholder="Nome" value={newTagName} onChange={e => setNewTagName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" disabled={loading} />
           <select value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[100px]" disabled={loading}>
             {colorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.nome}</option>)}
           </select>
           <button onClick={handleAddTag} disabled={!newTagName.trim() || loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold whitespace-nowrap disabled:opacity-50 flex items-center justify-center w-28">{loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Adicionar'}</button>
         </div>
       </div>
       <div className="mt-6 flex justify-end">
         <button onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold disabled:opacity-50">Fechar</button>
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

 useEffect(() => {
    const loadData = async () => {
      setLoading(true); setError(null);
      try {
        const [tagsArray, tasksArrayFromApi, usersArray] = await Promise.all([
          apiGetTags(),
          apiGetTasks(), // Já não mapeia comentários aqui
          apiGetUsers()
        ]);

        const tagsObject = transformTagsArrayToObject(tagsArray);
        setTags(tagsObject); // Atualiza estado tags global
        setUsers(usersArray);

        const columnOrder = Object.keys(initialBoard.columns);
        // Tasks vêm sem comentários inicialmente
        const tasksById = tasksArrayFromApi.reduce((acc, task) => {
          acc[task.id] = { ...task, coment: [] }; // Garante coment vazio
          return acc;
        }, {} as Record<string, Task>);

        const initialColumns = { ...initialBoard.columns };
        columnOrder.forEach(colId => {
          if (initialColumns[colId]) initialColumns[colId] = { ...initialColumns[colId], taskIds: [] };
        });

        tasksArrayFromApi.forEach(task => {
          const taskStatus = task.status?.toLowerCase();
          const targetColId = columnOrder.find(colId => initialColumns[colId]?.title.toLowerCase() === taskStatus);
          const destinationColId = targetColId || columnOrder[0];
          if (initialColumns[destinationColId]) {
            initialColumns[destinationColId].taskIds.push(task.id);
          } else {
            const firstValidColId = columnOrder.find(colId => initialColumns[colId]);
            if(firstValidColId) initialColumns[firstValidColId].taskIds.push(task.id);
          }
        });

        const newBoard: TaskBoard = { ...initialBoard, columnOrder, columns: initialColumns, tasks: tasksById, tags: tagsObject };
        setBoard(newBoard);
      } catch (err: any) { setError(`Falha: ${err.message}`); }
      finally { setLoading(false); isInitialLoad.current = false; }
    };
    loadData();
 }, [initialBoard]);

 const handleTaskCreated = useCallback((newTask: Task, columnId: string | null) => {
    // Garante que a nova task tem os campos necessários e coment vazio
    const taskToAdd = {
        ...newTask,
        etiquetaId: newTask.etiquetaId || null,
        coment: [] // Nova task começa sem comentários
    };
    setBoard(prev => {
      const targetCol = columnId || prev.columnOrder[0];
      if (!prev.columns[targetCol]) return prev;
      const newTasks = { ...prev.tasks, [taskToAdd.id]: taskToAdd };
      const newColumns = { ...prev.columns, [targetCol]: { ...prev.columns[targetCol], taskIds: [taskToAdd.id, ...prev.columns[targetCol].taskIds] } };
      return { ...prev, tasks: newTasks, columns: newColumns };
    });
 }, []);

 // ATUALIZADO: Preserva comentários corretamente
 const handleTaskUpdated = useCallback((updatedTask: Task) => {
     // A task recebida (updatedTask) AGORA contém os comentários atualizados vindos do modal
     const taskWithComments = {
         ...updatedTask,
         etiquetaId: updatedTask.etiquetaId || null, // Garante etiquetaId
         coment: Array.isArray(updatedTask.coment) ? updatedTask.coment : [] // Garante array
     };
     setBoard(prev => ({ ...prev, tasks: { ...prev.tasks, [taskWithComments.id]: taskWithComments } }));
 }, []);


 const handleTaskDeleted = useCallback((taskId: string) => {
    setBoard(prev => {
      const newTasks = { ...prev.tasks }; delete newTasks[taskId];
      const newColumns = { ...prev.columns };
      Object.keys(newColumns).forEach(colId => {
        if (newColumns[colId]?.taskIds) newColumns[colId].taskIds = newColumns[colId].taskIds.filter(id => id !== taskId);
      });
      return { ...prev, tasks: newTasks, columns: newColumns };
    });
 }, []);

 const handleCreateTag = async (newTagData: NewTagData) => {
    try {
      const newTag = await apiCreateTag(newTagData);
      setTags(prev => ({ ...prev, [newTag.id]: newTag }));
      setBoard(prev => ({ ...prev, tags: { ...prev.tags, [newTag.id]: newTag } }));
    } catch (error: any) { setError(`Falha: ${error.message}`); }
 };

 const handleDeleteTag = async (tagId: string) => {
    try {
      await apiDeleteTag(tagId);
      setTags(prev => { const d = { ...prev }; delete d[tagId]; return d; });
      setBoard(prevBoard => {
          const newTasks = { ...prevBoard.tasks }; let changed = false;
          Object.keys(newTasks).forEach(taskId => {
              if (newTasks[taskId].etiquetaId === tagId) { newTasks[taskId] = { ...newTasks[taskId], etiquetaId: null }; changed = true; }
          });
          const newBoardTags = { ...prevBoard.tags }; delete newBoardTags[tagId];
          return { ...prevBoard, tasks: newTasks, tags: newBoardTags };
      });
    } catch (error: any) { setError(`Falha: ${error.message}`); }
 };


 const handleOpenNewTaskModal = (columnId: string) => { setTargetColumn(columnId); setIsNewTaskModalOpen(true); };
 const handleOpenDetailModal = (task: Task) => {
    // Busca a task mais atualizada do estado 'board'
    const currentTaskState = board.tasks[task.id] || task;
    // Passa a task para o modal, garantindo 'coment' como array VAZIO, pois o modal vai buscar
    setSelectedTask({ ...currentTaskState, coment: [] });
    setIsDetailModalOpen(true);
 };
 const handleCloseModals = () => { setIsNewTaskModalOpen(false); setIsDetailModalOpen(false); setIsManageTagsModalOpen(false); setSelectedTask(null); };
 const handleDragStart = (e: React.DragEvent, taskId: string) => { e.dataTransfer.setData('taskId', taskId); e.currentTarget.classList.add('opacity-50'); };
 const handleDragEnd = (e: React.DragEvent) => { e.currentTarget.classList.remove('opacity-50'); };
 const handleDragOver = (e: React.DragEvent) => e.preventDefault();

 const handleDrop = useCallback(async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const taskToMove = board.tasks[taskId];
    if (!taskToMove) return;

    let sourceColumnId: string | undefined;
    for (const colId in board.columns) { if (board.columns[colId].taskIds.includes(taskId)) { sourceColumnId = colId; break; } }
    if (!sourceColumnId || sourceColumnId === targetColumnId) return;

    const previousBoard = board;

    // UI Otimista
    setBoard(prev => {
        const sourceCol = prev.columns[sourceColumnId!]; const targetCol = prev.columns[targetColumnId];
        if (!sourceCol || !targetCol) return prev;
        const sourceTaskIds = sourceCol.taskIds.filter(id => id !== taskId);
        const targetTaskIds = [taskId, ...targetCol.taskIds.filter(id => id !== taskId)];
        return { ...prev, columns: { ...prev.columns, [sourceColumnId!]: { ...sourceCol, taskIds: sourceTaskIds }, [targetColumnId]: { ...targetCol, taskIds: targetTaskIds } } };
    });

    // Backend Update
    try {
        const targetColumn = previousBoard.columns[targetColumnId];
        const newStatus = targetColumn?.title?.toLowerCase();
        if (!newStatus) throw new Error("Coluna inválida.");

        const updatedTaskFromApi = await apiUpdateTask(taskId, { status: newStatus });

        // Atualiza board com dados da API, preservando comentários do estado ANTERIOR ao drop
        setBoard(prev => {
            // Pega os comentários da task ANTES da atualização da API
            const currentComments = previousBoard.tasks[taskId]?.coment || [];
            return {
                ...prev, // Mantém a estrutura das colunas já atualizada otimisticamente
                tasks: { ...prev.tasks, [taskId]: { ...updatedTaskFromApi, coment: currentComments } } // Atualiza a task com dados da API + comentários preservados
            };
        });
    } catch (error: any) { setError(`Falha: ${error.message}. Revertendo.`); setBoard(previousBoard); } // Rollback
 }, [board]);


 // Loading inicial
 if (loading && isInitialLoad.current) return (<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-12 w-12 text-indigo-600" /></div>);
 // Erro de configuração
 if (!board?.columnOrder?.length) return (<div className="p-6 text-center text-red-600">Erro: Configuração inválida.</div>);

 return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Mensagem de Erro */}
      {error && (<div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between gap-2"><div className="flex items-center gap-2"><AlertCircle size={20} /><span>{error}</span></div><button onClick={() => setError(null)} className="p-1 hover:bg-red-200 rounded" aria-label="Fechar"><X size={16} /></button></div>)}

      {/* Modais */}
      <NewTaskModal isOpen={isNewTaskModalOpen} onClose={handleCloseModals} users={users} allTags={tags} onTaskCreated={handleTaskCreated} targetColumn={targetColumn || board.columnOrder[0]} />
      {/* Passa a task do estado 'board' para o modal */}
      {selectedTask && <TaskDetailModal isOpen={isDetailModalOpen} onClose={handleCloseModals} task={board.tasks[selectedTask.id] || selectedTask} users={users} allTags={tags} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} loggedInUser={loggedInUser} />}
      <ManageTagsModal isOpen={isManageTagsModalOpen} onClose={() => setIsManageTagsModalOpen(false)} tags={tags} onCreateTag={handleCreateTag} onDeleteTag={handleDeleteTag} />

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas</h1>
        <div className="flex gap-3">
          <button onClick={() => setIsManageTagsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"><Settings size={16} /> Etiquetas ({Object.keys(tags).length})</button>
          <button onClick={() => handleOpenNewTaskModal(board.columnOrder[0])} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"><PlusCircle size={16} /> Nova Tarefa</button>
        </div>
      </div>

      {/* Quadro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {board.columnOrder.map(columnId => {
          const column = board.columns[columnId];
          if (!column) return null;
          // Pega as tasks DO ESTADO ATUAL DO BOARD
          const columnTasks = (Array.isArray(column.taskIds) ? column.taskIds : [])
            .map(id => board.tasks[id]).filter(task => !!task);

          return (
            <div key={column.id} onDrop={e => handleDrop(e, column.id)} onDragOver={handleDragOver} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 min-h-[300px] flex flex-col shadow-sm border">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-700 text-lg">{column.title} <span className="text-sm text-gray-500">({columnTasks.length})</span></h3><button onClick={() => handleOpenNewTaskModal(column.id)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" aria-label={`Add to ${column.title}`}><PlusCircle size={20} /></button></div>
              <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                {columnTasks.length > 0 ? columnTasks.map(task => (<TaskCard key={task.id} task={task} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onClick={handleOpenDetailModal} tags={tags} />)) : <p className="text-sm text-gray-500 italic text-center mt-4">Vazio.</p>}
              </div>
            </div>
          );
         })}
      </div>
    </div>
 );
};

export default TaskBoardPage;
