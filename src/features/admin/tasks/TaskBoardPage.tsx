// src/features/admin/tasks/TaskBoardPage.tsx

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "../../../auth/AuthContext.tsx";
import { Task, Tag, Comment as FrontendComment } from "./types";
import { useLocation } from "react-router-dom";

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
  ChevronDown,
} from "lucide-react";

import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_TASKS_URL = `${API_BASE_URL}/tasks`;
const API_ETIQUETAS_URL = `${API_BASE_URL}/etiquetas`;
const API_USERS_URL = `${API_BASE_URL}/users`;
const API_COMMENT_URL = `${API_BASE_URL}/comments`;

interface BackendComment {
  id: string;
  comment: string;
  user: { id: string; nome: string };
  tasks?: { id: string };
  createdAt: string;
}

// Helper: linkificar texto
const linkifyText = (text?: string): React.ReactNode => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const index = match.index;

    if (index > last) nodes.push(text.slice(last, index));

    const href = url.startsWith("http") ? url : `https://${url}`;
    nodes.push(
      <a
        key={nodes.length}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline break-all"
      >
        {url}
      </a>
    );

    last = index + url.length;
  }

  if (last < text.length) nodes.push(text.slice(last));

  return nodes;
};

// ========================= API =========================

const apiGetUsers = async (): Promise<any[]> => {
  const res = await fetch(API_USERS_URL);
  if (!res.ok) throw new Error(`GET /users ${res.status}`);
  return res.json();
};

const apiGetTags = async (): Promise<Tag[]> => {
  const res = await fetch(API_ETIQUETAS_URL);
  if (!res.ok) throw new Error(`GET /etiquetas ${res.status}`);
  return res.json();
};

