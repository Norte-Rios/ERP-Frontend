import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Importar axios

const API_URL = import.meta.env.VITE_BACKEND_URL;

// 2. Interface User CORRIGIDA
export interface User {
  id: string;
  nome: string; // Corrigido de 'name'
  email: string;
  // Corrigido para letras minúsculas (como no backend)
  role: 'admin' | 'consultant' | 'client' | 'operational' | 'admin master';
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começa true
  
  // 3. Estado para corrigir o redirecionamento
  const [isLoggingIn, setIsLoggingIn] = useState(false); 
  
  const navigate = useNavigate();

  // useEffect de carregamento inicial (lê o localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user'); // Limpa se o JSON for inválido
      }
    }
    setLoading(false); // Termina o loading inicial
  }, []); // Array vazio garante que rode só uma vez

  // 4. useEffect que cuida da NAVEGAÇÃO PÓS-LOGIN
  useEffect(() => {
    // Só navega se o 'user' existir E se estávamos no processo de login
    if (user && isLoggingIn) {
      console.log('useEffect (Navegação): Usuário atualizado. Navegando com role:', user.role);
      
      const role = user.role.toLowerCase();

      switch (role) {
        case 'admin':
        case 'admin master':
          navigate('/');
          break;
        case 'consultant':
          navigate('/consultant/dashboard');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        case 'operational':
          navigate('/operational/tasks');
          break;
        default:
          navigate('/');
      }
      setIsLoggingIn(false); // Reseta o estado
    }
  }, [user, isLoggingIn, navigate]); // Dependências

  // 5. Função LOGIN (apenas a versão axios)
  const login = async (email: string, pass: string) => {
    console.log("Tentativa de login com:", { email, pass });
    setLoading(true);
    setIsLoggingIn(true); // Avisa que estamos iniciando o login

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email,
        password: pass,
      });

      const userData: User = response.data;

      // Apenas atualiza o estado e o localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // O 'navigate' foi removido daqui (o useEffect cuida disso)

    } catch (error) {
      console.error('Falha no login:', error);
      setIsLoggingIn(false); // Reseta se o login falhar
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Utilizador ou palavra-passe inválidos.');
      }
      throw new Error('Utilizador ou palavra-passe inválidos.');
    } finally {
      // O setLoading(false) é vital para o ProtectedRoute
      setLoading(false);
    }
  };

  // Esta função está correta
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsLoggingIn(false);
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {/* Renderiza os filhos SÓ DEPOIS do loading inicial.
        Isso impede que o AppRoutes tente renderizar
        antes do 'user' ser carregado do localStorage.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado (está correto)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};