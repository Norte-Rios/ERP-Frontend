import React, { useState, useEffect } from 'react';
// ATUALIZADO: Importações de tipos e ícones
import { TaskBoard, Task, Tag } from '../../admin/tasks/types';
import { User, Calendar, MessageSquare, X, Loader2, AlertCircle, Trash2, Edit } from 'lucide-react'; 
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

const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_COMMENT_URL = `${API_URL}/comments`; // Nova URL de API

// --- Tipos de Comentário (NOVOS) ---
// Tipo do comentário como vem do Backend
export interface BackendComment {
  id: string;
  comment: string;
  user: { id: string; nome: string; };
  createdAt: string;
}
// Tipo do comentário como usado no Frontend
export interface FrontendComment {
  id: string;
  text: string;
  author: string;
  date: string;
}

// --- Funções de API de Comentários (NOVAS) ---
const apiGetCommentsByTask = async (taskId: string): Promise<BackendComment[]> => {
  try {
    const response = await axios.get<BackendComment[]>(`${API_COMMENT_URL}/task/${taskId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Erro ao buscar comentários para task ${taskId}:`, error);
    throw error;
  }
};

const apiAddComment = async (taskId: string, commentText: string, userId: string): Promise<BackendComment> => {
  try {
    const response = await axios.post<BackendComment>(`${API_COMMENT_URL}`, {
      comment: commentText,
      userId: userId,
      taskId: taskId,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw error;
  }
};


// --- Backend Task Type (Sem alterações) ---
type BackendTask = {
  id: string;
  titulo: string | null;
  user: { id: string; nome: string } | null;
  data: string;
  status: string;
  etiqueta: Tag | null;
  description: string | null;
  comment: any[] | null;
};

// --- Initial Board Structure (Sem alterações) ---
const initialBoardStructure: TaskBoard = {
  columns: {
    'a fazer': { id: 'a fazer', title: 'A Fazer', taskIds: [] },
    'em andamento': { id: 'em andamento', title: 'Em Andamento', taskIds: [] },
    'em revisão': { id: 'em revisão', title: 'Em Revisão', taskIds: [] },
    'concluído': { id: 'concluído', title: 'Concluído', taskIds: [] },
  },
  columnOrder: ['a fazer', 'em andamento', 'em revisão', 'concluído'],
  tasks: {},
  tags: {},
};

// --- TaskTags Component (Sem alterações) ---
const TaskTags = ({ tagIds, tags }: { tagIds: string[]; tags: Record<string, Tag> }) => {
  if (!tagIds || tagIds.length === 0) return null;

  const getContrastingTextColor = (hex: string) => {
    if (!hex) return '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#1f2937' : '#FFFFFF'; 
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tagIds.map(tagId => {
        const tag = tags[tagId];
        if (!tag) return null;
        
        const tagStyle = {
          backgroundColor: tag.color || '#E5E7EB',
          color: getContrastingTextColor(tag.color),
        };

        return (
          <span
            key={tag.id}
            className="px-2 py-0.5 text-xs font-semibold rounded-full"
            style={tagStyle}
          >
            {tag.nome}
          </span>
        );
      })}
    </div>
  );
};

// --- TaskCard Component (ATUALIZADO) ---
// Adicionado 'onClick' para abrir o modal
const TaskCard = ({ task, tags, innerRef, style, onClick, ...props }) => {
  return (
    <div
      ref={innerRef}
      style={style}
      onClick={onClick} // ✅ Adicionado
      {...props} 
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab"
    >
      <h4 className="font-semibold text-sm text-gray-800 mb-2">{task.title}</h4>
      <TaskTags tagIds={task.tagIds} tags={tags} />
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1" title={task.assignee.name}>
            <User size={14} />
            <span className="font-medium">{task.assignee.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SortableTaskItem Component (ATUALIZADO) ---
// Adicionado 'onClick' para repassar ao TaskCard
const SortableTaskItem = ({ task, tags, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TaskCard
      task={task}
      tags={tags}
      innerRef={setNodeRef}
      style={style}
      onClick={onClick} // ✅ Adicionado
      {...attributes}
      {...listeners}
    />
  );
};

// --- TaskColumn Component (ATUALIZADO) ---
// Adicionado 'onTaskClick' para receber o evento
const TaskColumn = ({ column, tasks, tags, onTaskClick }: { 
  column: TaskBoard['columns'][string], 
  tasks: Task[], 
  tags: Record<string, Tag>,
  onTaskClick: (task: Task) => void // ✅ Adicionado
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      className={`p-3 min-h-[300px] flex flex-col rounded-lg ${
        isOver ? 'bg-blue-100' : 'bg-gray-100'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-gray-700 capitalize">
          {column.title}{' '}
          <span className="text-sm text-gray-400 font-normal">{tasks.length}</span>
        </h3>
      </div>
      
      <SortableContext
        items={column.taskIds}
        strategy={verticalListSortingStrategy}
    S >
        <div ref={setNodeRef} className="space-y-3 flex-grow min-h-[100px]">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              tags={tags}
              onClick={() => onTaskClick(task)} // ✅ Adicionado
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ---------------------------------------------------
// --- NOVO COMPONENTE: TaskDetailModal ---
// ---------------------------------------------------
const TaskDetailModal = ({ isOpen, onClose, task, tags, currentUser, onCommentAdded }) => {
  const [comments, setComments] = useState<FrontendComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  // Carrega comentários quando o modal abre ou a tarefa muda
  useEffect(() => {
    if (isOpen && task) {
      const loadComments = async () => {
        setCommentLoading(true);
        setError('');
        setComments([]); // Limpa comentários antigos
        try {
          const fetchedComments = await apiGetCommentsByTask(task.id);
          const frontendComments = fetchedComments.map(beComment => ({
            id: beComment.id,
            text: beComment.comment,
            author: beComment.user?.nome || 'Desconhecido',
            date: beComment.createdAt
          })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setComments(frontendComments);
        } catch (err) {
          setError("Falha ao carregar comentários.");
        } finally {
          setCommentLoading(false);
        }
      };
      loadComments();
    } else {
      // Limpa ao fechar
      setNewComment('');
      setError('');
      setComments([]);
    }
  }, [task, isOpen]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser?.id || !task?.id) {
      if (!currentUser?.id) setError("Utilizador não logado.");
      return;
    }

    setCommentLoading(true);
    setError('');
    
    try {
      const newBackendComment = await apiAddComment(task.id, newComment.trim(), currentUser.id);
      
      const finalFrontendComment: FrontendComment = {
        id: newBackendComment.id,
        text: newBackendComment.comment,
        author: newBackendComment.user.nome,
        date: newBackendComment.createdAt
      };

      // Adiciona o novo comentário no topo (mais recente)
      setComments(prev => [finalFrontendComment, ...prev]);
      setNewComment(''); // Limpa o input
      
      // Chama o callback para atualizar a contagem no board principal
      onCommentAdded(task.id, finalFrontendComment);

    } catch (error) {
      console.error("Erro comentário:", error);
      setError("Falha ao adicionar comentário.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

        {/* Conteúdo e Detalhes */}
        <div className="flex-grow overflow-y-auto pr-2 max-h-[calc(90vh-160px)]">
          <TaskTags tagIds={task.tagIds} tags={tags} />
          {task.content && <p className="text-gray-600 my-4 whitespace-pre-wrap">{task.content}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <div><strong className="block text-gray-500">Responsável:</strong> {task.assignee?.name || 'Não atribuída'}</div>
            <div><strong className="block text-gray-500">Data:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não definida'}</div>
          </div>

          {/* Seção de Comentários */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Comentários ({comments.length})</h4>
            
            {/* Lista de Comentários */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {commentLoading && comments.length === 0 ? (
                <div className="flex justify-center items-center py-4"><Loader2 className="animate-spin h-5 w-5 text-gray-400" /></div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-2">Nenhum comentário.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm text-gray-600 flex-shrink-0" title={comment.author}>
                      {comment.author ? comment.author.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 bg-white p-2 rounded shadow-sm border border-gray-200">
                      <p className="font-semibold text-sm text-gray-800">
                        {comment.author || 'Desconhecido'}
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          {comment.date ? new Date(comment.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : ''}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Input Novo Comentário */}
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="text" 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && !commentLoading && handleAddComment()}
                placeholder="Adicionar comentário..." 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" 
                disabled={commentLoading} 
              />
              <button 
                onClick={handleAddComment} 
                disabled={commentLoading || !newComment.trim()} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center w-28 text-sm"
              >
                {commentLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Comentar'}
              </button>
            </div>
          </div>
        </div>
      
        {/* Botões de Ação (ex: Editar/Apagar - Opcional) */}
        {/*         <div className="mt-auto flex justify-end gap-3 border-t pt-4">
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md ..."><Trash2 size={16} /> Apagar</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md ..."><Edit size={16} /> Editar</button>
        </div> 
        */}
      </div>
    </div>
  );
};


// --- Main Component ---
interface OperationalTasksPageProps {
  currentUser: { id: string; fullName: string; role: string; [key: string]: any };
}

const OperationalTasksPage: React.FC<OperationalTasksPageProps> = ({ currentUser }) => {
  const [boardData, setBoardData] = useState<TaskBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // ✅ NOVO ESTADO: Gerencia qual task está no modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const statusMap = {
    AFAZER: 'a fazer',
    EMANDAMENTO: 'em andamento',
    EMREVISAO: 'em revisão',
    CONCLUIDO: 'concluído',
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const { data: tasksFromDb } = await axios.get<BackendTask[]>(`${API_URL}/tasks`);

        const newBoard: TaskBoard = { ...initialBoardStructure, tasks: {}, tags: {} };
        Object.keys(newBoard.columns).forEach(key => {
          newBoard.columns[key] = { ...newBoard.columns[key], taskIds: [] };
        });

        for (const task of tasksFromDb) {
          const mappedStatus = statusMap[task.status] || task.status;
          if (!newBoard.tasks[task.id]) { 
            newBoard.tasks[task.id] = {
              id: String(task.id),
              title: task.titulo || 'Sem Título',
              content: task.description || '',
              dueDate: task.data,
              assignee: task.user ? { id: task.user.id, name: task.user.nome } : null,
              // 'comments' aqui é usado apenas para a CONTAGEM no card
              comments: task.comment || [], 
              tagIds: task.etiqueta ? [task.etiqueta.id] : [],
              status: mappedStatus,
            };

            if (task.etiqueta && !newBoard.tags[task.etiqueta.id]) {
              newBoard.tags[task.etiqueta.id] = task.etiqueta;
            }

            if (newBoard.columns[mappedStatus]) {
              newBoard.columns[mappedStatus].taskIds.push(String(task.id));
            } else {
              console.warn(`Tarefa ${task.id} tem um status inválido: ${task.status} (mapeado para ${mappedStatus})`);
            }
          }
        }
        setBoardData(newBoard);
      } catch (err) {
        console.error('Erro ao buscar tarefas do backend:', err);
        setError('Não foi possível carregar as tarefas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []); 

  // --- Handlers DND (Sem alterações) ---
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const findContainer = (id: string) => {
    if (!boardData) return null;
    if (id in boardData.columns) {
      return id;
    }
    return boardData.columnOrder.find(colId =>
      boardData.columns[colId].taskIds.includes(id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (boardData) {
      const task = boardData.tasks[active.id];
      if (task) {
        setActiveTask(task);
      }
    }
  };

  const handleOnDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;
    if (!boardData) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    const startColumnId = findContainer(taskId);
    let endColumnId = findContainer(overId);

    if (!startColumnId || !endColumnId) return;

    const startColumn = boardData.columns[startColumnId];
    const endColumn = boardData.columns[endColumnId];

    const sourceIndex = startColumn.taskIds.indexOf(taskId);
    const destinationIndex = (overId in boardData.columns)
      ? endColumn.taskIds.length
      : endColumn.taskIds.indexOf(overId);
    
    if (sourceIndex === -1 || (destinationIndex === -1 && !(overId in boardData.columns))) return;

    let newBoard = JSON.parse(JSON.stringify(boardData)); 
    let newStatus = endColumnId;

    if (startColumnId === endColumnId) {
      newBoard.columns[startColumnId].taskIds = arrayMove(
        newBoard.columns[startColumnId].taskIds,
        sourceIndex,
        destinationIndex
      );
    } else {
      const [movedTask] = newBoard.columns[startColumnId].taskIds.splice(sourceIndex, 1);
      
      const correctDestinationIndex = (overId in boardData.columns)
        ? newBoard.columns[endColumnId].taskIds.length
        : newBoard.columns[endColumnId].taskIds.indexOf(overId);

      newBoard.columns[endColumnId].taskIds.splice(correctDestinationIndex, 0, movedTask);
      
      newBoard.tasks[taskId].status = endColumnId;
    }

    setBoardData(newBoard);

    try {
      // Correção do Backend (Sem alterações)
      await axios.patch(`${API_URL}/tasks/${taskId}`, {
        status: newStatus, 
      });

      console.log(`Task ${taskId} movida para ${newStatus} no backend.`);
    } catch (err) {
      console.error('Erro ao atualizar a task:', err.response?.data || err.message);
      setBoardData(boardData); // Reverte
    }
  };

  // --- Handlers do Modal (NOVOS) ---

  // Abre o modal com a tarefa selecionada
  const handleOpenTaskDetails = (task: Task) => {
    // Garante que estamos abrindo a versão mais atual da task
    setSelectedTask(boardData.tasks[task.id] || task);
  };

  // Fecha o modal
  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  // Atualiza a contagem de comentários no board
  const handleCommentAdded = (taskId: string, newComment: FrontendComment) => {
    setBoardData(prev => {
      if (!prev) return prev;
      const newTasks = { ...prev.tasks };
      const task = newTasks[taskId];
      if (task) {
        // Atualiza a array 'comments' na task para refletir a nova contagem
        newTasks[taskId] = {
          ...task,
          comments: [...(task.comments || []), newComment] 
        };
      }
      return { ...prev, tasks: newTasks };
    });
  };

  // --- Renderização ---
  if (isLoading) {
    return <div className="text-gray-500 p-4">A carregar o quadro de tarefas...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!boardData) {
    return <div className="text-gray-500 p-4">Quadro não inicializado.</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleOnDragEnd}
    >
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          
          {/* Renderização das colunas (ATUALIZADA) */}
          {boardData.columnOrder.map(columnId => {
            const column = boardData.columns[columnId];
            if (!column) return null; 

            const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]).filter(Boolean);

            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={tasks}
                tags={boardData.tags}
                onTaskClick={handleOpenTaskDetails} // ✅ Passa o handler
              />
            );
          })}
        </div>
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} tags={boardData.tags} />
        ) : null}
      </DragOverlay>
      
      {/* ✅ Renderização do Modal de Detalhes */}
      {boardData && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={handleCloseTaskDetails}
          task={selectedTask}
          tags={boardData.tags}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </DndContext>
  );
};

export default OperationalTasksPage;