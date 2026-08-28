import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/useAuth';

function LoginPonto() {
  const navigate = useNavigate();
  const { loginPonto } = useAuth();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const styles = `
    .login-ponto-container {
      min-height: 100vh;
      background: #f8fffe;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px 20px 20px 20px;
    }
    .login-ponto-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      max-width: 450px;
      width: 100%;
    }
    .login-ponto-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 2rem;
      text-align: center;
    }
    .ponto-login-icon {
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
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      background: white;
    }
    .btn-login-ponto {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      padding: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-login-ponto:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
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
    setCarregando(true);
    setErro('');
    try {
      const response = await apiService.loginPonto(formData.email, formData.senha);
      loginPonto(response.ponto);
      navigate('/personalizar-ponto');
    } catch (error) {
      setErro(error.message || 'Email ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-ponto-container">
      <style>{styles}</style>
      <div className="login-ponto-card animate-slide-up">
        <div className="login-ponto-header">
          <div className="ponto-login-icon">
            <i className="bi bi-geo-alt text-white"></i>
          </div>
          <h3 className="text-white mb-0 fw-bold">Acesso ao Sistema</h3>
          <p className="text-white-50 mb-0 mt-2">Entre com suas credenciais</p>
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
                placeholder="ponto@email.com"
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

            <div className="d-grid mb-4">
              <button type="submit" className="btn btn-login-ponto text-white" disabled={carregando}>
                {carregando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Acessando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link to="/recuperar-senha-ponto" className="text-decoration-none text-success fw-medium">
              <i className="bi bi-question-circle me-1"></i>
              Esqueceu a senha?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPonto;
