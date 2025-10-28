import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'recover' | 'success'>('login');
  const { login } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/request-password-recovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro. Tente novamente.');
      }

      setView('success');
    } catch (err: any) {
      setError(err.message || 'Não foi possível ligar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginView = () => (
    <>
      <div className="text-center">
        <img
          src="/norte-logo.png"
          alt="Logótipo Norte Rios"
          className="w-28 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-white">Aceda à sua conta</h2>
        <p className="mt-2 text-sm text-gray-200">
          Bem-vindo de volta! Por favor, insira os seus dados.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLoginSubmit}>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-base text-white placeholder-gray-300 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            placeholder="seu.email@exemplo.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-200"
          >
            Palavra-passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-base text-white placeholder-gray-300 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            placeholder="Sua palavra-passe"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setView('recover')}
            className="text-sm text-gray-300 hover:text-white hover:underline"
          >
            Esqueceu a sua palavra-passe?
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md text-center">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 font-semibold text-white bg-brand-green-dark rounded-lg hover:bg-brand-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-light transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </div>
      </form>
    </>
  );

  const renderRecoverView = () => (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Recuperar Palavra-passe</h2>
        <p className="mt-2 text-sm text-gray-200">
          Insira o seu email para receber as instruções.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleRecoverSubmit}>
        <div>
          <label
            htmlFor="recover-email"
            className="text-sm font-medium text-gray-200"
          >
            Email
          </label>
          <input
            id="recover-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-base text-white placeholder-gray-300 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            placeholder="seu.email@exemplo.com"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md text-center">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 font-semibold text-white bg-brand-orange rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'A enviar...' : 'Enviar Email'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setView('login');
              setError('');
            }}
            className="text-sm text-gray-300 hover:text-white hover:underline"
          >
            Voltar para o Login
          </button>
        </div>
      </form>
    </>
  );

  const renderSuccessView = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white">Verifique o seu Email</h2>
      <p className="mt-4 text-gray-200">
        Se existir uma conta associada a <strong>{email}</strong>, enviámos as
        instruções para recuperar a sua palavra-passe.
      </p>

      <button
        onClick={() => {
          setView('login');
          setEmail('');
        }}
        className="mt-6 w-full px-4 py-3 font-semibold text-white bg-brand-green-dark rounded-lg hover:bg-brand-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-light transition-colors"
      >
        Voltar para o Login
      </button>
    </div>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-green-dark to-brand-teal font-sans overflow-hidden">
      <style>{`
        @keyframes wave1 {
          0% { transform: translate(-20%, 25%) scale(1); }
          50% { transform: translate(50%, -50%) scale(1.5); }
          100% { transform: translate(-20%, 25%) scale(1); }
        }
        @keyframes wave2 {
          0% { transform: translate(80%, -30%) scale(1.2); }
          50% { transform: translate(0%, 50%) scale(0.8); }
          100% { transform: translate(80%, -30%) scale(1.2); }
        }
        @keyframes wave3 {
          0% { transform: translate(20%, 80%) scale(0.9); }
          50% { transform: translate(90%, 10%) scale(1.3); }
          100% { transform: translate(20%, 80%) scale(0.9); }
        }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div
          className="absolute bg-yellow-300/20 rounded-full"
          style={{
            width: '600px',
            height: '600px',
            top: '0%',
            left: '0%',
            filter: 'blur(140px)',
            animation: 'wave1 30s infinite ease-in-out alternate',
          }}
        ></div>

        <div
          className="absolute bg-brand-orange/20 rounded-full"
          style={{
            width: '700px',
            height: '700px',
            top: '50%',
            left: '50%',
            filter: 'blur(160px)',
            animation: 'wave2 35s infinite ease-in-out alternate-reverse',
          }}
        ></div>

        <div
          className="absolute bg-teal-300/20 rounded-full"
          style={{
            width: '550px',
            height: '550px',
            top: '20%',
            left: '80%',
            filter: 'blur(120px)',
            animation: 'wave3 28s infinite ease-in-out alternate',
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-sm p-6 space-y-6 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 transition-all duration-500 mx-4">
        {view === 'login' && renderLoginView()}
        {view === 'recover' && renderRecoverView()}
        {view === 'success' && renderSuccessView()}
      </div>
    </div>
  );
};

export default LoginPage;
