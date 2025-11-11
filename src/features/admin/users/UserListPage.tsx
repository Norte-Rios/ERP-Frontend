import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { User } from './types';
import UserModal from './UserModal';
import axios from 'axios'; // Importe axios para API calls

const API_URL = import.meta.env.VITE_BACKEND_URL; // Assumindo que você tem isso no .env para base URL

interface UserListPageProps {
  // Removido props mocks; agora fetcha do backend
}

const getStatusClass = (status: User['status']) => {
  switch (status) {
    // CORREÇÃO 1: Mudar de 'active' para 'ativo'
    case 'ativo': return 'bg-green-100 text-green-800';
    // CORREÇÃO 2: Mudar de 'inactive' para 'inativo'
    case 'inativo': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const UserListPage: React.FC<UserListPageProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch de todos usuários (GET /users)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/users`);
        setUsers(response.data); // Backend retorna User[]
      } catch (err: any) {
        console.error('Erro ao buscar usuários:', err);
        setError(err.response?.data?.message || 'Erro ao carregar usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Salvar/Atualizar usuário (POST /users ou PATCH /users/:id)
  const handleSaveUser = async (userData: Omit<User, 'id' | 'lastLogin'> | User) => {
    try {
      setLoading(true); // <-- Ativa o loading
      setError(null);
      if ('id' in userData) {
        // Update: PATCH /users/:id
        await axios.patch(`${API_URL}/users/${userData.id}`, userData);
      } else {
        // Create: POST /users
        await axios.post(`${API_URL}/users`, userData);
      }
      // Refetch após salvar
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
      handleCloseModal();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.response?.data?.message || 'Erro ao salvar usuário.');
    } finally {
      setLoading(false); // <-- Desativa o loading
    }
  };

  // ✅ Deletar usuário (DELETE /users/:id)
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${API_URL}/users/${userToDelete.id}`);
        // Refetch após deletar
        const response = await axios.get(`${API_URL}/users`);
        setUsers(response.data);
        setUserToDelete(null);
      } catch (err: any) {
        console.error('Erro ao deletar usuário:', err);
        setError(err.response?.data?.message || 'Erro ao deletar usuário.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  // ✅ Loading e Error States
  if (loading && users.length === 0) { // Modificado para só mostrar loading total na primeira carga
    return <div className="container mx-auto p-8 text-center">Carregando usuários...</div>;
  }

  if (error && users.length === 0) { // Modificado para só mostrar erro fatal se não houver dados
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
          <button onClick={() => window.location.reload()} className="ml-4 text-red-700 underline">Recarregar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        loading={loading} // <-- CORREÇÃO 3: Prop 'loading' adicionada
      />
       {/* Modal de Confirmação de Exclusão */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="text-gray-600 mt-4">
              Tem a certeza de que deseja apagar o utilizador "{userToDelete.nome}"? Esta ação não pode ser desfeita.
            </p>
            {/* Mostra erro de delete aqui */}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={loading} // Desabilita no loading
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading} // Desabilita no loading
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold disabled:opacity-50"
              >
                {loading ? 'Apagando...' : 'Apagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registo de Utilizadores</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold flex items-center gap-2">
            <PlusCircle size={18} />
            Novo Utilizador
        </button>
      </div>

      {/* Mostra erro não-fatal (ex: falha ao salvar) acima da tabela */}
      {error && users.length > 0 && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">&times;</button>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Perfil</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-medium">{user.nome}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{user.email}</p>
                </td>
                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{user.role}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <button onClick={() => handleOpenEditModal(user)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                    Editar
                  </button>
                   <button onClick={() => setUserToDelete(user)} className="ml-4 text-red-600 hover:text-red-900 font-semibold">
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;