import React, { createContext, useState, useContext } from 'react';

// A interface User será definida pelo backend. Por agora, usamos uma base.
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Consultant' | 'Client' | 'Operational';
  token: string; // O backend deverá enviar um token JWT
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Esta função irá chamar o backend para fazer o login
  const login = async (email: string, pass: string) => {
    // Para o programador do backend:
    // 1. Fazer uma requisição POST para o endpoint de login (ex: /api/auth/login)
    //    com 'email' e 'pass' no corpo da requisição.
    // 2. O backend deve validar as credenciais.
    // 3. Se for válido, o backend deve retornar os dados do usuário (id, nome, email, role)
    //    e um token de autenticação (JWT).
    
    console.log("Enviando para o backend:", { email, pass });
    
    // Simulação da resposta do backend
    const fakeBackendResponse = {
      id: 'USR-001',
      name: 'Utilizador de Teste',
      email: email,
      role: 'Admin' as User['role'],
      token: 'fake-jwt-token'
    };
    
    // Se a autenticação for bem-sucedida:
    setUser(fakeBackendResponse);
    
    // Se a autenticação falhar, deve-se lançar um erro:
    // throw new Error('Utilizador ou palavra-passe inválidos.');
  };

  // Esta função irá limpar os dados do usuário
  const logout = () => {
    // Para o programador do backend:
    // Opcionalmente, pode-se fazer uma chamada para um endpoint de logout
    // para invalidar o token no servidor.
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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