import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User } from './types'; // Certifique-se que o tipo User está correto aqui

// Modal Component
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // A função onSave agora recebe o objeto User completo ou parcial
  onSave: (user: Omit<User, 'id' | 'lastLogin'> | User) => Promise<void>; // Tornada async
  userToEdit: User | null;
  loading: boolean; // Adicionado para feedback
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    // Use os valores exatos da sua interface User['role']
    role: 'client' as User['role'],
    // [CORREÇÃO] Use os valores esperados pelo backend ('ativo'/'inativo') como valor inicial
    status: 'ativo' as User['status'],
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        nome: userToEdit.nome,
        email: userToEdit.email,
        role: userToEdit.role,
        // [CORREÇÃO] Garanta que o status vindo do userToEdit seja 'ativo' ou 'inativo'
        status:
          userToEdit.status === 'Active'
            ? 'ativo'
            : userToEdit.status === 'Inactive'
            ? 'inativo'
            : 'ativo',
      });
    } else {
      // Reset para valores padrão ao criar novo
      setFormData({
        nome: '',
        email: '',
        role: 'client', // Valor padrão
        status: 'ativo', // Valor padrão (esperado pelo backend)
      });
    }
  }, [userToEdit, isOpen]); // Roda quando abre ou muda o user a editar

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) {
      alert('Nome e Email são obrigatórios.');
      return;
    }

    const statusToSend =
      formData.status === 'Active'
        ? 'ativo'
        : formData.status === 'Inactive'
        ? 'inativo'
        : formData.status;

    const userDataToSend = userToEdit
      ? { ...userToEdit, ...formData, status: statusToSend }
      : { ...formData, status: statusToSend };

    try {
      await onSave(userDataToSend);
      // onClose(); // O pai deve chamar onClose após sucesso
    } catch (error) {
      console.error('Erro no handleSave do modal:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {userToEdit ? 'Editar Utilizador' : 'Novo Utilizador'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="nome"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="mt-1 block w-full input-style"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full input-style"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Perfil
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full input-style"
            >
              <option value="admin master">Admin Master</option>
              <option value="admin comum">Admin</option>
              <option value="operational">Operational</option>
              <option value="consultant">Consultant</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full input-style"
            >
              <option value="ativo">Active</option>
              <option value="inativo">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:opacity-50"
          >
            {loading
              ? userToEdit
                ? 'Atualizando...'
                : 'Criando...'
              : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
