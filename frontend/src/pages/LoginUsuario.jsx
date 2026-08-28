import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

function LoginUsuario() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { loginUsuario } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    try {
      await loginUsuario(email, senha);
      navigate('/');
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="page-content auth-surface" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="animate-scaleIn" style={{ width: '100%', maxWidth: '440px' }}>

        {/* Card principal */}
        <div className="clay auth-card" style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.78)' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            borderBottom: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 0px rgba(0,0,0,0.08)',
          }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)', fontSize: '2rem' }}>
              <i className="bi bi-person-circle text-white"></i>
            </div>
            <h3 style={{ color: 'white', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Bem-vindo de volta!</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: '0.9rem' }}>Entre na sua conta</p>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            {erro && (
              <div className="clay-sm mb-4" style={{ background: 'rgba(254,226,226,0.8)', border: '2px solid rgba(252,165,165,0.6)', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#dc2626' }}></i>
                <span style={{ color: '#991b1b', fontSize: '0.88rem', fontWeight: 500 }}>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={{ fontWeight: 600, color: '#166534', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                  <i className="bi bi-envelope me-2"></i>Email
                </label>
                <input type="email" className="form-control" placeholder="seu@email.com" maxLength="100"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ padding: '0.85rem 1rem', fontSize: '0.95rem' }} />
              </div>

              <div className="mb-4" style={{ position: 'relative' }}>
                <label style={{ fontWeight: 600, color: '#166534', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                  <i className="bi bi-lock me-2"></i>Senha
                </label>
                <input type={mostrarSenha ? 'text' : 'password'} className="form-control" placeholder="Sua senha" maxLength="100"
                  value={senha} onChange={e => setSenha(e.target.value)} required
                  style={{ padding: '0.85rem 3rem 0.85rem 1rem', fontSize: '0.95rem' }} />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ position: 'absolute', right: '14px', bottom: '12px', background: 'none', border: 'none', color: '#6b8f6b', cursor: 'pointer', fontSize: '1rem' }}>
                  <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>

              <button type="submit" className="btn btn-success w-100 mb-3" disabled={carregando}
                style={{ padding: '0.9rem', fontSize: '1rem' }}>
                {carregando
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Entrando...</>
                  : <><i className="bi bi-box-arrow-in-right me-2"></i>Entrar</>}
              </button>
            </form>

            <div className="text-center mb-3">
              <Link to="/recuperar-senha" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
                <i className="bi bi-question-circle me-1"></i>Esqueceu sua senha?
              </Link>
            </div>

            <div style={{ borderTop: '2px solid rgba(255,255,255,0.6)', paddingTop: '1.25rem', textAlign: 'center' }}>
              <p style={{ color: '#6b8f6b', marginBottom: '0.75rem', fontSize: '0.88rem' }}>Não tem uma conta?</p>
              <Link to="/cadastro-usuario" className="btn btn-outline-success px-4">
                <i className="bi bi-person-plus me-2"></i>Criar conta
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginUsuario;
