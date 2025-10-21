import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// A interface User será definida pelo backend. Por agora, usamos uma base.
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Consultant' | 'Client' | 'Operational' | 'Admin Master';
  token: string; // O backend deverá enviar um token JWT
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

// Dados de utilizadores de demonstração
const mockUsers = {
  'admin@norterios.com': { id: 'USR-001', name: 'Admin Master', role: 'Admin Master', email: 'admin@norterios.com' },
  'carlos.silva@consultoria.com': { id: 'CON-001', name: 'Carlos Silva', role: 'Consultant', email: 'carlos.silva@consultoria.com' },
  'carlos.andrade@techsolutions.com': { id: 'C01', name: 'Carlos Andrade', role: 'Client', email: 'carlos.andrade@techsolutions.com' },
  'sued.silva@norterios.com': { id: 'USR-003', name: 'Sued Silva', role: 'Operational', email: 'sued.silva@norterios.com' }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

   useEffect(() => {
    // Simula a verificação do token ao carregar a página
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Esta função irá chamar o backend para fazer o login
  const login = async (email: string, pass: string) => {
    console.log("Tentativa de login com:", { email, pass });

    const matchedUser = mockUsers[email];

    // Simulação de validação de senha
    const isPasswordValid = 
      (email === 'admin@norterios.com' && pass === 'admin123') ||
      (email === 'carlos.silva@consultoria.com' && pass === 'consultor123') ||
      (email === 'carlos.andrade@techsolutions.com' && pass === 'cliente123') ||
      (email === 'sued.silva@norterios.com' && pass === 'operacional123');

    if (matchedUser && isPasswordValid) {
      const userData = {
        ...matchedUser,
        token: `fake-jwt-for-${matchedUser.id}`
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirecionamento baseado no perfil do utilizador
      switch (userData.role) {
        case 'Admin':
        case 'Admin Master':
          navigate('/');
          break;
        case 'Consultant':
          navigate('/consultant/dashboard');
          break;
        case 'Client':
          navigate('/client/dashboard');
          break;
        case 'Operational':
          navigate('/operational/tasks');
          break;
        default:
          navigate('/');
      }

    } else {
      throw new Error('Utilizador ou palavra-passe inválidos.');
    }
  };

  // Esta função irá limpar os dados do usuário
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};