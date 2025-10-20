import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User } from './types';

// Modal Component
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'lastLogin'> | User) => void;
  userToEdit: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Client' as User['role'],
    status: 'Active' as User['status'],
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Client' as User['role'],
        status: 'Active' as User['status'],
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const userData = userToEdit ? { ...userToEdit, ...formData } : formData;
    onSave(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{userToEdit ? 'Editar Utilizador' : 'Novo Utilizador'}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Perfil</label>
            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full input-style">
              <option>Admin Master</option>
              <option>Admin</option>
              <option>Operational</option>
              <option>Consultant</option>
              <option>Client</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full input-style">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;