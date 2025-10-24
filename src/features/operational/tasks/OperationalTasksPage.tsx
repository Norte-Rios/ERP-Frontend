import React, { useState, useEffect } from 'react';
import { TaskBoard, Task, Tag } from '../../admin/tasks/types';
import { User, Calendar, MessageSquare } from 'lucide-react';
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

// --- TaskCard Component (Sem alterações) ---
const TaskCard = ({ task, tags, innerRef, style, ...props }) => {
  return (
    <div
      ref={innerRef}
      style={style}
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

// --- SortableTaskItem Component (Sem alterações) ---
const SortableTaskItem = ({ task, tags }) => {
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
      {...attributes}
      {...listeners}
    />
  );
};

// ---------------------------------------------------
// --- COMPONENTE DE COLUNA (PARA CORRIGIR ERRO DO HOOK) ---
// ---------------------------------------------------
const TaskColumn = ({ column, tasks, tags }: { column: TaskBoard['columns'][string], tasks: Task[], tags: Record<string, Tag> }) => {
  // ✅ Hook chamado incondicionalmente no topo do componente
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
      >
        <div ref={setNodeRef} className="space-y-3 flex-grow min-h-[100px]">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              tags={tags}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
// ---------------------------------------------------


// --- Main Component ---
interface OperationalTasksPageProps {
  currentUser: { id: string; fullName: string; role: string; [key: string]: any };
}

const OperationalTasksPage: React.FC<OperationalTasksPageProps> = ({ currentUser }) => {
  const [boardData, setBoardData] = useState<TaskBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
      // ---------------------------------------------------
      // --- CORREÇÃO DO BACKEND (REMOVER REVERSESTATUSMAP) ---
      // ---------------------------------------------------
      // const reverseStatusMap = { ... }; // REMOVIDO
      
      await axios.patch(`${API_URL}/tasks/${taskId}`, {
        status: newStatus, // ENVIANDO O STATUS MINÚSCULO (ex: "a fazer")
      });
      // ---------------------------------------------------

      console.log(`Task ${taskId} movida para ${newStatus} no backend.`);
    } catch (err) {
      console.error('Erro ao atualizar a task:', err.response?.data || err.message);
      setBoardData(boardData); // Reverte
    }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          
          {/* ✅ RENDERIZAÇÃO CORRIGIDA USANDO O NOVO COMPONENTE */}
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
    </DndContext>
  );
};

export default OperationalTasksPage;