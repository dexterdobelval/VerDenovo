import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/useAuth';

const inicial = {
  nome: '',
  email: '',
  nivelAcesso: '',
  statusUsuario: '',
};

function statusInfo(usuario) {
  if (usuario?.statusUsuario === 'ATIVO') {
    return { label: 'Conta ativa', detail: 'Acesso liberado', icon: 'bi-patch-check-fill', tone: 'verified' };
  }
  return { label: 'Conta inativa', detail: 'Acesso limitado', icon: 'bi-pause-circle-fill', tone: 'pending' };
}

function Field({ id, label, icon, error, children }) {
  return (
    <label className={`profile-field ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span><i className={`bi ${icon}`} />{label}</span>
      {children}
      {error && <small>Obrigatorio</small>}
    </label>
  );
}

function MeuPerfil() {
  const { logout } = useAuth();
  const [perfil, setPerfil] = useState(inicial);
  const [form, setForm] = useState(inicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erros, setErros] = useState({});

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      setErro('');
      try {
        const data = await apiService.buscarMeuPerfil();
        setPerfil(data);
        setForm(data);
      } catch (e) {
        setErro(e.message || 'Nao foi possivel carregar seu perfil.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (erros[name]) setErros(prev => ({ ...prev, [name]: false }));
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const salvar = async (event) => {
    event.preventDefault();
    setSucesso('');
    setErro('');
    const novosErros = {};
    if (!form.nome?.trim()) novosErros.nome = true;
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      const atualizado = await apiService.atualizarMeuPerfil({ nome: form.nome });
      setPerfil(atualizado);
      setForm(atualizado);
      const usuarioAtual = JSON.parse(localStorage.getItem('usuario_logado') || 'null');
      if (usuarioAtual?.tipo === 'usuario') {
        localStorage.setItem('usuario_logado', JSON.stringify({
          ...usuarioAtual,
          dados: { ...usuarioAtual.dados, nome: atualizado.nome },
        }));
      }
      setSucesso('Perfil atualizado com sucesso.');
    } catch (e) {
      setErro(e.message || 'Nao foi possivel salvar seu perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const info = statusInfo(perfil);

  if (carregando) {
    return (
      <div className="profile-loading">
        <div className="spinner-border text-success mb-3" />
        <p>Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          --line: rgba(15,23,42,0.09);
          --text: #102018;
          --muted: #66736b;
          --green: #059669;
          --ease: cubic-bezier(.2,.8,.2,1);
          min-height: 100vh;
          padding: 1.5rem 0 3rem;
          color: var(--text);
          background:
            linear-gradient(180deg, rgba(240,253,244,0.85) 0%, rgba(255,255,255,1) 44%),
            radial-gradient(circle at 14% 8%, rgba(34,197,94,0.12), transparent 34%),
            #fff;
        }
        .profile-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #66736b;
        }
        .profile-shell {
          width: min(1080px, calc(100vw - 2rem));
          margin: 0 auto;
        }
        .profile-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.1rem;
          padding: 1.1rem;
          border: 1px solid rgba(255,255,255,0.82);
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255,255,255,0.86), rgba(236,253,245,0.78));
          box-shadow: 0 18px 50px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
          backdrop-filter: blur(18px);
        }
        .profile-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 0;
        }
        .profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: #047857;
          background: linear-gradient(145deg, rgba(209,250,229,0.95), rgba(255,255,255,0.9));
          border: 1px solid rgba(16,185,129,0.18);
          box-shadow: 0 10px 24px rgba(5,150,105,0.12);
          font-size: 1.25rem;
          font-weight: 900;
          flex: 0 0 auto;
        }
        .profile-copy span {
          color: #047857;
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .profile-copy h1 {
          margin: 0.18rem 0 0;
          font-size: clamp(1.55rem, 3vw, 2.12rem);
          font-weight: 850;
          line-height: 1.08;
          overflow-wrap: anywhere;
        }
        .profile-copy p {
          margin: 0.34rem 0 0;
          color: var(--muted);
          font-size: 0.92rem;
        }
        .profile-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 220px;
          padding: 0.78rem 0.9rem;
          border-radius: 17px;
          border: 1px solid var(--status-border);
          background: var(--status-bg);
          color: var(--status-color);
          box-shadow: 0 10px 28px rgba(15,23,42,0.07);
        }
        .profile-status.verified { --status-bg: rgba(236,253,245,0.9); --status-color: #047857; --status-border: rgba(16,185,129,0.24); }
        .profile-status.pending { --status-bg: rgba(255,251,235,0.95); --status-color: #a16207; --status-border: rgba(245,158,11,0.26); }
        .profile-status i {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.72);
        }
        .profile-status strong,
        .profile-status small { display: block; }
        .profile-status strong { font-size: 0.9rem; }
        .profile-status small { font-size: 0.74rem; opacity: 0.72; }
        .profile-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 1rem;
          align-items: start;
        }
        .profile-card {
          border: 1px solid var(--line);
          border-radius: 20px;
          background: rgba(255,255,255,0.94);
          box-shadow: 0 14px 36px rgba(15,23,42,0.055);
          padding: 1.1rem;
        }
        .profile-card h2,
        .profile-card h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 850;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .profile-card h2 i,
        .profile-card h3 i { color: #059669; }
        .profile-form {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 0.85rem;
        }
        .profile-field {
          grid-column: span 12;
          display: flex;
          flex-direction: column;
          gap: 0.38rem;
        }
        .profile-field.half { grid-column: span 6; }
        .profile-field span {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #526159;
          font-size: 0.78rem;
          font-weight: 750;
        }
        .profile-field span i { color: #059669; font-size: 0.82rem; }
        .profile-field input {
          width: 100%;
          min-height: 46px;
          border: 1px solid rgba(15,23,42,0.11);
          border-radius: 13px;
          background: rgba(248,250,252,0.72);
          color: #102018;
          outline: none;
          padding: 0.74rem 0.84rem;
          font-size: 0.93rem;
          font-weight: 560;
          transition: border-color 180ms var(--ease), box-shadow 180ms var(--ease), background 180ms var(--ease);
        }
        .profile-field input:hover { border-color: rgba(5,150,105,0.25); background: #fff; }
        .profile-field input:focus {
          border-color: rgba(5,150,105,0.52);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(5,150,105,0.095);
        }
        .profile-field input[readonly] {
          color: #6b7280;
          background: linear-gradient(180deg, rgba(243,244,246,0.88), rgba(249,250,251,0.9));
          cursor: not-allowed;
        }
        .profile-field.has-error input {
          border-color: rgba(220,38,38,0.44);
          background: #fff7f7;
        }
        .profile-field small {
          color: #b91c1c;
          font-size: 0.74rem;
          font-weight: 750;
        }
        .profile-feedback {
          border: 1px solid;
          border-radius: 16px;
          padding: 0.9rem 1rem;
          margin-bottom: 1rem;
          font-weight: 650;
        }
        .profile-feedback.success { color: #047857; background: rgba(236,253,245,0.88); border-color: rgba(16,185,129,0.22); }
        .profile-feedback.error { color: #b91c1c; background: rgba(254,242,242,0.9); border-color: rgba(248,113,113,0.22); }
        .profile-side {
          position: sticky;
          top: 76px;
          display: grid;
          gap: 1rem;
        }
        .profile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.74rem 0;
          border-top: 1px solid rgba(15,23,42,0.07);
          color: #526159;
          font-size: 0.86rem;
        }
        .profile-row strong {
          color: #17231c;
          text-align: right;
        }
        .profile-actions {
          display: grid;
          gap: 0.65rem;
        }
        .profile-primary,
        .profile-secondary,
        .profile-danger {
          min-height: 44px;
          padding: 0.72rem 0.95rem;
          border-radius: 13px;
          border: 1px solid transparent;
          font-size: 0.9rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0;
          transition: transform 180ms var(--ease), box-shadow 180ms var(--ease), background 180ms var(--ease), border-color 180ms var(--ease), color 180ms var(--ease);
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.78), 0 10px 22px rgba(15,23,42,0.06);
        }
        .profile-primary i,
        .profile-secondary i,
        .profile-danger i {
          font-size: 0.96rem;
        }
        .profile-primary {
          color: white;
          background: linear-gradient(135deg, #047857, #10b981);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 14px 28px rgba(5,150,105,0.18);
        }
        .profile-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 34px rgba(5,150,105,0.25);
        }
        .profile-primary:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .profile-secondary {
          color: #047857;
          background: rgba(236,253,245,0.76);
          border-color: rgba(16,185,129,0.18);
        }
        .profile-danger {
          color: #9f2f24;
          background: rgba(255,255,255,0.9);
          border-color: rgba(180,35,24,0.14);
        }
        .profile-secondary:hover,
        .profile-danger:hover {
          transform: translateY(-1px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.92), 0 13px 26px rgba(15,23,42,0.08);
        }
        .profile-secondary:hover {
          color: #036747;
          background: rgba(220,252,231,0.9);
          border-color: rgba(16,185,129,0.28);
        }
        .profile-danger:hover {
          color: #84251d;
          background: rgba(255,247,247,0.92);
          border-color: rgba(180,35,24,0.22);
        }
        .profile-primary:focus-visible,
        .profile-secondary:focus-visible,
        .profile-danger:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(16,185,129,0.16), 0 14px 28px rgba(15,23,42,0.09);
        }
        @media (max-width: 991px) {
          .profile-layout { grid-template-columns: 1fr; }
          .profile-side { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 767px) {
          .profile-page { padding-top: 1rem; }
          .profile-shell { width: min(100% - 1rem, 1080px); }
          .profile-hero { grid-template-columns: 1fr; border-radius: 18px; }
          .profile-status { width: 100%; min-width: 0; }
          .profile-form { grid-template-columns: 1fr; }
          .profile-field.half { grid-column: auto; }
          .profile-side { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="profile-shell">
        <header className="profile-hero">
          <div className="profile-title">
            <div className="profile-avatar">{(form.nome || form.email || 'U').charAt(0).toUpperCase()}</div>
            <div className="profile-copy">
              <span>Configuracoes da conta</span>
              <h1>{form.nome || 'Meu perfil'}</h1>
              <p>Gerencie seus dados basicos e acompanhe o status da conta.</p>
            </div>
          </div>
          <div className={`profile-status ${info.tone}`}>
            <i className={`bi ${info.icon}`} />
            <div>
              <strong>{info.label}</strong>
              <small>{info.detail}</small>
            </div>
          </div>
        </header>

        {erro && <div className="profile-feedback error"><i className="bi bi-exclamation-triangle me-2" />{erro}</div>}
        {sucesso && <div className="profile-feedback success"><i className="bi bi-check-circle-fill me-2" />{sucesso}</div>}

        <div className="profile-layout">
          <form className="profile-card" onSubmit={salvar}>
            <h2><i className="bi bi-person-lines-fill" />Dados pessoais</h2>
            <div className="profile-form">
              <Field id="nome" label="Nome" icon="bi-person" error={erros.nome}>
                <input id="nome" name="nome" type="text" value={form.nome || ''} onChange={handleChange} placeholder="Seu nome" />
              </Field>
              <Field id="email" label="Email" icon="bi-envelope">
                <input id="email" type="email" value={form.email || ''} readOnly />
              </Field>
            </div>
          </form>

          <aside className="profile-side">
            <div className="profile-card">
              <h3><i className="bi bi-shield-check" />Resumo</h3>
              <div className="profile-row">
                <span>Status</span>
                <strong>{perfil.statusUsuario || 'ATIVO'}</strong>
              </div>
              <div className="profile-row">
                <span>Tipo</span>
                <strong>{perfil.nivelAcesso === 'ADMIN' ? 'Admin' : 'Usuario'}</strong>
              </div>
              <div className="profile-row">
                <span>Email</span>
                <strong>{perfil.email}</strong>
              </div>
            </div>

            <div className="profile-card profile-actions">
              <h3><i className="bi bi-sliders" />Ações</h3>
              <button type="button" className="profile-primary" onClick={salvar} disabled={salvando}>
                {salvando
                  ? <><span className="spinner-border spinner-border-sm" />Salvando...</>
                  : <><i className="bi bi-floppy" />Salvar alterações</>}
              </button>
              <Link className="profile-secondary" to="/recuperar-senha">
                <i className="bi bi-key" />Alterar senha
              </Link>
              <button type="button" className="profile-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" />Sair da conta
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MeuPerfil;
