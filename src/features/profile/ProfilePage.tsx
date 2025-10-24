import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { User, Lock, Image, Loader2, AlertCircle, Save } from 'lucide-react';

// Componente de notificação
const Notification = ({ message, type, onClose }) => (
  <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
    <span>{message}</span>
    <button onClick={onClose} className="ml-4 font-bold">X</button>
  </div>
);

// Componente de aba
const Tab = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold border-b-2 ${
      isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {label}
  </button>
);

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth(); // Pega o usuário e a função de atualizar
  const [activeTab, setActiveTab] = useState('dados');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- Estados dos Formulários ---
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.email}`);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token'); // Pega o token para chamadas autenticadas

  // Efeito para carregar os dados atuais do usuário (GET /users/me)
  useEffect(() => {
    // Definimos os dados iniciais com base no AuthContext
    // O backend (GET /users/me) deve ser a fonte principal se precisarmos de mais dados
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      // Idealmente, buscaríamos o avatarUrl mais recente aqui
    }
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Funções de Submissão ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.patch(`${API_URL}/users/me`, { nome }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Atualiza o usuário no AuthContext
      setUser(response.data); 
      showNotification('Nome atualizado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Erro ao atualizar o nome.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('As novas palavras-passe não coincidem.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/users/me/password`, {
        currentPassword,
        newPassword,
        confirmPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Palavra-passe alterada com sucesso!', 'success');
      // Limpa os campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Erro ao alterar a palavra-passe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Mostra o preview
    }
  };

  const handleUploadAvatar = async (e: React.FormEvent) => {
     e.preventDefault();
    if (!avatarFile) {
      showNotification('Por favor, selecione um ficheiro.', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('avatar', avatarFile); // O backend deve esperar um campo 'avatar'
    setLoading(true);

    try {
       const response = await axios.post(`${API_URL}/users/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Atualiza o usuário no AuthContext com o novo avatar
      setUser(response.data); 
      showNotification('Foto de perfil atualizada!', 'success');
      setAvatarFile(null); // Limpa o ficheiro selecionado
    } catch (err) {
       console.error(err);
       showNotification(err.response?.data?.message || 'Erro ao enviar a foto.', 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <div className="container mx-auto p-4 md:p-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
        
        {/* Abas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <Tab label="Dados Pessoais" isActive={activeTab === 'dados'} onClick={() => setActiveTab('dados')} />
            <Tab label="Alterar Palavra-passe" isActive={activeTab === 'senha'} onClick={() => setActiveTab('senha')} />
            <Tab label="Foto de Perfil" isActive={activeTab === 'foto'} onClick={() => setActiveTab('foto')} />
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Aba: Dados Pessoais */}
          {activeTab === 'dados' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Dados Pessoais</h2>
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (não pode ser alterado)</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  readOnly
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </button>
            </form>
          )}

          {/* Aba: Alterar Palavra-passe */}
          {activeTab === 'senha' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Alterar Palavra-passe</h2>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Palavra-passe Atual</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Palavra-passe</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Nova Palavra-passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Alterar Palavra-passe
              </button>
            </form>
          )}

          {/* Aba: Foto de Perfil */}
          {activeTab === 'foto' && (
             <form onSubmit={handleUploadAvatar} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">Foto de Perfil</h2>
                <div className="flex items-center space-x-4">
                    <img 
                        src={avatarPreview} 
                        alt="Preview do Avatar" 
                        className="h-24 w-24 rounded-full object-cover bg-gray-200"
                    />
                    <input 
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleAvatarChange}
                        className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                    />
                </div>
                 <button
                    type="submit"
                    disabled={loading || !avatarFile}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image className="mr-2 h-4 w-4" />}
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