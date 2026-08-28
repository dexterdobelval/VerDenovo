import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

function LoginAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAuth();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState(location.state?.erro || '');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [bloqueadoAte, setBloqueadoAte] = useState(null);

  const styles = `
    .login-admin-container {
      min-height: 100vh;
      background: #f8fffe;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px 20px 20px 20px;
    }
    .login-admin-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      max-width: 450px;
      width: 100%;
    }
    .login-admin-header {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      padding: 2rem;
      text-align: center;
    }
    .admin-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 2rem;
    }
    .form-floating input {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 1rem;
      transition: all 0.3s ease;
      background: #f9fafb;
    }
    .form-floating input:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      background: white;
    }
    .btn-admin {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border: none;
      border-radius: 12px;
      padding: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-admin:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
    }
    .password-toggle {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      z-index: 10;
    }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slideInUp 0.6s ease-out; }
  `;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bloqueadoAte && Date.now() < bloqueadoAte) {
      const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
      setErro(`Muitas tentativas. Aguarde ${seg}s antes de tentar novamente.`);
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      await loginAdmin(formData.email, formData.senha);
      navigate('/gerenciar-contas');
    } catch (error) {
      const novasTentativas = tentativas + 1;
      setTentativas(novasTentativas);
      if (novasTentativas >= 5) {
        setBloqueadoAte(Date.now() + 30000);
        setErro('Muitas tentativas. Aguarde 30 segundos.');
      } else {
        setErro(error.message || 'Credenciais de administrador incorretas.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-admin-container">
      <style>{styles}</style>
      <div className="login-admin-card animate-slide-up">
        <div className="login-admin-header">
          <div className="admin-icon">
            <i className="bi bi-shield-lock text-white"></i>
          </div>
          <h3 className="text-white mb-0 fw-bold">Área Administrativa</h3>
          <p className="text-white-50 mb-0 mt-2">Acesso restrito a administradores</p>
        </div>

        <div className="p-4">
          {erro && (
            <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>{erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="admin@email.com"
                maxLength="100"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="email">
                <i className="bi bi-envelope me-2"></i>Email
              </label>
            </div>

            <div className="form-floating position-relative mb-4">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="form-control"
                id="senha"
                name="senha"
                placeholder="Sua senha"
                maxLength="100"
                value={formData.senha}
                onChange={handleChange}
                required
              />
              <label htmlFor="senha">
                <i className="bi bi-lock me-2"></i>Senha
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-admin text-white" disabled={carregando}>
                {carregando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Entrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-lock me-2"></i>
                    Entrar como Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;
