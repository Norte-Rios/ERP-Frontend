import React, { useState, useEffect } from "react";
import axios from "axios";

// Tipos reutilizados do admin
import {
  TaskBoard,
  Task,
  Tag,
  Comment as FrontendComment,
} from "../../admin/tasks/types";

// React Router – para ler projectId da URL
import { useLocation } from "react-router-dom";

// DnD Kit
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  pointerWithin, // <<< algoritmo de colisão
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// Ícones
import {
  Calendar,
  MessageSquare,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Constantes da API
const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_COMMENT_URL = `${API_URL}/comments`;
const API_TASKS_URL = `${API_URL}/tasks`;

// ----------------------------------------------
// Tipos exclusivos do OperationalTasksPage
// ----------------------------------------------
export interface BackendComment {
  id: string;
  comment: string;
  user: { id: string; nome: string };
  createdAt: string;
}

export interface BackendTask {
  id: string;
  titulo: string | null;
  description: string | null;
  data: string | null;
  prazo: string | null;
  status: string;
  etiqueta: Tag[] | null;
  user: { id: string; nome: string }[] | null;
  comment: any[] | null;
  // NOVO: projeto vindo do backend
  project?: { id: string; nome: string } | null;
}

interface OperationalTasksPageProps {
  currentUser: {
    id: string;
    fullName: string;
    role: string;
    [key: string]: string;
  };
}

// filtro de dono das tarefas
type TaskOwnerFilter = "all" | "mine" | "general";

// ----------------------------------------------
// Estrutura base do board
// ----------------------------------------------
export const initialBoardStructure: TaskBoard = {
  columns: {
    "a fazer": { id: "a fazer", title: "A Fazer", taskIds: [] },
    "em andamento": { id: "em andamento", title: "Em Andamento", taskIds: [] },
    "em revisão": { id: "em revisão", title: "Em Revisão", taskIds: [] },
    concluído: { id: "concluído", title: "Concluído", taskIds: [] },
  },
  columnOrder: ["a fazer", "em andamento", "em revisão", "concluído"],
  tasks: {},
  tags: {},
};

// ==========================
//  INJEÇÃO DE ESTILOS
// ==========================
const styles = `
  .tag {
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.70rem;
    font-weight: 600;
    display: inline-block;
    color: white;
  }
`;
if (typeof document !== "undefined") {
  const id = "task-tag-styles-operational";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.innerHTML = styles;
    document.head.appendChild(s);
  }
}

// ==========================
//  API HELPERS
// ==========================
const apiGetCommentsByTask = async (taskId: string) => {
  const r = await axios.get(`${API_COMMENT_URL}/task/${taskId}`);
  return r.data;
};

const apiAddComment = async (taskId: string, text: string, userId: string) => {
  const r = await axios.post(API_COMMENT_URL, {
    taskId,
    comment: text,
    userId,
  });
  return r.data;
};

// =====================================================
// COMPONENTE: TEXTO COM LINKS CLICÁVEIS
// =====================================================
const ClickableText = ({ text }: { text: string }) => {
  if (!text) return null;

  const urlRegex =
    /(https?:\/\/[^\s<]+|www\.[^\s<]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}[^\s<]*)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const matchedText = match[0];

    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    let href = matchedText;
    if (!href.match(/^https?:\/\//i)) {
      href = "https://" + href;
    }

    const cleanDisplay = matchedText.replace(/[.,;:!?)]+$/, "");
    const punctuation = matchedText.slice(cleanDisplay.length);

    elements.push(
      <a
        key={match.index}
        href={href.replace(/[.,;:!?)]+$/, "")}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium break-all"
      >
        {cleanDisplay}
      </a>
    );

    if (punctuation) {
      elements.push(punctuation);
    }

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <span className="whitespace-pre-wrap">{elements}</span>;
};

// =====================================================
// COMPONENTE: TAGS DAS TAREFAS
// =====================================================
const TaskTags = ({ etiquetas }: { etiquetas?: Tag[] }) => {
  if (!etiquetas || etiquetas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 mb-1">
      {etiquetas.map((tag) => (
        <span
          key={tag.id}
          className="tag"
          style={{ backgroundColor: tag.color }}
        >
          {tag.nome}
        </span>
      ))}
    </div>
  );
};

