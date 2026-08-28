import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const cardStyle = {
  background: 'white', borderRadius: '20px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  overflow: 'hidden', maxWidth: '450px', width: '100%'
};
const headerStyle = {
  background: 'linear-gradient(135deg, #10b981, #059669)',
  padding: '2rem', textAlign: 'center'
};
const iconStyle = {
  width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)',
  borderRadius: '50%', display: 'flex', alignItems: 'center',
  justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem'
};
const inputStyle = { border: '2px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' };
const btnStyle = { borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' };

function RecuperarSenhaPonto() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const inputsRef = useRef([]);

  const forca = (s) => {
    let f = 0;
    if (s.length >= 8) f += 25;
    if (/[A-Z]/.test(s)) f += 25;
    if (/[0-9]/.test(s)) f += 25;
    if (/[^A-Za-z0-9]/.test(s)) f += 25;
    return f;
  };
  const forcaSenha = forca(novaSenha);
  const forcaLabel = forcaSenha < 50 ? 'Fraca' : forcaSenha < 75 ? 'Média' : 'Forte';
  const forcaCor = forcaSenha < 50 ? '#ef4444' : forcaSenha < 75 ? '#f59e0b' : '#10b981';

  const handleCodigoChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const novo = [...codigo];
    novo[index] = value.slice(-1);
    setCodigo(novo);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleCodigoPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setCodigo(paste.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleCodigoKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const enviarEmail = async (e) => {
    e.preventDefault();
    setCarregando(true); setErro('');
    try {
      await apiService.recuperarSenha(email);
      setEtapa(2);
    } catch (err) {
      setErro(err.message || 'Erro ao enviar email.');
    } finally { setCarregando(false); }
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    const codigoStr = codigo.join('');
    if (codigoStr.length < 6) { setErro('Digite o código completo.'); return; }
    setCarregando(true); setErro('');
    try {
      await apiService.verificarCodigo(email, codigoStr);
      setEtapa(3);
    } catch (err) {
      setErro(err.message || 'Código inválido ou expirado.');
    } finally { setCarregando(false); }
  };

  const redefinirSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    if (forcaSenha < 50) { setErro('Use uma senha mais forte.'); return; }
    setCarregando(true); setErro('');
    try {
      await apiService.redefinirSenhaPorCodigo(email, codigo.join(''), novaSenha);
      setEtapa(4);
      setTimeout(() => navigate('/login-ponto'), 3000);
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir senha.');
    } finally { setCarregando(false); }
  };

  const titulos = ['', 'Recuperar Senha', 'Verificar Código', 'Nova Senha', 'Concluído'];
  const subtitulos = ['', 'Ponto de Coleta', `Código enviado para ${email}`, 'Defina sua nova senha', ''];
  const icones = ['', 'bi-geo-alt', 'bi-shield-check', 'bi-lock', 'bi-check-circle'];

  return (
    <div className="auth-surface" style={{ minHeight: '100vh', background: '#f8fffe', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="auth-card animate-scaleIn" style={cardStyle}>

        <div style={headerStyle}>
          <div style={iconStyle}>
            <i className={`bi ${icones[etapa]} text-white`}></i>
          </div>
          <h3 className="text-white mb-0 fw-bold">{titulos[etapa]}</h3>
          <p className="text-white-50 mb-0 mt-2" style={{ fontSize: '0.9rem' }}>{subtitulos[etapa]}</p>
        </div>

        {etapa < 4 && (
          <div className="d-flex justify-content-center gap-2 pt-3 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '4px', flex: 1, borderRadius: '2px',
                background: i <= etapa ? '#10b981' : '#e5e7eb',
                transition: 'background 0.3s ease'
              }} />
            ))}
          </div>
        )}

        <div className="p-4">
          {erro && (
            <div className="alert alert-danger border-0 rounded-3 mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>{erro}
            </div>
          )}

          {etapa === 1 && (
            <form onSubmit={enviarEmail}>
              <p className="text-muted mb-4">Digite o email do ponto para receber um código de verificação.</p>
              <div className="form-floating mb-4">
                <input type="email" className="form-control" id="email" placeholder="ponto@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                <label htmlFor="email"><i className="bi bi-envelope me-2"></i>Email do Ponto</label>
              </div>
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-success py-3 fw-bold" disabled={carregando} style={btnStyle}>
                  {carregando
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</>
                    : <><i className="bi bi-send me-2"></i>Enviar Código</>}
                </button>
              </div>
            </form>
          )}

          {etapa === 2 && (
            <form onSubmit={verificarCodigo}>
              <p className="text-muted mb-4">
                Digite o código de 6 dígitos enviado para <strong>{email}</strong>. Válido por 15 minutos.
              </p>
              <div className="d-flex justify-content-center gap-2 mb-4" onPaste={handleCodigoPaste}>
                {codigo.map((d, i) => (
                  <input key={i} ref={el => inputsRef.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleCodigoChange(i, e.target.value)}
                    onKeyDown={e => handleCodigoKeyDown(i, e)}
                    style={{
                      width: '48px', height: '56px', textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: '700',
                      border: `2px solid ${d ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '12px', background: d ? 'rgba(16,185,129,0.05)' : '#f9fafb',
                      outline: 'none', transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-success py-3 fw-bold" disabled={carregando} style={btnStyle}>
                  {carregando
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Verificando...</>
                    : <><i className="bi bi-shield-check me-2"></i>Verificar Código</>}
                </button>
              </div>
              <div className="text-center">
                <button type="button" className="btn btn-link text-success p-0" onClick={() => { setEtapa(1); setErro(''); setCodigo(['','','','','','']); }}>
                  <i className="bi bi-arrow-left me-1"></i>Usar outro email
                </button>
                <span className="text-muted mx-2">·</span>
                <button type="button" className="btn btn-link text-success p-0" disabled={carregando}
                  onClick={async () => { setCarregando(true); setErro(''); try { await apiService.recuperarSenha(email); setCodigo(['','','','','','']); } catch(e) { setErro(e.message); } finally { setCarregando(false); } }}>
                  Reenviar código
                </button>
              </div>
            </form>
          )}

          {etapa === 3 && (
            <form onSubmit={redefinirSenha}>
              <div className="position-relative mb-2">
                <div className="form-floating">
                  <input type={mostrarSenha ? 'text' : 'password'} className="form-control" id="novaSenha"
                    placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    required style={{ ...inputStyle, paddingRight: '3rem' }} />
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
                <input type="password" className="form-control" id="confirmar" placeholder="Confirmar senha"
                  value={confirmar} onChange={e => setConfirmar(e.target.value)} required
                  style={{ ...inputStyle, border: `2px solid ${confirmar && confirmar !== novaSenha ? '#ef4444' : '#e5e7eb'}` }} />
                <label htmlFor="confirmar"><i className="bi bi-lock-fill me-2"></i>Confirmar Senha</label>
                {confirmar && confirmar !== novaSenha && <small className="text-danger">As senhas não coincidem</small>}
              </div>
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-success py-3 fw-bold" disabled={carregando} style={btnStyle}>
                  {carregando
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</>
                    : <><i className="bi bi-check-circle me-2"></i>Salvar Nova Senha</>}
                </button>
              </div>
            </form>
          )}

          {etapa === 4 && (
            <div className="text-center py-3">
              <div style={{ width: '70px', height: '70px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5 className="fw-bold text-success">Senha redefinida!</h5>
              <p className="text-muted">Você será redirecionado para o login em instantes...</p>
              <div className="spinner-border spinner-border-sm text-success mt-2"></div>
            </div>
          )}

          {etapa !== 4 && (
            <div className="text-center mt-2">
              <Link to="/login-ponto" className="btn btn-outline-success rounded-3 px-4">
                <i className="bi bi-arrow-left me-2"></i>Voltar ao Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenhaPonto;
