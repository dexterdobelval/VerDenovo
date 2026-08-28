import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';

function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!token) {
      setErro('Link inválido. Solicite uma nova recuperação de senha.');
    }
  }, [token]);

  const forca = (senha) => {
    let f = 0;
    if (senha.length >= 8) f += 25;
    if (/[A-Z]/.test(senha)) f += 25;
    if (/[0-9]/.test(senha)) f += 25;
    if (/[^A-Za-z0-9]/.test(senha)) f += 25;
    return f;
  };

  const forcaSenha = forca(novaSenha);
  const forcaLabel = forcaSenha < 50 ? 'Fraca' : forcaSenha < 75 ? 'Média' : 'Forte';
  const forcaCor = forcaSenha < 50 ? '#ef4444' : forcaSenha < 75 ? '#f59e0b' : '#10b981';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (forcaSenha < 50) {
      setErro('Use uma senha mais forte (mínimo 8 caracteres com letras maiúsculas e números).');
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      await apiService.redefinirSenha(token, novaSenha);
      setSucesso(true);
      setTimeout(() => navigate('/login-usuario'), 3000);
    } catch (error) {
      setErro(error.message || 'Token inválido ou expirado. Solicite uma nova recuperação.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-surface" style={{ minHeight: '100vh', background: '#f8fffe', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="auth-card animate-scaleIn" style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', maxWidth: '450px', width: '100%' }}>

        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' }}>
            <i className="bi bi-shield-lock text-white"></i>
          </div>
          <h3 className="text-white mb-0 fw-bold">Nova Senha</h3>
          <p className="text-white-50 mb-0 mt-2">Defina sua nova senha</p>
        </div>

        <div className="p-4">
          {sucesso ? (
            <div className="text-center py-3">
              <div style={{ width: '70px', height: '70px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5 className="fw-bold text-success">Senha redefinida!</h5>
              <p className="text-muted">Você será redirecionado para o login em instantes...</p>
              <div className="spinner-border spinner-border-sm text-success mt-2"></div>
            </div>
          ) : (
            <>
              {erro && (
                <div className="alert alert-danger border-0 rounded-3 mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>{erro}
                </div>
              )}

              {!token ? (
                <div className="text-center">
                  <Link to="/recuperar-senha" className="btn btn-success px-4" style={{ borderRadius: '12px' }}>
                    Solicitar novo link
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="position-relative mb-2">
                    <div className="form-floating">
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        className="form-control"
                        id="novaSenha"
                        placeholder="Nova senha"
                        value={novaSenha}
                        onChange={e => setNovaSenha(e.target.value)}
                        required
                        style={{ border: '2px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb', paddingRight: '3rem' }}
                      />
                      <label htmlFor="novaSenha"><i className="bi bi-lock me-2"></i>Nova Senha</label>
                    </div>
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                      style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', zIndex: 10 }}>
                      <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>

                  {novaSenha && (
                    <div className="mb-3">
                      <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${forcaSenha}%`, background: forcaCor, transition: 'width 0.3s ease' }}></div>
                      </div>
                      <small style={{ color: forcaCor }}>Força: {forcaLabel}</small>
                    </div>
                  )}

                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="confirmar"
                      placeholder="Confirmar senha"
                      value={confirmar}
                      onChange={e => setConfirmar(e.target.value)}
                      required
                      style={{ border: `2px solid ${confirmar && confirmar !== novaSenha ? '#ef4444' : '#e5e7eb'}`, borderRadius: '12px', background: '#f9fafb' }}
                    />
                    <label htmlFor="confirmar"><i className="bi bi-lock-fill me-2"></i>Confirmar Senha</label>
                    {confirmar && confirmar !== novaSenha && (
                      <small className="text-danger">As senhas não coincidem</small>
                    )}
                  </div>

                  <div className="d-grid mb-4">
                    <button type="submit" className="btn btn-success py-3 fw-bold" disabled={carregando}
                      style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
                      {carregando
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</>
                        : <><i className="bi bi-check-circle me-2"></i>Salvar Nova Senha</>
                      }
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {!sucesso && (
            <div className="text-center">
              <Link to="/login-usuario" className="btn btn-outline-success rounded-3 px-4">
                <i className="bi bi-arrow-left me-2"></i>Voltar ao Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RedefinirSenha;