// =====================================================
// COMPONENTE: CARD DA TAREFA
// =====================================================
const TaskCard = ({
  task,
  onClick,
  style,
  innerRef,
  ...rest
}: {
  task: Task;
  onClick?: (task: Task) => void;
  style?: React.CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;
}) => {
  return (
    <div
      ref={innerRef}
      style={style}
      onClick={() => onClick?.(task)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow transition cursor-pointer"
      {...rest}
    >
      <h4 className="font-semibold text-sm text-gray-900 mb-1">
        {task.titulo || "Sem título"}
      </h4>

      <TaskTags etiquetas={task.etiquetas} />

      <div className="mt-2 text-xs text-gray-700 space-y-1">
        {task.data && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              Início:{" "}
              {new Date(task.data).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </span>
          </div>
        )}

        {task.prazo && (
          <div className="flex items-center gap-1 text-red-600 font-semibold">
            <Calendar size={12} />
            <span>
              Prazo:{" "}
              {new Date(task.prazo).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-2">
        {task.users?.length ? (
          <div className="flex -space-x-2 overflow-hidden">
            {task.users.slice(0, 3).map((u) => (
              <div
                key={u.id}
                className="h-6 w-6 rounded-full bg-gray-300 ring-2 ring-white flex items-center justify-center text-xs font-semibold"
              >
                {u.nome.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic text-xs">
            Sem responsável
          </span>
        )}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: SORTABLE TASK (arrastável)
// =====================================================
const SortableTaskCard = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskCard
      task={task}
      onClick={onClick}
      innerRef={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

// =====================================================
// DROPPABLE COLUMN WRAPPER
// =====================================================
const DroppableColumn = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex flex-col min-h-[320px]">
      {children}
    </div>
  );
};

// =====================================================
// COMPONENTE: COLUNA DO BOARD (apenas UI)
// =====================================================
const TaskColumn = ({
  column,
  tasks,
  onTaskClick,
}: {
  column: TaskBoard["columns"][string];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border shadow-sm flex flex-col flex-1">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-700 capitalize">
          {column.title}
        </h3>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// =====================================================
// COMPONENTE: MODAL DE DETALHES DA TAREFA
// =====================================================
const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onCommentAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: { id: string; [key: string]: any } | null;
  onCommentAdded: (taskId: string, c: FrontendComment) => void;
}) => {
  const [comments, setComments] = useState<FrontendComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task || !isOpen) return;

    (async () => {
      try {
        setLoading(true);
        const data: BackendComment[] = await apiGetCommentsByTask(task.id);
        setComments(
          data.map((c) => ({
            id: c.id,
            text: c.comment,
            author: c.user?.nome || "Desconhecido",
            date: c.createdAt,
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [task, isOpen]);

  const handleSend = async () => {
    if (!newComment.trim() || !task || !currentUser) return;

    setLoading(true);
    const saved = await apiAddComment(task.id, newComment, currentUser.id);
    const finalComment: FrontendComment = {
      id: saved.id,
      text: saved.comment,
      author: saved.user.nome,
      date: saved.createdAt,
    };

    setComments((prev) => [finalComment, ...prev]);
    onCommentAdded(task.id, finalComment);
    setNewComment("");
    setLoading(false);
  };

  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">{task.titulo}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <TaskTags etiquetas={task.etiquetas} />

        {task.description && (
          <div className="text-gray-700 my-3">
            <ClickableText text={task.description} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <strong>Ínicio:</strong>{" "}
            {task.data
              ? new Date(task.data).toLocaleDateString("pt-BR")
              : "Não definido"}
          </div>
          <div>
            <strong>Prazo:</strong>{" "}
            {task.prazo
              ? new Date(task.prazo).toLocaleDateString("pt-BR")
              : "Não definido"}
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mt-3 mb-2 flex items-center gap-2">
          <MessageSquare size={16} /> Comentários
        </h3>

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[200px] mb-4 border p-2 rounded-md bg-gray-50">
          {loading && comments.length === 0 && (
            <div className="text-center text-gray-500">Carregando...</div>
          )}

          {comments.map((c) => (
            <div key={c.id} className="p-2 border rounded bg-white">
              <p className="text-sm font-semibold text-gray-800">
                {c.author}
              </p>
              <div className="text-gray-700 text-sm">
                <ClickableText text={c.text} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(c.date).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}

          {comments.length === 0 && !loading && (
            <div className="text-center text-gray-400 text-sm italic">
              Nenhum comentário.
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <input
            type="text"
            value={newComment}
            className="flex-1 border p-2 rounded-md"
            placeholder="Adicionar comentário..."
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
const OperationalTasksPage = ({ currentUser }: OperationalTasksPageProps) => {
  const [boardData, setBoardData] = useState<TaskBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ===== FILTROS =====
  const [taskOwnerFilter, setTaskOwnerFilter] =
    useState<TaskOwnerFilter>("all");
  const [tagFilterIds, setTagFilterIds] = useState<string[]>([]);

  // Lê projectId da URL (?projectId=uuid)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectIdFromUrl = searchParams.get("projectId");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: backendTasks } = await axios.get<BackendTask[]>(
          API_TASKS_URL
        );

        // Filtra tarefas pelo projeto, se projectId vier na URL
        const filteredTasks = projectIdFromUrl
          ? backendTasks.filter((t) => t.project?.id === projectIdFromUrl)
          : backendTasks;

       const newBoard: TaskBoard = {
          ...initialBoardStructure,
          newBoard: {}, // <-- adiciona o campo obrigatório do tipo
           tasks: {},
          tags: {},
        };
        Object.keys(newBoard.columns).forEach((c) => {
          newBoard.columns[c].taskIds = [];
        });

        for (const t of filteredTasks) {
          const etiquetas = Array.isArray(t.etiqueta) ? t.etiqueta : [];
          const users = Array.isArray(t.user) ? t.user : [];

          const mappedStatus = (t.status || "a fazer").toLowerCase();

          newBoard.tasks[t.id] = {
            id: t.id,
            titulo: t.titulo || "",
            description: t.description || "",
            data: t.data,
            prazo: t.prazo || null,
            status: mappedStatus,
            users,
            userIds: users.map((u) => u.id),
            etiquetas,
            etiquetaIds: etiquetas.map((e) => e.id),
            coment: [],
            // NOVO: projeta para o tipo Task
            projectId: t.project?.id ?? null,
            projectName: t.project?.nome ?? null,
          };

          if (newBoard.columns[mappedStatus]) {
            newBoard.columns[mappedStatus].taskIds.push(t.id);
          } else {
            newBoard.columns["a fazer"].taskIds.push(t.id);
          }

          etiquetas.forEach((tag) => {
            if (tag && !newBoard.tags[tag.id]) {
              newBoard.tags[tag.id] = tag;
            }
          });
        }

        setBoardData(newBoard);
      } catch (e) {
        console.error(e);
        setError("Falha ao carregar tarefas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectIdFromUrl]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const findColumn = (taskId: string) => {
    if (!boardData) return null;
    return boardData.columnOrder.find((colId) =>
      boardData.columns[colId].taskIds.includes(taskId)
    );
  };

  const onDragStart = (e: DragStartEvent) => {
    if (!boardData) return;
    const id = String(e.active.id);
    const task = boardData.tasks[id];
    setActiveTask(task);
    document.body.classList.add("dragging");
  };

  const onDragEnd = async (e: DragEndEvent) => {
    document.body.classList.remove("dragging");
    const { active, over } = e;
    setActiveTask(null);

    if (!over || !boardData) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    const sourceCol = findColumn(taskId);
    let targetCol = findColumn(overId);

    if (!sourceCol) return;
    if (!targetCol) {
      // se caiu em cima da coluna droppable (id da coluna)
      if (overId in boardData.columns) targetCol = overId;
      else return;
    }

    // mesma coluna -> só reordena (mesmo com filtro, a posição em taskIds ainda é global)
    if (sourceCol === targetCol) {
      const col = boardData.columns[sourceCol];
      const oldIndex = col.taskIds.indexOf(taskId);
      const newIndex = col.taskIds.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIds = arrayMove(col.taskIds, oldIndex, newIndex);
        setBoardData({
          ...boardData,
          columns: {
            ...boardData.columns,
            [sourceCol]: { ...col, taskIds: newIds },
          },
        });
      }
      return;
    }

    // move entre colunas
    const newBoard: TaskBoard = JSON.parse(JSON.stringify(boardData));
    newBoard.columns[sourceCol].taskIds =
      newBoard.columns[sourceCol].taskIds.filter(
        (id: string) => id !== taskId
      );
    newBoard.columns[targetCol].taskIds.push(taskId);

    const movedTask = newBoard.tasks[taskId];
    setBoardData(newBoard);

    try {
      await axios.patch(`${API_TASKS_URL}/${taskId}`, {
        status: targetCol,
        userId: movedTask.userIds,
        etiquetaId: movedTask.etiquetaIds,
        prazo: movedTask.prazo || null,
        // NÃO mandamos projectId aqui => não vira NULL no banco
      });
    } catch (err) {
      console.error("Erro ao mover tarefa:", err);
      setError("Erro ao mover tarefa.");
      setBoardData(boardData);
    }
  };

  const openDetails = (task: Task) => setSelectedTask(task);
  const closeDetails = () => setSelectedTask(null);

  const handleCommentAdded = (taskId: string, comment: FrontendComment) => {
    setBoardData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...prev.tasks[taskId],
            coment: [...(prev.tasks[taskId].coment || []), comment],
          },
        },
      };
    });
  };

  // ====== APLICAÇÃO DE FILTROS (dono + etiquetas) ======
  const applyFilters = (tasks: Task[]): Task[] => {
    let result = [...tasks];

    if (taskOwnerFilter === "mine" && currentUser?.id) {
      result = result.filter((t) => {
        const userIds = t.userIds ?? [];
        const users = t.users ?? [];
        return (
          userIds.includes(currentUser.id) ||
          users.some((u) => u.id === currentUser.id)
        );
      });
    } else if (taskOwnerFilter === "general") {
      result = result.filter((t) => {
        const userIds = t.userIds ?? [];
        const users = t.users ?? [];
        return userIds.length === 0 && users.length === 0;
      });
    }

    if (tagFilterIds.length > 0) {
      result = result.filter((t) => {
        const etiquetaIds =
          t.etiquetaIds && t.etiquetaIds.length > 0
            ? t.etiquetaIds
            : (t.etiquetas ?? []).map((e) => e.id);
        if (!etiquetaIds || etiquetaIds.length === 0) return false;
        return etiquetaIds.some((id) => tagFilterIds.includes(id));
      });
    }

    return result;
  };

  const toggleTagFilter = (id: string) => {
    setTagFilterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setTaskOwnerFilter("all");
    setTagFilterIds([]);
  };

  if (loading) return <div className="p-6">Carregando tarefas...</div>;
  if (error)
    return (
      <div className="p-6 flex items-center gap-2 text-red-600">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  if (!boardData) return <div className="p-6">Sem dados no board.</div>;

  // Título do projeto (igual lógica do admin)
  let projectTitle = "Todos os projetos";
  if (projectIdFromUrl) {
    const firstTaskKey = Object.keys(boardData.tasks)[0];
    const firstTask = firstTaskKey ? boardData.tasks[firstTaskKey] : null;
    if (firstTask?.projectName) {
      projectTitle = firstTask.projectName;
    } else {
      projectTitle = "Projeto selecionado";
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Quadro de Tarefas
          </h1>
          <p className="text-sm text-gray-600">
            {projectIdFromUrl ? `Projeto: ${projectTitle}` : projectTitle}
          </p>

          {/* Barra de filtros */}
          <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                Mostrar:
              </span>
              <select
                value={taskOwnerFilter}
                onChange={(e) =>
                  setTaskOwnerFilter(e.target.value as TaskOwnerFilter)
                }
                className="text-xs sm:text-sm px-2 py-1 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todas as tarefas</option>
                <option value="mine">Minhas tarefas</option>
                <option value="general">Tarefas gerais (sem responsável)</option>
              </select>
            </div>

            <div className="flex-1">
              <span className="block text-xs font-medium text-gray-700 mb-1">
                Filtrar por etiquetas:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.values(boardData.tags).map((tag) => {
                  const sel = tagFilterIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagFilter(tag.id)}
                      className={`px-2 py-1 rounded-full text-[0.70rem] font-semibold border ${
                        sel ? "text-white" : "text-gray-700"
                      }`}
                      style={{
                        backgroundColor: sel ? tag.color : "#fff",
                        borderColor: tag.color,
                      }}
                    >
                      {tag.nome}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardData.columnOrder.map((colId) => {
            const col = boardData.columns[colId];
            const rawTasks = col.taskIds.map((id) => boardData.tasks[id]);
            const tasks = applyFilters(rawTasks);

            return (
              <DroppableColumn key={col.id} id={col.id}>
                <TaskColumn
                  column={col}
                  tasks={tasks}
                  onTaskClick={openDetails}
                />
              </DroppableColumn>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div
            className="bg-white p-4 rounded-lg shadow-xl border w-64"
            style={{
              borderTop: `4px solid ${
                activeTask.etiquetas?.[0]?.color || "transparent"
              }`,
            }}
          >
            <h4 className="font-semibold text-gray-800">
              {activeTask.titulo}
            </h4>
          </div>
        )}
      </DragOverlay>

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={closeDetails}
        task={selectedTask}
        currentUser={currentUser}
        onCommentAdded={handleCommentAdded}
      />
    </DndContext>
  );
};

export default OperationalTasksPage;
