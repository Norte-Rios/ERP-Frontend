import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
// CORREÇÃO 1: Importar apenas 'User'
import { User } from './types'; 

// Modal Component
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'lastLogin'> | User) => Promise<void>; 
  userToEdit: User | null;
  loading: boolean;
}

// CORREÇÃO 2: Definir o tipo do FormData extraindo os tipos de 'User'
interface ModalFormData {
  nome: string;
  email: string;
  role: User['role']; // <-- Extrai o tipo 'role' diretamente de 'User'
  status: User['status']; // <-- Extrai o tipo 'status' diretamente de 'User'
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  loading,
}) => {
  // CORREÇÃO 3: Usar os valores corretos (com maiúsculas) no estado inicial
  const [formData, setFormData] = useState<ModalFormData>({
    nome: '',
    email: '',
    role: 'Client', // Valor padrão (com 'C' maiúsculo, como no seu tipo)
    status: 'ativo',
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        nome: userToEdit.nome,
        email: userToEdit.email,
        role: userToEdit.role, // Agora os tipos batem
        status: userToEdit.status, // Agora os tipos batem
      });
    } else {
      // Reset para valores padrão ao criar novo
      setFormData({
        nome: '',
        email: '',
        role: 'Client', // Valor padrão (com 'C' maiúsculo)
        status: 'ativo',
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Força a tipagem correta no handleChange
    if (name === 'role') {
      setFormData((prev) => ({ ...prev, [name]: value as User['role'] }));
    } else if (name === 'status') {
      setFormData((prev) => ({ ...prev, [name]: value as User['status'] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) {
      alert('Nome e Email são obrigatórios.');
      return;
    }

    // O formData agora está 100% correto e é seguro para enviar.
    const userDataToSend = userToEdit
      ? { ...userToEdit, ...formData }
      : formData;

    try {
      // O tipo de 'userDataToSend' agora bate com o tipo esperado por 'onSave'
      await onSave(userDataToSend);
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
            {/* CORREÇÃO 4: Os 'value' das options devem bater EXATAMENTE com o TIPO */}
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full input-style"
            >
              <option value="admin master">Admin Master</option>
              <option value="Admin comum">Admin</option> {/* <-- Corrigido */}
              <option value="operational">Operational</option>
              <option value="Consultant">Consultant</option> {/* <-- Corrigido */}
              <option value="Client">Client</option> {/* <-- Corrigido */}
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