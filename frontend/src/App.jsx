import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './animations.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PontosColeta from './pages/PontosColeta';
import CadastrarPonto from './pages/CadastrarPonto';
import LoginAdmin from './pages/LoginAdmin';
import LoginUsuario from './pages/LoginUsuario';
import LoginPonto from './pages/LoginPonto';
import CadastroUsuario from './pages/CadastroUsuario';
import RecuperarSenha from './pages/RecuperarSenha';
import GerenciarContas from './pages/GerenciarContas';
import PersonalizarPonto from './pages/PersonalizarPonto';
import MeuPerfil from './pages/MeuPerfil';
import MateriaisReciclaveis from './pages/MateriaisReciclaveis';
import Residuos from './pages/Residuos';
import FAQ from './pages/FAQ';
import Sobre from './pages/Sobre';
import Conscientizacao from './pages/Conscientizacao';
import NotFound from './pages/NotFound';
import RedefinirSenha from './pages/RedefinirSenha';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  const location = useLocation();
  const isAuthPage = [
    '/login-usuario',
    '/login-admin',
    '/login-ponto',
    '/cadastro-usuario',
    '/recuperar-senha',
    '/redefinir-senha',
  ].some(path => location.pathname.startsWith(path));

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <main className="container app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pontos" element={<PontosColeta />} />
          <Route path="/cadastrar" element={
            <ProtectedRoute tipoRequerido="usuario">
              <CadastrarPonto />
            </ProtectedRoute>
          } />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/login-ponto" element={<LoginPonto />} />
          <Route path="/login-usuario" element={<LoginUsuario />} />
          <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/materiais" element={<MateriaisReciclaveis />} />
          <Route path="/residuos" element={<Residuos />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/conscientizacao" element={<Conscientizacao />} />
          <Route path="/gerenciar-contas" element={
            <ProtectedRoute tipoRequerido="admin">
              <GerenciarContas />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute tipoRequerido="perfilUsuario">
              <MeuPerfil />
            </ProtectedRoute>
          } />
          <Route path="/personalizar-ponto" element={
            <ProtectedRoute tipoRequerido="ponto">
              <PersonalizarPonto />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;
