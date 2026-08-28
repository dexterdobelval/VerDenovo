import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

function ProtectedRoute({ children, tipoRequerido }) {
  const { usuario, isLogado } = useAuth();

  if (!isLogado()) {
    if (tipoRequerido === 'admin') return <Navigate to="/login-admin" replace />;
    if (tipoRequerido === 'ponto') return <Navigate to="/login-ponto" replace />;
    return <Navigate to="/login-usuario" replace />;
  }

  if (tipoRequerido === 'admin') {
    const isAdmin = usuario?.tipo === 'admin' || usuario?.dados?.nivelAcesso === 'ADMIN';
    if (!isAdmin) return <Navigate to="/" replace />;
  }

  if (tipoRequerido === 'usuario') {
    const isUsuarioOuAdmin = ['usuario', 'admin'].includes(usuario?.tipo);
    if (!isUsuarioOuAdmin) return <Navigate to="/login-usuario" replace />;
  }

  if (tipoRequerido === 'ponto') {
    const temAcesso = usuario?.tipo === 'ponto' || usuario?.pontoVinculado;
    if (!temAcesso) return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
