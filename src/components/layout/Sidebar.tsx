// src/layout/Sidebar.tsx

// ATUALIZADO: Importa useState, useEffect e useNavigate
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  CheckSquare,
  LogOut,
  Calendar,
  Video,
  Users,
  Home,
  Briefcase,
  User as UserIcon,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_PROJECTS_URL = `${API_URL}/projects`;

type Project = {
  id: string;
  nome: string;
  description?: string | null;
  criador?: { id: string; nome: string };
};

const SubMenu = ({ title, children, name, isOpen, setOpen }) => (
  <div>
    <button
      onClick={() => setOpen(isOpen ? null : name)}
      className="w-full flex justify-between items-center px-4 py-3 text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200"
    >
      <span className="font-semibold">{title}</span>
      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div
      className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96' : 'max-h-0'
      }`}
    >
      <div className="py-2 space-y-2">{children}</div>
    </div>
  </div>
);

// --------- MODAL NOVO PROJETO ----------
interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
  currentUserId?: string;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  currentUserId,
}) => {
  const [nome, setNome] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNome('');
      setDescription('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nome.trim()) {
      setError('Nome do projeto é obrigatório');
      return;
    }
    if (!currentUserId) {
      setError('Usuário não identificado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_PROJECTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          description: description.trim() || null,
          criadorId: currentUserId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message || 'Erro ao criar projeto';
        throw new Error(msg);
      }

      const project: Project = await res.json();
      onCreated(project);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erro ao criar projeto');
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
          <h3 className="text-lg font-bold text-gray-800">Novo Projeto</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do projeto
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Ex.: Projeto Tucuruí"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Breve descrição do projeto..."
              disabled={loading}
            />
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
            disabled={loading || !nome.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

// --------- SIDEBAR ----------
const Sidebar = () => {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- AVATAR ---
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = user?.id ? `${API_URL}/users/${user.id}/avatar` : null;

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

  // --- PROJETOS ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [generalProjectId, setGeneralProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await fetch(API_PROJECTS_URL);
        if (!res.ok) {
          throw new Error(`GET /projects ${res.status}`);
        }
        const data: Project[] = await res.json();
        setProjects(data);

        const geral = data.find(
          (p) => p.nome.toLowerCase() === 'geral'
        );
        if (geral) {
          setGeneralProjectId(geral.id);
        }
      } catch (e) {
        console.error('Erro ao carregar projetos', e);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [...prev, project]);
    if (!generalProjectId && project.nome.toLowerCase() === 'geral') {
      setGeneralProjectId(project.id);
    }
    // Navega direto para o quadro Kanban desse projeto
    navigate(`/tasks?projectId=${project.id}`);
  };

  const otherProjects = projects.filter(
    (p) => !generalProjectId || p.id !== generalProjectId
  );

  return (
    <>
      <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
        <div className="px-6 py-4 border-b border-brand-green-light/30">
          <img src="/norte-logo.png" alt="Logótipo Norte Rios" className="h-16 mx-auto" />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {/* Dashboard */}
          <NavLink to="/dashboard" end className={navLinkClass}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>

          {/* Operacional */}
          <SubMenu title="Operacional" name="operacional" isOpen={openMenu === 'operacional'} setOpen={setOpenMenu}>
            {/* Tarefas = PROJETO GERAL */}
            <NavLink
              to={
                generalProjectId
                  ? `/tasks?projectId=${generalProjectId}`
                  : '/tasks'
              }
              className={navLinkClass}
            >
              <CheckSquare className="mr-3 h-5 w-5" />
              Tarefas
            </NavLink>

            <NavLink to="/agenda" className={navLinkClass}>
              <Calendar className="mr-3 h-5 w-5" />
              Agenda
            </NavLink>
            <NavLink to="/meet" className={navLinkClass}>
              <Video className="mr-3 h-5 w-5" />
              Meet
            </NavLink>

            {/* Lista de Projetos */}
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between px-4 mb-1">
                <span className="text-xs uppercase tracking-wide text-gray-300">
                  Projetos
                </span>
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(true)}
                  className="text-xs flex items-center gap-1 text-gray-200 hover:text-white"
                  title="Novo projeto"
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>

              {loadingProjects && (
                <p className="px-4 text-xs text-gray-300 italic">
                  Carregando projetos...
                </p>
              )}

              {!loadingProjects && otherProjects.length === 0 && (
                <p className="px-4 text-xs text-gray-400 italic">
                  Nenhum projeto além do Geral.
                </p>
              )}

              <div className="space-y-1 mt-1">
                {otherProjects.map((project) => (
                  <NavLink
                    key={project.id}
                    to={`/tasks?projectId=${project.id}`}
                    className={navLinkClass}
                  >
                    <Briefcase className="mr-3 h-5 w-5" />
                    {project.nome}
                  </NavLink>
                ))}
              </div>
            </div>
          </SubMenu>

          {/* Cadastros */}
          <SubMenu title="Cadastros" name="cadastros" isOpen={openMenu === 'cadastros'} setOpen={setOpenMenu}>
            <NavLink to="/users" className={navLinkClass}>
              <Users className="mr-3 h-5 w-5" />
              Usuários
            </NavLink>
          </SubMenu>
        </nav>

        {/* Perfil + Sair */}
        <div className="px-4 py-4 border-t border-brand-green-light/30 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt="Avatar do Utilizador"
                className="h-10 w-10 rounded-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-brand-green-light flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            )}

            <div>
              <p className="font-semibold text-sm text-white">{user?.nome || 'Utilizador'}</p>
              <p className="text-xs text-gray-300">{user?.email || 'email@exemplo.com'}</p>
            </div>
          </div>

          <NavLink to="/profile" className={navLinkClass}>
            <UserIcon className="mr-3 h-5 w-5" />
            Meu Perfil
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreated={handleProjectCreated}
        currentUserId={user?.id}
      />
    </>
  );
};

export default Sidebar;
