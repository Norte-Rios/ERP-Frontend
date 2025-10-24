import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, CheckSquare, LogOut, Calendar, Video, Users, Home, Briefcase } from 'lucide-react'; // Adicionado Home e Briefcase

const Sidebar = () => {
  // Estado para controlar qual menu está aberto
  const [openMenu, setOpenMenu] = useState<string | null>(null); // ALTERADO: Começa fechado

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand-green-light text-white' : ''
    }`;

  // Componente para o sub-menu expansível
  const SubMenu = ({ title, children, name, isOpen, setOpen }) => (
    <div>
      <button
        onClick={() => setOpen(isOpen ? null : name)}
        className="w-full flex justify-between items-center px-4 py-3 text-gray-200 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200"
      >
        <span className="font-semibold">{title}</span>
        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {/* Container que expande e colapsa */}
      <div className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="py-2 space-y-2">
            {children}
        </div>
      </div>
    </div>
  );


  return (
    <aside className="w-64 bg-brand-green-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 border-b border-brand-green-light/30">
        <img src="/norte-logo.png" alt="Logótipo Norte Rios" className="h-16 mx-auto" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">

        {/* ALTERAÇÃO: Link direto para o Dashboard adicionado */}
        <NavLink to="/dashboard" end className={navLinkClass}>
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>

        {/* Grupo Operacional */}
        <SubMenu title="Operacional" name="operacional" isOpen={openMenu === 'operacional'} setOpen={setOpenMenu}>
            <NavLink to="/tasks" className={navLinkClass}>
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
        </SubMenu>

        {/* Grupo Cadastros - ALTERADO: Removidos Clientes e Consultores */}
        <SubMenu title="Cadastros" name="cadastros" isOpen={openMenu === 'cadastros'} setOpen={setOpenMenu}>
            <NavLink to="/users" className={navLinkClass}>
              <Users className="mr-3 h-5 w-5" />
              Usuários
            </NavLink>
             {/* Adicionar outros links de cadastro aqui */}
        </SubMenu>

        {/* Outros Grupos (Ex: Financeiro, Documentos, Contratos) */}
        {/* Adicione SubMenus ou NavLinks diretos conforme necessário */}

      </nav>

      {/* Perfil do Utilizador e Sair */}
      <div className="px-4 py-4 border-t border-brand-green-light/30 mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
            <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Avatar do Utilizador"
                className="h-10 w-10 rounded-full"
            />
            <div>
                {/* Idealmente buscar o nome/email do usuário logado */}
                <p className="font-semibold text-sm text-white">Admin</p>
                <p className="text-xs text-gray-300">admin@exemplo.com</p>
            </div>
        </div>
        <button className="w-full text-left flex items-center px-4 py-3 text-gray-300 hover:bg-brand-green-light/50 hover:text-white rounded-md transition-colors duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;