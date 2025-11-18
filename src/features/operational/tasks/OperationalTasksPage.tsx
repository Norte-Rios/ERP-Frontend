import React, { useState, useEffect, useCallback } from 'react';
import { TaskBoard, Task, Tag, Comment as FrontendComment } from '../../admin/tasks/types';
import { Calendar, MessageSquare, X, Loader2, AlertCircle } from 'lucide-react';
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
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_COMMENT_URL = `${API_URL}/comments`;
const API_TASKS_URL = `${API_URL}/tasks`;

// --- Injeção de estilos das etiquetas ---
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

// --- Tipos de comentário vinda do backend ---
export interface BackendComment {
  id: string;
  comment: string;
  user: { id: string; nome: string };
  createdAt: string;
}

// --- Funções de API de Comentários ---
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
      userId,
      taskId,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
};

// --- Tipo de Task vindo do backend ---
type BackendTask = {
  id: string;
  titulo: string | null;
  user: { id: string; nome: string }[] | null;
  data: string;
  status: string;
  etiqueta: Tag[] | null;
  description: string | null;
  comment: any[] | null;
};

// --- Estrutura inicial do board ---
const initialBoardStructure: TaskBoard = {
  columns: {
    'a fazer': { id: 'a fazer', title: 'A Fazer', taskIds: [] },
    'em andamento': { id: 'em andamento', title: 'Em Andamento', taskIds: [] },
    'em revisão': { id: 'em revisão', title: 'Em Revisão', taskIds: [] },
    concluído: { id: 'concluído', title: 'Concluído', taskIds: [] },
  },
  columnOrder: ['a fazer', 'em andamento', 'em revisão', 'concluído'],
  tasks: {},
  tags: {},
};

// --- Componente de etiquetas ---
const TaskTags = ({ etiquetas }: { etiquetas: Tag[] | undefined }) => {
  if (!etiquetas || etiquetas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 mb-1">
      {etiquetas.map((tag) => {
        if (!tag || !tag.color) return null;
        const cleanColor = tag.color.startsWith('#') ? tag.color.substring(1) : tag.color;
        const colorClass = `tag-${cleanColor.toLowerCase()}`;
        return (
          <span key={tag.id} className={colorClass}>
            {tag.nome}
          </span>
        );
      })}
    </div>
  );
};

// --- Card da task ---
interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  style?: React.CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;
  [key: string]: any;
}

