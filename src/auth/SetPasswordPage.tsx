import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_BACKEND_URL
/**
 * Uma página para utilizadores definirem ou redefinirem a sua palavra-passe.
 * Extrai o ID do utilizador do URL (assumindo uma rota como /set-password/:id)
 * e envia um pedido PATCH para /api/users/:id com a nova palavra-passe.
 */
const SetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'form' | 'success'>('form');
  const [userId, setUserId] = useState<string | null>(null);

  // Efeito para extrair o ID do utilizador do URL na montagem do componente
  useEffect(() => {
    // Assume que o ID é a última parte do pathname. 
    // Ex: /resetar-password/123e4567-e89b-12d3-a456-426614174000
    const pathParts = window.location.pathname.split('/');
    const id = pathParts.pop(); // Obtém a última parte
    
    if (id && id.length > 10) { // Uma verificação simples para um ID (ex: UUID)
      setUserId(id);
    } else {
      console.error("Nenhum ID de utilizador encontrado no URL.");
      setError("Link inválido ou expirado. Não foi possível encontrar o ID do utilizador.");
    }
  }, []); // O array vazio [] garante que isto só corre uma vez

  /**
   * Lida com a submissão do formulário de definição de palavra-passe.
   */
  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação do lado do cliente
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!userId) {
      setError('ID do utilizador não encontrado. Por favor, use o link de recuperação correto.');
      return;
    }

    setIsLoading(true);

    try {
      // A sua rota é @Patch(':id'), por isso o URL da API será algo como /api/users/:id
      // Estou a assumir que a sua API está montada em /api
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Envia o DTO (UpdateUserDto) apenas com a palavra-passe
        body: JSON.stringify({ password: password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao atualizar a palavra-passe.');
      }

      // Sucesso!
      setView('success');

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renderiza o formulário principal para definir a palavra-passe.
   */
  const renderFormView = () => (
    <>
      <div className="text-center">
        <img src="/norte-logo.png" alt="Logótipo Norte Rios" className="w-28 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Definir Nova Palavra-passe</h2>
        <p className="mt-2 text-sm text-gray-200">Escolha uma palavra-passe segura.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSetPasswordSubmit}>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-200">
            Nova Palavra-passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-base text-white placeholder-gray-300 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            placeholder="Min. 8 caracteres"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
            Confirmar Palavra-passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-base text-white placeholder-gray-300 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            placeholder="Repita a palavra-passe"
          />
        </div>
        
        {error && <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md text-center">{error}</p>}
        
        <div>
          <button
            type="submit"
            disabled={isLoading || !userId} // Desativa se estiver a carregar ou se não houver ID
            className="w-full px-4 py-3 font-semibold text-white bg-brand-green-dark rounded-lg hover:bg-brand-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-light transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'A guardar...' : 'Guardar Palavra-passe'}
          </button>
        </div>
        <div className="text-center">
            <a href="/login" className="text-sm text-gray-300 hover:text-white hover:underline">Voltar para o Login</a>
        </div>
      </form>
    </>
  );

  /**
   * Renderiza a mensagem de sucesso após a definição da palavra-passe.
   */
  const renderSuccessView = () => (
     <div className="text-center">
       <h2 className="text-2xl font-bold text-white">Palavra-passe Atualizada!</h2>
       <p className="mt-4 text-gray-200">
         A sua palavra-passe foi definida com sucesso. Já pode fazer login com a nova palavra-passe.
       </p>
       <button
         onClick={() => window.location.href = '/login'} // Redireciona para o login
         className="mt-6 w-full px-4 py-3 font-semibold text-white bg-brand-green-dark rounded-lg hover:bg-brand-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-light transition-colors"
       >
         Ir para o Login
       </button>
     </div>
   );

  // JSX principal com o layout de fundo copiado
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-green-dark to-brand-teal font-sans overflow-hidden">
      {/* Animações de fundo (copiadas do seu LoginPage) */}
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
            animation: 'wave1 30s infinite ease-in-out alternate' 
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
            animation: 'wave2 35s infinite ease-in-out alternate-reverse' 
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
            animation: 'wave3 28s infinite ease-in-out alternate' 
          }}
        ></div>
      </div>

      {/* Cartão principal (copiado do seu LoginPage) */}
      <div className="relative z-10 w-full max-w-sm p-6 space-y-6 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 transition-all duration-500 mx-4">
        {view === 'form' && renderFormView()}
        {view === 'success' && renderSuccessView()}
      </div>
    </div>
  );
};

export default SetPasswordPage;
