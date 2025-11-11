import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { User, Lock, Image, Loader2, Save } from 'lucide-react';

// Componente de notificação
const Notification = ({ message, type, onClose }) => (
  <div className={`fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
    <span>{message}</span>
    <button onClick={onClose} className="ml-4 font-bold">X</button>
  </div>
);

// Componente de aba
const Tab = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold border-b-2 focus:outline-none ${
      isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dados');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form States
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token');

  // Helper para gerar URL do avatar do backend
  const getBackendAvatarUrl = (userId?: string) => {
    if (!userId) return undefined;
    return `${API_URL}/users/${userId}/avatar?v=${avatarVersion}`;
  };

  // Effect to load current user data
  useEffect(() => {
    console.log('ProfilePage: useEffect triggered with user:', user);
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      const backendUrl = getBackendAvatarUrl(user.id);
      console.log('ProfilePage: Setting avatar preview URL:', backendUrl);
      setAvatarPreview(backendUrl);
    } else {
      console.warn('ProfilePage: User data not available on component mount.');
      setAvatarPreview(undefined);
    }
  }, [user, avatarVersion]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showNotification('Erro: ID do usuário não encontrado.', 'error');
      return;
    }
    if (!nome.trim()) {
      showNotification('O nome não pode estar vazio.', 'error');
      return;
    }
    setLoading(true);
    try {
      console.log('ProfilePage: Enviando PATCH para atualizar nome:', { nome });
      const response = await axios.patch(
        `${API_URL}/users/${user.id}`,
        { nome },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log('ProfilePage: Resposta do backend:', response.data);
      const updatedUser = { ...user, nome: response.data.nome || nome };
      console.log('ProfilePage: Updated user:', updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser); // Atualiza o AuthContext
      setNome(response.data.nome || nome);
      showNotification('Nome atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('ProfilePage: Erro ao atualizar nome:', err.response?.data || err.message);
      showNotification(err.response?.data?.message || 'Erro ao atualizar o nome.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showNotification('Erro: ID do usuário não encontrado.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('As novas palavras-passe não coincidem.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    setLoading(true);
    try {
      console.log('ProfilePage: Tentando verificar a senha atual...');
      await axios.post(
        `${API_URL}/auth/verify-password`,
        { userId: user.id, currentPassword },
      );
      console.log('ProfilePage: Senha atual verificada com sucesso.');

      console.log('ProfilePage: Tentando atualizar para a nova senha...');
      await axios.patch(
        `${API_URL}/users/${user.id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log('ProfilePage: Nova senha atualizada com sucesso no backend.');

      showNotification('Palavra-passe alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('ProfilePage: Erro no processo de alteração de senha:', err.response?.data || err.message);
      showNotification(err.response?.data?.message || 'Erro ao alterar a palavra-passe. Verifique a senha atual.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showNotification('O arquivo deve ter no máximo 5MB.', 'error');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showNotification('Apenas arquivos PNG e JPEG são permitidos.', 'error');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) {
      showNotification('Por favor, selecione um ficheiro.', 'error');
      return;
    }
    if (!user?.id) {
      showNotification('Erro: ID do usuário não encontrado.', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    setLoading(true);
    try {
      console.log('ProfilePage: Enviando PATCH para atualizar avatar');
      const response = await axios.patch(`${API_URL}/users/${user.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('ProfilePage: Resposta do backend (avatar):', response.data);
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser); // Atualiza o AuthContext
      showNotification('Foto de perfil atualizada!', 'success');
      setAvatarFile(null);
      setAvatarVersion(prev => prev + 1);
    } catch (err: any) {
      console.error('ProfilePage: Erro ao enviar avatar:', err.response?.data || err.message);
      showNotification(err.response?.data?.message || 'Erro ao enviar a foto.', 'error');
      setAvatarPreview(getBackendAvatarUrl(user.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <div className="container mx-auto p-4 md:p-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <Tab label="Dados Pessoais" isActive={activeTab === 'dados'} onClick={() => setActiveTab('dados')} />
            <Tab label="Alterar Palavra-passe" isActive={activeTab === 'senha'} onClick={() => setActiveTab('senha')} />
            <Tab label="Foto de Perfil" isActive={activeTab === 'foto'} onClick={() => setActiveTab('foto')} />
          </nav>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === 'dados' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 flex items-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Salvar
              </button>
            </form>
          )}
          {activeTab === 'senha' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 flex items-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Lock className="h-5 w-5 mr-2" />}
                Alterar Senha
              </button>
            </form>
          )}
          {activeTab === 'foto' && (
            <form onSubmit={handleUploadAvatar} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Foto de Perfil</h2>
              <div className="flex items-center space-x-4">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || user?.email || '?')}&background=random`}
                  alt="Preview do Avatar"
                  onError={(e) => {
                    console.error('ProfilePage: Erro ao carregar imagem do avatar:', avatarPreview);
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || user?.email || '?')}&background=random&color=fff`;
                  }}
                  className="h-24 w-24 rounded-full object-cover bg-gray-200 ring-1 ring-gray-300"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center"
                >
                  <Image className="h-5 w-5 mr-2" />
                  Escolher Imagem
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                </label>
              </div>
              {avatarFile && <p className="text-sm text-gray-600">Ficheiro selecionado: {avatarFile.name}</p>}
              <button
                type="submit"
                disabled={loading || !avatarFile}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 flex items-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Salvar Foto
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;