const TaskCard = ({ task, onClick, style, innerRef, ...rest }: TaskCardProps) => {
  return (
    <div
      ref={innerRef}
      style={style}
      onClick={() => onClick && onClick(task)}
      {...rest}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab relative overflow-hidden"
    >
      <h4 className="font-semibold text-sm text-gray-800 mb-2">{task.titulo}</h4>

      <TaskTags etiquetas={task.etiquetas} />

      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
        <div className="flex items-center gap-2">
          {task.data && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(task.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
            </div>
          )}
          {task.coment && task.coment.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{task.coment.length}</span>
            </div>
          )}
        </div>

        {task.users && task.users.length > 0 ? (
          <div
            className="flex -space-x-2 overflow-hidden"
            title={task.users.map((u) => u.nome).join(', ')}
          >
            {task.users.slice(0, 3).map((user) => (
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
};

// --- ÚNICO SortableTaskItem ---
const SortableTaskItem = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

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
      onClick={onClick}
      {...attributes}
      {...listeners}
    />
  );
};

// --- Coluna (droppable + lista de SortableTaskItem) ---
const TaskColumn = ({
  column,
  tasks,
  onTaskClick,
}: {
  column: TaskBoard['columns'][string];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 min-h-[300px] flex flex-col shadow-sm border">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-gray-700 capitalize">
          {column.title}{' '}
          <span className="text-sm text-gray-400 font-normal">{tasks.length}</span>
        </h3>
      </div>

      <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-3 flex-grow min-h-[100px] rounded-md transition-colors ${
            isOver ? 'bg-indigo-100' : 'bg-transparent'
          }`}
        >
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// --- Modal de detalhes da Task ---
interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: { id: string; [key: string]: any } | null;
  onCommentAdded: (taskId: string, comment: FrontendComment) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onCommentAdded,
  currentUser,
}) => {
  const [comments, setComments] = useState<FrontendComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      const loadComments = async () => {
        setCommentLoading(true);
        setError('');
        setComments([]);
        try {
          const fetchedComments = await apiGetCommentsByTask(task.id);
          const frontendComments: FrontendComment[] = fetchedComments
            .map((beComment) => ({
              id: beComment.id,
              text: beComment.comment,
              author: beComment.user?.nome || 'Desconhecido',
              date: beComment.createdAt,
            }))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
          setComments(frontendComments);
        } catch {
          setError('Falha ao carregar comentários.');
        } finally {
          setCommentLoading(false);
        }
      };
      loadComments();
    } else {
      setNewComment('');
      setError('');
      setComments([]);
    }
  }, [task, isOpen]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser?.id || !task?.id) {
      if (!currentUser?.id) setError('Utilizador não logado.');
      return;
    }

    setCommentLoading(true);
    setError('');

    try {
      const newBackendComment = await apiAddComment(
        task.id,
        newComment.trim(),
        currentUser.id,
      );

      const finalFrontendComment: FrontendComment = {
        id: newBackendComment.id,
        text: newBackendComment.comment,
        author: newBackendComment.user.nome,
        date: newBackendComment.createdAt,
      };

      setComments((prev) => [finalFrontendComment, ...prev]);
      setNewComment('');
      onCommentAdded(task.id, finalFrontendComment);
    } catch (error) {
      console.error('Erro comentário:', error);
      setError('Falha ao adicionar comentário.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{task.titulo}</h3>
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

        <div className="flex-grow overflow-y-auto pr-2 max-h-[calc(90vh-160px)]">
          <TaskTags etiquetas={task.etiquetas} />

          {task.description && (
            <p className="text-gray-600 my-4 whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <div>
              <strong className="block text-gray-500">Responsáveis:</strong>
              {task.users && task.users.length > 0
                ? task.users.map((u) => u.nome).join(', ')
                : 'Não atribuída'}
            </div>
            <div>
              <strong className="block text-gray-500">Data:</strong>{' '}
              {task.data
                ? new Date(task.data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC',
                  })
                : 'Não definida'}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-3">
              Comentários ({comments.length})
            </h4>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {commentLoading && comments.length === 0 ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-2">
                  Nenhum comentário.
                </p>
              ) : (
                comments.map((comment) => (
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
                        {comment.author || 'Desconhecido'}
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          {comment.date
                            ? new Date(comment.date).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {comment.text}
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
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) =>
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
      </div>
    </div>
  );
};

// --- Página principal ---
interface OperationalTasksPageProps {
  currentUser: { id: string; fullName: string; role: string; [key: string]: any };
}

const OperationalTasksPage: React.FC<OperationalTasksPageProps> = ({ currentUser }) => {
  const [boardData, setBoardData] = useState<TaskBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const { data: tasksFromDb } = await axios.get<BackendTask[]>(API_TASKS_URL);

        const newBoard: TaskBoard = { ...initialBoardStructure, tasks: {}, tags: {} };
        Object.keys(newBoard.columns).forEach((key) => {
          newBoard.columns[key] = { ...newBoard.columns[key], taskIds: [] };
        });

        for (const task of tasksFromDb) {
          const mappedStatus = (task.status || 'a fazer').toLowerCase();
          if (!newBoard.tasks[task.id]) {
            const etiquetas: Tag[] = Array.isArray(task.etiqueta) ? task.etiqueta : [];
            const users: { id: string; nome: string }[] = Array.isArray(task.user)
              ? task.user
              : [];

            newBoard.tasks[task.id] = {
              id: String(task.id),
              titulo: task.titulo || 'Sem Título',
              description: task.description || '',
              data: task.data,
              coment: (task.comment || []) as FrontendComment[],
              status: mappedStatus,
              users,
              userIds: users.map((u) => u.id),
              etiquetas,
              etiquetaIds: etiquetas.map((t) => t.id),
            };

            if (Array.isArray(task.etiqueta)) {
              task.etiqueta.forEach((tag) => {
                if (tag && !newBoard.tags[tag.id]) {
                  newBoard.tags[tag.id] = tag;
                }
              });
            }

            if (newBoard.columns[mappedStatus]) {
              newBoard.columns[mappedStatus].taskIds.push(String(task.id));
            } else {
              newBoard.columns['a fazer'].taskIds.push(String(task.id));
              console.warn(
                `Tarefa ${task.id} tem um status inválido: ${task.status}. Movida para 'a fazer'.`,
              );
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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  const findContainer = (id: string) => {
    if (!boardData) return null;
    if (id in boardData.columns) {
      return id;
    }
    return boardData.columnOrder.find((colId) =>
      boardData.columns[colId].taskIds.includes(id),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (boardData) {
      const task = boardData.tasks[active.id as string];
      if (task) {
        setActiveTask(task);
      }
    }
    document.body.classList.add('dragging');
  };

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

        setBoardData((prev) => {
          if (!prev) return prev;
          const currentComments = previousBoard.tasks[taskId]?.coment || [];
          const finalDroppedTask: Task = {
            ...taskFromPatch,
            users,
            userIds: users.map((u) => u.id),
            etiquetas,
            etiquetaIds: etiquetas.map((t) => t.id),
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
        setBoardData(previousBoard);
      }
    },
    [],
  );

  const handleOnDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    document.body.classList.remove('dragging');

    const { active, over } = event;

    if (!over || !boardData) return;

    const taskId = String(active.id);
    const overId = String(over.id);
    const taskToMove = boardData.tasks[taskId];
    if (!taskToMove) return;

    const startColumnId = findContainer(taskId);
    let targetColumnId = findContainer(overId);

    if (!startColumnId || !targetColumnId) return;

    if (boardData.tasks[targetColumnId]) {
      targetColumnId = findContainer(targetColumnId) as string;
    }
    if (!targetColumnId) return;

    if (startColumnId !== targetColumnId) {
      const previousBoard = boardData;

      setBoardData((prev) => {
        if (!prev) return prev;
        const sourceCol = prev.columns[startColumnId];
        const targetCol = prev.columns[targetColumnId];
        if (!sourceCol || !targetCol) return prev;

        const sourceTaskIds = sourceCol.taskIds.filter((id) => id !== taskId);

        let targetIndex = targetCol.taskIds.length;

        if (boardData.tasks[overId]) {
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
      const targetIndex = boardData.columns[startColumnId].taskIds.indexOf(overId);
      const sourceIndex = boardData.columns[startColumnId].taskIds.indexOf(taskId);

      if (
        targetIndex !== -1 &&
        sourceIndex !== -1 &&
        targetIndex !== sourceIndex
      ) {
        setBoardData((prev) => {
          if (!prev) return prev;
          const newTaskIds = arrayMove(
            prev.columns[startColumnId].taskIds,
            sourceIndex,
            targetIndex,
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

  const handleOpenTaskDetails = (task: Task) => {
    if (!boardData) return;
    setSelectedTask(boardData.tasks[task.id] || task);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const handleCommentAdded = (taskId: string, newComment: FrontendComment) => {
    setBoardData((prev) => {
      if (!prev) return prev;
      const newTasks = { ...prev.tasks };
      const task = newTasks[taskId];
      if (task) {
        newTasks[taskId] = {
          ...task,
          coment: [...(task.coment || []), newComment],
        };
      }
      return { ...prev, tasks: newTasks };
    });
  };

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
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            if (!column) return null;

            const tasks = column.taskIds
              .map((taskId) => boardData.tasks[taskId])
              .filter(Boolean) as Task[];

            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={tasks}
                onTaskClick={handleOpenTaskDetails}
              />
            );
          })}
        </div>
      </div>

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

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={handleCloseTaskDetails}
        task={selectedTask}
        currentUser={currentUser}
        onCommentAdded={handleCommentAdded}
      />
    </DndContext>
  );
};

export default OperationalTasksPage;