const apiCreateTag = async (data: { nome: string; color: string }): Promise<Tag> => {
  const res = await fetch(API_ETIQUETAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST /etiquetas ${res.status}`);
  return res.json();
};

const apiDeleteTag = async (id: string): Promise<void> => {
  const res = await fetch(`${API_ETIQUETAS_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /etiquetas ${res.status}`);
};

const apiGetTasksRaw = async (): Promise<any[]> => {
  const res = await fetch(API_TASKS_URL);
  if (!res.ok) throw new Error(`GET /tasks ${res.status}`);
  return res.json();
};

const apiDeleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`${API_TASKS_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /tasks ${res.status}`);
};

const apiGetCommentsByTask = async (taskId: string): Promise<BackendComment[]> => {
  const res = await fetch(`${API_COMMENT_URL}/task/${taskId}`);
  if (!res.ok) throw new Error(`GET /comments/task/${taskId} ${res.status}`);
  const list = await res.json();
  return Array.isArray(list) ? list : [];
};

const apiAddComment = async (
  taskId: string,
  commentText: string,
  userId: string
): Promise<BackendComment> => {
  const res = await fetch(`${API_COMMENT_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment: commentText, userId, taskId }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Erro ao adicionar comentário");
  }
  return res.json();
};

// normaliza a task do backend pro tipo Task do front
const normalizeTask = (t: any): Task => {
  const usersArr = Array.isArray(t.user)
    ? t.user
    : Array.isArray(t.users)
    ? t.users
    : [];
  const etiquetasArr = Array.isArray(t.etiqueta)
    ? t.etiqueta
    : Array.isArray(t.etiquetas)
    ? t.etiquetas
    : [];

  return {
    id: t.id,
    titulo: t.titulo,
    status: t.status,

    description: t.description ?? null,
    data: t.data ?? null,
    prazo: t.prazo ?? null,

    users: usersArr,
    userIds: usersArr.map((u: any) => u.id),

    etiquetas: etiquetasArr,
    etiquetaIds: etiquetasArr.map((e: any) => e.id),

    coment: [],

    user: t.user,
    userId: t.userId,
    etiquetaId: t.etiquetaId,

    // NOVO: informações de projeto
    projectId: t.project?.id ?? null,
    projectName: t.project?.nome ?? null,
  };
};

const apiCreateTask = async (payload: {
  titulo: string;
  description?: string | null;
  data?: string | null;
  prazo?: string | null;
  status: string;
  userIds: string[];
  etiquetaIds: string[];
  projectId?: string | null;
}): Promise<Task> => {
  const body: any = {
    titulo: payload.titulo,
    description: payload.description ?? null,
    data: payload.data ?? null,
    prazo: payload.prazo ?? null,
    status: payload.status,
    userId: payload.userIds ?? [],
  };

  if (payload.etiquetaIds && payload.etiquetaIds.length > 0) {
    body.etiquetaId = payload.etiquetaIds;
  }

  // NOVO: envia projectId quando tiver
  if (payload.projectId) {
    body.projectId = payload.projectId;
  }

  const res = await fetch(API_TASKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = Array.isArray(errBody.message)
      ? errBody.message.join(", ")
      : errBody.message || "Erro ao criar tarefa";
    throw new Error(msg);
  }

  const data = await res.json();
  return normalizeTask(data);
};

const apiUpdateTask = async (
  id: string,
  payload: Partial<Task>
): Promise<Task> => {
  const body: any = {};

  if (payload.titulo !== undefined) body.titulo = payload.titulo;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.data !== undefined) body.data = payload.data;
  if (payload.prazo !== undefined) body.prazo = payload.prazo;
  if (payload.status !== undefined) body.status = payload.status;

  if (payload.userIds !== undefined) body.userId = payload.userIds;
  if (payload.etiquetaIds !== undefined) body.etiquetaId = payload.etiquetaIds;

  // Se em algum momento quiser mudar de projeto no futuro:
  // if (payload.projectId !== undefined) body.projectId = payload.projectId;

  const res = await fetch(`${API_TASKS_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = Array.isArray(errBody.message)
      ? errBody.message.join(", ")
      : errBody.message || "Erro ao atualizar tarefa";
    throw new Error(msg);
  }

  const data = await res.json();
  return normalizeTask(data);
};

const transformTagsArrayToObject = (
  tags: Tag[]
): Record<string, Tag> => {
  return tags.reduce((acc, tag) => {
    acc[tag.id] = tag;
    return acc;
  }, {} as Record<string, Tag>);
};

// ======================== UI COMPONENTES ========================

const TaskTags = ({ etiquetas }: { etiquetas?: Tag[] }) => {
  if (!etiquetas || etiquetas.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1 mb-1">
      {etiquetas.map((tag) => (
        <span
          key={tag.id}
          className="px-2 py-0.5 rounded-full text-[0.70rem] font-semibold"
          style={{
            backgroundColor: tag.color || "#6B7280",
            color: "white",
          }}
        >
          {tag.nome}
        </span>
      ))}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onClick?: (t: Task) => void;
  style?: React.CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;
}

const TaskCard = ({ task, onClick, style, innerRef, ...rest }: TaskCardProps) => (
  <div
    ref={innerRef}
    style={style}
    onClick={() => onClick?.(task)}
    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-150 ease-in-out"
    {...rest}
  >
    <h4 className="font-semibold text-sm text-gray-800 mb-1">
      {task.titulo || "Tarefa sem título"}
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
      {task.users && task.users.length > 0 ? (
        <div
          className="flex -space-x-2 overflow-hidden"
          title={task.users.map((u) => u.nome).join(", ")}
        >
          {task.users.slice(0, 3).map((u) => (
            <div
              key={u.id}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
            >
              {u.nome ? u.nome.charAt(0).toUpperCase() : "?"}
            </div>
          ))}
          {task.users.length > 3 && (
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs font-semibold text-white">
              +{task.users.length - 3}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400 italic text-xs">Sem responsável</span>
      )}
    </div>
  </div>
);

const UserAvatar = ({ user }: { user: { nome: string } }) => (
  <div
    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
    title={user.nome}
  >
    {user.nome ? user.nome.charAt(0).toUpperCase() : "?"}
  </div>
);

interface UserMultiSelectDropdownProps {
  allUsers: { id: string; nome: string }[];
  selectedUserIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const UserMultiSelectDropdown: React.FC<UserMultiSelectDropdownProps> = ({
  allUsers,
  selectedUserIds,
  onChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(
    () =>
      allUsers.filter((u) =>
        u.nome.toLowerCase().includes(search.toLowerCase())
      ),
    [allUsers, search]
  );

  const selectedSet = new Set(selectedUserIds);
  const selectedUsers = allUsers.filter((u) => selectedSet.has(u.id));

  const toggle = (id: string) => {
    const newSet = new Set(selectedUserIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    onChange(Array.from(newSet));
  };

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Responsáveis
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between disabled:bg-gray-100"
      >
        <span className="flex-1">
          {selectedUsers.length === 0 ? (
            <span className="text-gray-500 text-sm">
              Selecionar usuários...
            </span>
          ) : (
            <div className="flex -space-x-2 overflow-hidden">
              {selectedUsers.slice(0, 3).map((u) => (
                <UserAvatar key={u.id} user={u} />
              ))}
              {selectedUsers.length > 3 && (
                <div className="inline-block h-6 w-6 rounded-full bg-gray-400 ring-2 ring-white flex items-center justify-center text-xs text-white">
                  +{selectedUsers.length - 3}
                </div>
              )}
            </div>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md text-sm"
              />
              <Search
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 italic text-center">
                Nenhum usuário encontrado.
              </li>
            )}
            {filtered.map((u) => {
              const sel = selectedSet.has(u.id);
              return (
                <li
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  className="px-3 py-2 text-sm rounded-md flex items-center gap-3 cursor-pointer hover:bg-gray-100"
                >
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      sel ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
                    }`}
                  >
                    {sel && <Check size={12} className="text-white" />}
                  </div>
                  <User size={16} />
                  <span>{u.nome}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// ======================== MODAL: NOVA TASK ========================

const NewTaskModal = ({
  isOpen,
  onClose,
  users,
  allTags,
  onTaskCreated,
  targetStatus,
  projectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  allTags: Record<string, Tag>;
  onTaskCreated: (t: Task) => void;
  targetStatus: string;
  projectId: string | null;
}) => {
  const [titulo, setTitulo] = useState("");
  const [description, setDescription] = useState("");
  const [data, setData] = useState("");
  const [prazo, setPrazo] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitulo("");
      setDescription("");
      setData("");
      setPrazo("");
      setSelectedUserIds([]);
      setSelectedTagIds([]);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      setError("Título é obrigatório");
      return;
    }
    if (selectedTagIds.length === 0) {
      setError("Selecione pelo menos uma etiqueta");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newTask = await apiCreateTask({
        titulo: titulo.trim(),
        description: description.trim() || null,
        data: data || null,
        prazo: prazo || null,
        status: targetStatus,
        userIds: selectedUserIds,
        etiquetaIds: selectedTagIds,
        projectId: projectId ?? undefined, // ← chave para ter Kanban por projeto
      });

      onTaskCreated(newTask);
      onClose();
    } catch (e: any) {
      setError(e.message || "Erro ao criar tarefa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Nova Tarefa
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={loading}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={loading}
          />

          <UserMultiSelectDropdown
            allUsers={users}
            selectedUserIds={selectedUserIds}
            onChange={setSelectedUserIds}
            disabled={loading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de início
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo
              </label>
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(allTags).map((tag) => {
                const sel = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    disabled={loading}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
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
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !titulo.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== MODAL: DETALHE / EDIÇÃO ========================

const TaskDetailModal = ({
  task,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  users,
  tags,
}: {
  task: Task;
  onClose: () => void;
  onTaskUpdated: (t: Task) => void;
  onTaskDeleted: (id: string) => void;
  users: any[];
  tags: Record<string, Tag>;
}) => {
  const { user: loggedUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Task>(task);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<FrontendComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    setEditData(task);
  }, [task]);

  useEffect(() => {
    (async () => {
      try {
        const backendComments = await apiGetCommentsByTask(task.id);
        const mapped: FrontendComment[] = backendComments.map((c) => ({
          id: c.id,
          author: c.user?.nome || "Desconhecido",
          date: c.createdAt,
          text: c.comment,
        }));
        setComments(mapped.sort((a, b) => (a.date < b.date ? 1 : -1)));
      } catch {
        setComments([]);
      }
    })();
  }, [task.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUser = (id: string) => {
    setEditData((prev) => {
      const cur = new Set(prev.userIds);
      cur.has(id) ? cur.delete(id) : cur.add(id);
      const newUserIds = Array.from(cur);
      const newUsers = users.filter((u) => newUserIds.includes(u.id));
      return { ...prev, userIds: newUserIds, users: newUsers };
    });
  };

  const toggleTag = (id: string) => {
    setEditData((prev) => {
      const cur = new Set(prev.etiquetaIds);
      cur.has(id) ? cur.delete(id) : cur.add(id);
      const newEtiquetaIds = Array.from(cur);
      const newEtiquetas = newEtiquetaIds
        .map((eid) => tags[eid])
        .filter(Boolean);
      return { ...prev, etiquetaIds: newEtiquetaIds, etiquetas: newEtiquetas };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await apiUpdateTask(task.id, {
        titulo: editData.titulo,
        description: editData.description,
        data: editData.data,
        prazo: editData.prazo,
        status: editData.status,
        userIds: editData.userIds,
        etiquetaIds: editData.etiquetaIds,
        // projectId: editData.projectId, // se quiser permitir edição de projeto no futuro
      });
      onTaskUpdated(updated);
      setEditMode(false);
    } catch (e: any) {
      alert(e.message || "Erro ao atualizar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;
    setLoading(true);
    try {
      await apiDeleteTask(task.id);
      onTaskDeleted(task.id);
      onClose();
    } catch {
      alert("Erro ao excluir tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !loggedUser?.id) return;
    setCommentLoading(true);
    try {
      const backendComment = await apiAddComment(
        task.id,
        commentText.trim(),
        loggedUser.id
      );
      const newComment: FrontendComment = {
        id: backendComment.id,
        author: backendComment.user?.nome || "Desconhecido",
        date: backendComment.createdAt,
        text: backendComment.comment,
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (e: any) {
      alert(e.message || "Erro ao adicionar comentário");
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {editMode ? "Editar Tarefa" : task.titulo}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {editMode ? (
          <>
            <input
              name="titulo"
              value={editData.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-sm"
            />

            <textarea
              name="description"
              value={editData.description ?? ""}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-sm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Data de início
                </label>
                <input
                  type="date"
                  name="data"
                  value={editData.data ? editData.data.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Prazo
                </label>
                <input
                  type="date"
                  name="prazo"
                  value={editData.prazo ? editData.prazo.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Responsáveis
              </span>
              <div className="flex flex-wrap gap-2">
                {users.map((u) => {
                  const sel = editData.userIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u.id)}
                      className={`px-3 py-1 rounded-full border text-xs ${
                        sel ? "bg-indigo-600 text-white" : "bg-white text-gray-700"
                      }`}
                    >
                      {u.nome}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.values(tags).map((tag) => {
                  const sel = editData.etiquetaIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full border text-xs ${
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

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditMode(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                Salvar
              </button>
            </div>
          </>
        ) : (
          <>
            {task.description && (
              <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">
                {linkifyText(task.description)}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Início: </span>
                {task.data
                  ? new Date(task.data).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })
                  : "—"}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Prazo: </span>
                {task.prazo
                  ? new Date(task.prazo).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })
                  : "—"}
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-600">
                  Responsáveis:{" "}
                </span>
                {task.users && task.users.length > 0
                  ? task.users.map((u) => u.nome).join(", ")
                  : "Nenhum"}
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-600">
                  Projeto:{" "}
                </span>
                {task.projectName || "—"}
              </div>
            </div>

            <TaskTags etiquetas={task.etiquetas} />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm flex items-center gap-2 hover:bg-yellow-600"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm flex items-center gap-2 hover:bg-red-700"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare size={16} /> Comentários
              </h4>

              <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
                {comments.length === 0 && (
                  <p className="text-xs text-gray-500 italic">
                    Nenhum comentário.
                  </p>
                )}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <p className="text-xs font-semibold text-gray-800">
                      {c.author}{" "}
                      <span className="text-[10px] text-gray-500 ml-1">
                        {new Date(c.date).toLocaleString("pt-BR")}
                      </span>
                    </p>
                    <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">
                      {linkifyText(c.text)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !commentLoading &&
                    handleAddComment()
                  }
                  placeholder="Adicionar comentário..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs"
                  disabled={commentLoading}
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md text-xs flex items-center gap-1 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {commentLoading && (
                    <Loader2 className="animate-spin h-3 w-3" />
                  )}
                  Enviar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ======================== MODAL: GERIR ETIQUETAS ========================

const ManageTagsModal = ({
  isOpen,
  onClose,
  tags,
  onTagsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  tags: Record<string, Tag>;
  onTagsChange: (t: Record<string, Tag>) => void;
}) => {
  const [nome, setNome] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);

  const handleAddTag = async () => {
    if (!nome.trim()) return;
    setLoading(true);
    try {
      const newTag = await apiCreateTag({ nome: nome.trim(), color });
      onTagsChange({ ...tags, [newTag.id]: newTag });
      setNome("");
      setColor("#3B82F6");
    } catch {
      alert("Erro ao criar etiqueta");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Excluir etiqueta?")) return;
    try {
      await apiDeleteTag(id);
      const copy = { ...tags };
      delete copy[id];
      onTagsChange(copy);
    } catch {
      alert("Erro ao excluir etiqueta");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Gerir Etiquetas
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da etiqueta"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Cor
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            disabled={loading || !nome.trim()}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded-md flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            Adicionar
          </button>
        </div>

        <div className="space-y-2">
          {Object.values(tags).length === 0 && (
            <p className="text-xs text-gray-500 italic">
              Nenhuma etiqueta criada.
            </p>
          )}
          {Object.values(tags).map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm text-gray-800">{tag.nome}</span>
              </div>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== DND WRAPPERS ========================

const DroppableColumn = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[120px]">
      {children}
    </div>
  );
};

const SortableTaskCard = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: (t: Task) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
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

// ======================== PÁGINA PRINCIPAL ========================

type TaskOwnerFilter = "all" | "mine" | "general";

const TaskBoardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // projectId vindo da URL: /tasks?projectId=uuid
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const projectId = searchParams.get("projectId");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<string>("a fazer");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [showManageTags, setShowManageTags] = useState(false);

  // ======= ESTADOS DE FILTRO =======
  const [taskOwnerFilter, setTaskOwnerFilter] = useState<TaskOwnerFilter>("all");
  const [tagFilterIds, setTagFilterIds] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const columns = ["a fazer", "em andamento", "em revisão", "concluído"];

  const loadTasksForProject = async (projId: string | null) => {
    const raw = await apiGetTasksRaw();
    const normalized: Task[] = raw.map((t) => normalizeTask(t));

    let projectTasks = normalized;

    if (projId) {
      projectTasks = normalized.filter((t) => t.projectId === projId);
    }

    setTasks(projectTasks);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, tagsRes] = await Promise.all([
          apiGetUsers(),
          apiGetTags(),
        ]);

        setUsers(usersRes);
        setTags(transformTagsArrayToObject(tagsRes));

        await loadTasksForProject(projectId);
      } catch (e: any) {
        setError(e.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const handleDragStart = (evt: DragStartEvent) => {
    setDraggingId(String(evt.active.id));
  };

  const handleDragEnd = async (evt: DragEndEvent) => {
    const { active, over } = evt;
    setDraggingId(null);
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    const overTask = tasks.find((t) => t.id === overId);
    const newStatus = overTask ? overTask.status : overId;

    if (!columns.includes(newStatus)) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await apiUpdateTask(taskId, { status: newStatus });
    } catch {
      // se falhar, recarrega tasks daquele projeto
      await loadTasksForProject(projectId);
    }
  };

  const handleTaskCreated = (t: Task) => {
    // garante que a tarefa criada pertence ao projeto atual
    if (!projectId || t.projectId === projectId) {
      setTasks((prev) => [...prev, t]);
    }
  };

  const handleTaskUpdated = (t: Task) => {
    setTasks((prev) =>
      prev.map((x) => (x.id === t.id ? t : x))
    );
    setSelectedTask(t);
  };

  const handleTaskDeleted = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ======= LÓGICA DE FILTRO =======
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1) filtro por dono
    if (taskOwnerFilter === "mine" && user?.id) {
      result = result.filter((t) => {
        const userIds = t.userIds ?? [];
        const usersArr = t.users ?? [];
        return (
          userIds.includes(user.id) ||
          usersArr.some((u) => u.id === user.id)
        );
      });
    } else if (taskOwnerFilter === "general") {
      // tarefas gerais: sem responsáveis
      result = result.filter((t) => {
        const userIds = t.userIds ?? [];
        const usersArr = t.users ?? [];
        return (userIds.length === 0) && (usersArr.length === 0);
      });
    }

    // 2) filtro por etiquetas
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
  }, [tasks, taskOwnerFilter, tagFilterIds, user?.id]);

  const toggleTagFilter = (id: string) => {
    setTagFilterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setTaskOwnerFilter("all");
    setTagFilterIds([]);
  };

  const projectTitle = useMemo(() => {
    if (projectId) {
      const withName = tasks.find((t) => t.projectName);
      if (withName?.projectName) return withName.projectName;
      return "Projeto selecionado";
    }
    return "Geral / Todos os projetos";
  }, [projectId, tasks]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-sm hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Quadro de Tarefas
            </h2>
            <p className="text-sm text-gray-600">
              {projectId ? `Projeto: ${projectTitle}` : projectTitle}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowManageTags(true)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <Settings size={16} />
              Etiquetas
            </button>
            <button
              onClick={() => {
                setNewTaskStatus("a fazer");
                setShowNewTaskModal(true);
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md text-xs sm:text-sm flex items-center gap-2 hover:bg-indigo-700"
            >
              <PlusCircle size={16} />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* ======= BARRA DE FILTROS ======= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700">
              Mostrar:
            </span>
            <select
              value={taskOwnerFilter}
              onChange={(e) => setTaskOwnerFilter(e.target.value as TaskOwnerFilter)}
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
              {Object.values(tags).map((tag) => {
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const tasksInColumn = filteredTasks.filter(
              (t) => t.status === col
            );
            return (
              <div
                key={col}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 capitalize">
                    {col}{" "}
                    <span className="text-xs text-gray-500">
                      ({tasksInColumn.length})
                    </span>
                  </h3>
                  <button
                    onClick={() => {
                      setNewTaskStatus(col);
                      setShowNewTaskModal(true);
                    }}
                    className="text-gray-400 hover:text-indigo-600"
                    title="Nova tarefa nesta coluna"
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>

                <DroppableColumn id={col}>
                  <SortableContext
                    items={tasksInColumn.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasksInColumn.map((t) => (
                      <SortableTaskCard
                        key={t.id}
                        task={t}
                        onClick={(task) => setSelectedTask(task)}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </DndContext>

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        users={users}
        allTags={tags}
        onTaskCreated={handleTaskCreated}
        targetStatus={newTaskStatus}
        projectId={projectId}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          users={users}
          tags={tags}
        />
      )}

      <ManageTagsModal
        isOpen={showManageTags}
        onClose={() => setShowManageTags(false)}
        tags={tags}
        onTagsChange={setTags}
      />
    </div>
  );
};

export default TaskBoardPage;
