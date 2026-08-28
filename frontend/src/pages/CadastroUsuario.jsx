import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

function CadastroUsuario() {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const navigate = useNavigate();
  const { cadastrarUsuario } = useAuth();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getPasswordStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25;
    if (/[^A-Za-z0-9]/.test(p)) s += 25;
    return s;
  };

  const passwordStrength = getPasswordStrength(formData.senha);
  const strengthLabel = passwordStrength < 50 ? 'Fraca' : passwordStrength < 75 ? 'Média' : 'Forte';
  const strengthColor = passwordStrength < 50 ? '#ef4444' : passwordStrength < 75 ? '#f59e0b' : '#22c55e';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');
    if (formData.senha !== formData.confirmarSenha) { setErro('As senhas não coincidem'); setCarregando(false); return; }
    if (passwordStrength < 50) { setErro('Use uma senha mais forte. Inclua letras maiúsculas, números ou símbolos.'); setCarregando(false); return; }
    try {
      await cadastrarUsuario({ nome: formData.nome, email: formData.email, senha: formData.senha });
      setSucesso('Cadastro realizado com sucesso! Você pode fazer login agora.');
      setTimeout(() => navigate('/login-usuario'), 2000);
    } catch (error) {
      setErro(error.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const inputStyle = { padding: '0.85rem 1rem', fontSize: '0.95rem' };
  const labelStyle = { fontWeight: 600, color: '#166534', fontSize: '0.85rem', marginBottom: '6px', display: 'block' };

  return (
    <div className="page-content auth-surface" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="animate-scaleIn" style={{ width: '100%', maxWidth: '480px' }}>

        <div className="clay auth-card" style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.78)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', padding: '2.5rem 2rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 0px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)', fontSize: '2rem' }}>
              <i className="bi bi-person-plus text-white"></i>
            </div>
            <h3 style={{ color: 'white', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Criar Conta</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: '0.9rem' }}>Junte-se à nossa comunidade</p>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            {erro && (
              <div className="clay-sm mb-4" style={{ background: 'rgba(254,226,226,0.8)', border: '2px solid rgba(252,165,165,0.6)', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#dc2626' }}></i>
                <span style={{ color: '#991b1b', fontSize: '0.88rem', fontWeight: 500 }}>{erro}</span>
              </div>
            )}
            {sucesso && (
              <div className="clay-sm mb-4" style={{ background: 'rgba(220,252,231,0.8)', border: '2px solid rgba(134,239,172,0.6)', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#16a34a' }}></i>
                <span style={{ color: '#166534', fontSize: '0.88rem', fontWeight: 500 }}>{sucesso}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={labelStyle}><i className="bi bi-person me-2"></i>Nome Completo</label>
                <input type="text" className="form-control" name="nome" placeholder="Seu nome completo"
                  value={formData.nome} onChange={handleChange} maxLength="100" required style={inputStyle} />
              </div>

              <div className="mb-3">
                <label style={labelStyle}><i className="bi bi-envelope me-2"></i>Email</label>
                <input type="email" className="form-control" name="email" placeholder="seu@email.com"
                  value={formData.email} onChange={handleChange} maxLength="100" required style={inputStyle} />
              </div>

              <div className="mb-2" style={{ position: 'relative' }}>
                <label style={labelStyle}><i className="bi bi-lock me-2"></i>Senha</label>
                <input type={mostrarSenha ? 'text' : 'password'} className="form-control" name="senha" placeholder="Sua senha"
                  value={formData.senha} onChange={handleChange} maxLength="100" required style={{ ...inputStyle, paddingRight: '3rem' }} />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ position: 'absolute', right: '14px', bottom: '12px', background: 'none', border: 'none', color: '#6b8f6b', cursor: 'pointer', fontSize: '1rem' }}>
                  <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>

              {formData.senha && (
                <div className="mb-3">
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.08)' }}>
                    <div style={{ height: '100%', width: `${passwordStrength}%`, background: strengthColor, borderRadius: '999px', transition: 'width 0.3s ease, background 0.3s ease' }} />
                  </div>
                  <small style={{ color: strengthColor, fontWeight: 600, fontSize: '0.78rem' }}>Força da senha: {strengthLabel}</small>
                </div>
              )}

              <div className="mb-4" style={{ position: 'relative' }}>
                <label style={labelStyle}><i className="bi bi-lock-fill me-2"></i>Confirmar Senha</label>
                <input type={mostrarConfirmarSenha ? 'text' : 'password'} className="form-control" name="confirmarSenha" placeholder="Confirme sua senha"
                  value={formData.confirmarSenha} onChange={handleChange} maxLength="100" required style={{ ...inputStyle, paddingRight: '3rem' }} />
                <button type="button" onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  style={{ position: 'absolute', right: '14px', bottom: '12px', background: 'none', border: 'none', color: '#6b8f6b', cursor: 'pointer', fontSize: '1rem' }}>
                  <i className={`bi ${mostrarConfirmarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>

              <button type="submit" className="btn btn-success w-100 mb-3" disabled={carregando}
                style={{ padding: '0.9rem', fontSize: '1rem' }}>
                {carregando
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Cadastrando...</>
                  : <><i className="bi bi-person-check me-2"></i>Criar Conta</>}
              </button>
            </form>

            <div style={{ borderTop: '2px solid rgba(255,255,255,0.6)', paddingTop: '1.25rem', textAlign: 'center' }}>
              <p style={{ color: '#6b8f6b', marginBottom: '0.75rem', fontSize: '0.88rem' }}>Já tem uma conta?</p>
              <Link to="/login-usuario" className="btn btn-outline-success px-4">
                <i className="bi bi-box-arrow-in-right me-2"></i>Fazer Login
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CadastroUsuario;
