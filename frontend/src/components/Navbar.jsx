import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useEffect, useState } from 'react';

function Navbar() {
  const { usuario, logout, isLogado } = useAuth();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAberto]);

  useEffect(() => {
    if (!menuAberto) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuAberto(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuAberto]);

  useEffect(() => { setMenuAberto(false); }, [location]);

  const handleLogout = () => { logout(); setMenuAberto(false); };
  const fechar = () => setMenuAberto(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .clay-navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1030;
          background: linear-gradient(135deg, rgba(255,255,255,0.86), rgba(236,253,245,0.76));
          backdrop-filter: blur(14px) saturate(1.08);
          border-bottom: 1px solid rgba(255,255,255,0.72);
          box-shadow: 0 1px 0 rgba(20,83,45,0.06), 0 10px 28px rgba(15,23,42,0.08);
          height: 60px;
          display: flex; align-items: center;
          transition: background var(--motion-normal, 220ms) var(--ease-out, ease), box-shadow var(--motion-normal, 220ms) ease, border-color var(--motion-normal, 220ms) ease;
        }
        .clay-menu-btn {
          background: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 12px;
          box-shadow: 2px 2px 0px rgba(20,83,45,0.09), 0 6px 16px rgba(15,23,42,0.06);
          color: #16a34a;
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform var(--motion-fast, 140ms) var(--ease-out, ease), box-shadow var(--motion-fast, 140ms) ease, background var(--motion-fast, 140ms) ease;
        }
        .clay-menu-btn:hover {
          transform: translateY(-1px);
          box-shadow: 3px 3px 0px rgba(20,83,45,0.12), 0 8px 18px rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.9);
        }
        .clay-brand { text-decoration: none; display: flex; align-items: center; gap: 8px; transition: transform var(--motion-fast, 140ms) var(--ease-out, ease); }
        .clay-brand:hover { transform: translateY(-1px); }
        .clay-brand span { font-size: 1.15rem; font-weight: 800; color: #16a34a; letter-spacing: 0; }

        .clay-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: 310px;
          max-width: min(310px, 92vw);
          background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%);
          z-index: 1050; overflow-y: auto; display: flex; flex-direction: column;
          scrollbar-width: none;
          border-right: 2px solid rgba(255,255,255,0.7);
          box-shadow: 10px 0 40px rgba(15,23,42,0.16), inset -1px 0 rgba(255,255,255,0.42);
          will-change: transform, opacity;
        }
        .clay-drawer::-webkit-scrollbar { display: none; }

        .drawer-header {
          background: linear-gradient(135deg, #15803d 0%, #22c55e 100%);
          padding: 1.15rem 1.25rem;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 0px rgba(0,0,0,0.10);
          flex-shrink: 0;
        }
        .drawer-close {
          background: rgba(255,255,255,0.25);
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 12px;
          color: white; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1rem;
          transition: transform var(--motion-fast, 140ms) var(--ease-out, ease), background var(--motion-fast, 140ms) ease;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.12);
        }
        .drawer-close:hover { background: rgba(255,255,255,0.4); transform: scale(1.08); }

        .drawer-section {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          border: 2px solid rgba(255,255,255,0.7);
          box-shadow: 3px 3px 0px rgba(0,0,0,0.07), 0 8px 20px rgba(15,23,42,0.05);
          margin-bottom: 0.8rem;
          padding: 1rem;
        }
        .drawer-section h6 {
          color: #166534; font-weight: 700; margin-bottom: 0.75rem; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .nav-item-clay {
          display: flex; align-items: center; gap: 10px;
          color: #166534; padding: 0.56rem 0.85rem;
          border-radius: 12px; margin-bottom: 0.28rem;
          transition: transform var(--motion-fast, 140ms) var(--ease-out, ease), box-shadow var(--motion-fast, 140ms) ease, background var(--motion-fast, 140ms) ease, color var(--motion-fast, 140ms) ease;
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(255,255,255,0.6);
          text-decoration: none; font-weight: 500; font-size: 0.9rem;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.06);
        }
        .nav-item-clay:hover {
          background: rgba(255,255,255,0.85);
          transform: translateX(4px);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.10);
          color: #15803d;
        }
        .clay-drawer .nav-item-clay {
          animation: drawerLinkIn 260ms var(--ease-out, ease) both;
        }
        .clay-drawer .drawer-section:nth-child(1) .nav-item-clay { animation-delay: 40ms; }
        .clay-drawer .drawer-section:nth-child(2) .nav-item-clay { animation-delay: 70ms; }
        .clay-drawer .drawer-section:nth-child(3) .nav-item-clay { animation-delay: 100ms; }
        .clay-drawer .drawer-section:nth-child(4) .nav-item-clay { animation-delay: 130ms; }
        @keyframes drawerLinkIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nav-item-clay.active {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white; border-color: rgba(255,255,255,0.4);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.14);
        }
        .nav-item-clay.active-blue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white; border-color: rgba(255,255,255,0.4);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.14);
        }
        .nav-item-clay.active-dark {
          background: linear-gradient(135deg, #14532d, #166534);
          color: white; border-color: rgba(255,255,255,0.3);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.14);
        }
        .nav-item-logout {
          color: #dc2626 !important;
          background: rgba(254,226,226,0.7) !important;
          border-color: rgba(252,165,165,0.6) !important;
        }
        .nav-item-logout:hover {
          background: rgba(254,202,202,0.9) !important;
          color: #b91c1c !important;
        }
        @media (max-width: 575px) {
          .clay-navbar { height: 56px; }
          .clay-brand span { font-size: 1rem; }
          .clay-menu-btn { width: 36px; height: 36px; }
          .drawer-header { padding: 1rem; }
          .drawer-section { border-radius: 16px; padding: 1rem; }
          .nav-item-clay { font-size: 0.84rem; padding: 0.6rem 0.8rem; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="clay-navbar">
        <div className="container-fluid px-3 d-flex align-items-center gap-3">
          <button className="clay-menu-btn" onClick={() => setMenuAberto(true)} aria-label="Abrir menu de navegação" aria-expanded={menuAberto}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <Link className="clay-brand" to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/Verdenovologo.png" alt="VerDenovo" height="30" />
            <span>VerDenovo</span>
          </Link>
        </div>
      </nav>

      {/* Drawer */}
      {menuAberto && (
        <>
          <div className="drawer-overlay" onClick={fechar} style={{ position: 'fixed', inset: 0, background: 'rgba(6,78,59,0.34)', zIndex: 1040, backdropFilter: 'blur(6px)' }} aria-hidden="true" />
          <div className="clay-drawer" role="dialog" aria-modal="true" aria-label="Menu de navegação">
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/Verdenovologo.png" alt="VerDenovo" height="30" />
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>VerDenovo</span>
              </div>
              <button className="drawer-close" onClick={fechar} aria-label="Fechar menu">X</button>
            </div>

            <div style={{ padding: '1.25rem', flex: 1 }}>
              <div className="drawer-section">
                <h6><i className="bi bi-compass me-2"></i>Navegação</h6>
                <Link className={`nav-item-clay ${isActive('/') ? 'active' : ''}`} to="/" onClick={fechar}>
                  <i className="bi bi-house-fill"></i>Início
                </Link>
                <Link className={`nav-item-clay ${isActive('/pontos') ? 'active' : ''}`} to="/pontos" onClick={fechar}>
                  <i className="bi bi-geo-alt-fill"></i>Pontos de Coleta
                </Link>
              </div>

              <div className="drawer-section">
                <h6><i className="bi bi-book me-2"></i>Educação Ambiental</h6>
                <Link className={`nav-item-clay ${isActive('/materiais') ? 'active' : ''}`} to="/materiais" onClick={fechar}>
                  <i className="bi bi-recycle"></i>Materiais Recicláveis
                </Link>
                <Link className={`nav-item-clay ${isActive('/residuos') ? 'active' : ''}`} to="/residuos" onClick={fechar}>
                  <i className="bi bi-trash3-fill"></i>Resíduos
                </Link>
                <Link className={`nav-item-clay ${isActive('/faq') ? 'active' : ''}`} to="/faq" onClick={fechar}>
                  <i className="bi bi-question-circle-fill"></i>Perguntas Frequentes
                </Link>
              </div>

              <div className="drawer-section">
                <h6><i className="bi bi-person-circle me-2"></i>Conta</h6>
                {isLogado() ? (
                  <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '16px', padding: '1rem', border: '2px solid rgba(255,255,255,0.7)', boxShadow: '3px 3px 0px rgba(0,0,0,0.08)' }}>
                    <div className="text-center mb-3">
                      <span className="badge" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: 'white', padding: '6px 14px', fontSize: '0.72rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.12)' }}>
                        {usuario.tipo === 'ponto' ? 'PONTO LOGADO' : usuario.dados?.nivelAcesso === 'ADMIN' ? 'ADMINISTRADOR' : 'USUÁRIO LOGADO'}
                      </span>
                      <div className="mt-1"><small style={{ color: '#166534', fontWeight: 600 }}>{usuario.dados?.nome?.split(' ')[0] || usuario.dados?.email}</small></div>
                    </div>
                    {usuario.dados?.nivelAcesso === 'ADMIN' ? (
                      <>
                        <Link className={`nav-item-clay ${isActive('/cadastrar') ? 'active-dark' : ''}`} to="/cadastrar" onClick={fechar}>
                          <i className="bi bi-plus-circle-fill"></i>Adicionar Ponto
                        </Link>
                        <Link className={`nav-item-clay ${isActive('/gerenciar-contas') ? 'active-dark' : ''}`} to="/gerenciar-contas" onClick={fechar}>
                          <i className="bi bi-people-fill"></i>Gerenciar Contas
                        </Link>
                      </>
                    ) : usuario.tipo === 'usuario' ? (
                      <>
                        {usuario.pontoVinculado && (
                          <Link className={`nav-item-clay ${isActive('/personalizar-ponto') ? 'active' : ''}`} to="/personalizar-ponto" onClick={fechar}>
                            <i className="bi bi-gear-fill"></i>Gerenciar Meu Ponto
                          </Link>
                        )}
                        {!usuario.pontoVinculado && (
                          <Link className={`nav-item-clay ${isActive('/cadastrar') ? 'active' : ''}`} to="/cadastrar" onClick={fechar}>
                            <i className="bi bi-plus-circle-fill"></i>Cadastrar Ponto
                          </Link>
                        )}
                      </>
                    ) : null}
                    <button className="nav-item-clay nav-item-logout w-100 text-start mt-2" onClick={handleLogout} style={{ cursor: 'pointer' }} aria-label="Sair da conta">
                      <i className="bi bi-box-arrow-right"></i>Sair da Conta
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'rgba(220,252,231,0.7)', borderRadius: '16px', padding: '1rem', marginBottom: '0.75rem', border: '2px solid rgba(134,239,172,0.6)', boxShadow: '3px 3px 0px rgba(0,0,0,0.08)' }}>
                      <div className="text-center mb-2">
                        <span className="badge bg-success" style={{ fontSize: '0.7rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.10)' }}>CADASTRAR</span>
                      </div>
                      <Link className={`nav-item-clay ${isActive('/cadastro-usuario') ? 'active' : ''}`} to="/cadastro-usuario" onClick={fechar}>
                        <i className="bi bi-person-plus-fill"></i>Usuário
                      </Link>
                    </div>
                    <div style={{ background: 'rgba(219,234,254,0.7)', borderRadius: '16px', padding: '1rem', border: '2px solid rgba(147,197,253,0.6)', boxShadow: '3px 3px 0px rgba(0,0,0,0.08)' }}>
                      <div className="text-center mb-2">
                        <span className="badge bg-primary" style={{ fontSize: '0.7rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.10)' }}>LOGIN</span>
                      </div>
                      <Link className={`nav-item-clay ${isActive('/login-usuario') ? 'active-blue' : ''}`} to="/login-usuario" onClick={fechar}>
                        <i className="bi bi-person-circle"></i>Entrar na conta
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <div className="drawer-section">
                <h6><i className="bi bi-info-circle me-2"></i>Informações</h6>
                <Link className={`nav-item-clay ${isActive('/sobre') ? 'active' : ''}`} to="/sobre" onClick={fechar}>
                  <i className="bi bi-people-fill"></i>Sobre o VerDenovo
                </Link>
                <Link className={`nav-item-clay ${isActive('/conscientizacao') ? 'active' : ''}`} to="/conscientizacao" onClick={fechar}>
                  <i className="bi bi-tree-fill"></i>Conscientização Ambiental
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
