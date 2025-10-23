import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'consultant' | 'client' | 'operational' | 'admin master';
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ✅ HIDRATAÇÃO SÍNCRONA: Carrega do localStorage IMEDIATAMENTE no primeiro render
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        // Configura header imediatamente
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        console.log('✅ Usuário hidratado do localStorage:', parsed.email);
        return parsed;
      } catch (err) {
        console.error('Erro ao parsear user do localStorage:', err);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    return null;
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // ✅ INTERCEPTOR 401 (logout automático se token inválido)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err.response?.status === 401 && window.location.pathname !== '/login') {
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  // ✅ ATUALIZA HEADER QUANDO USER MUDA
  useEffect(() => {
    if (user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // ✅ REDIRECIONAMENTO PÓS-LOGIN
  useEffect(() => {
    if (user && isLoggingIn) {
      const role = user.role.toLowerCase();
      const map: Record<string, string> = {
        admin: '/',
        'admin master': '/',
        consultant: '/consultant/dashboard',
        client: '/client/dashboard',
        operational: '/operational/tasks',
      };
      navigate(map[role] ?? '/');
      setIsLoggingIn(false);
    }
  }, [user, isLoggingIn, navigate]);

  // ✅ LOGIN
  const login = async (email: string, pass: string) => {
    setUser(null); // ✅ LIMPA USER ANTES DA REQUISIÇÃO (evita estados antigos)
    setIsLoggingIn(true);
    try {
      const { data }: { data: User } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password: pass,
      });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      console.log('✅ Login bem-sucedido:', data.email);
    } catch (e: any) {
      setIsLoggingIn(false);
      throw new Error(e.response?.data?.message ?? 'Utilizador ou palavra-passe inválidos.');
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsLoggingIn(false);
    navigate('/login', { replace: true });
  };

  const isAuthenticated = !!user;

  // ✅ SEM BLOQUEIO DE RENDER: Hidratação síncrona garante que user/isAuthenticated esteja correto no primeiro render
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated, 'location =', location.pathname); // ✅ LOG PARA DEBUG

  if (!isAuthenticated) {
    console.log('🔒 Redirecionando para /login de', location.pathname); // ✅ LOG PARA DEBUG
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};