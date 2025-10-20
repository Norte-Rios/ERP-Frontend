import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Se o usuário não estiver autenticado, ele será redirecionado para a página de login.
  // O atributo `replace` impede que a página de login seja adicionada ao histórico de navegação.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, o conteúdo da rota filha (aninhada) será renderizado.
  return <Outlet />;
};

export default ProtectedRoute;