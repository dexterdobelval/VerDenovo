import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

function GerenciarContas() {
  const [usuarios, setUsuarios] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [inativos, setInativos] = useState([]);
  const [pontosInativos, setPontosInativos] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [rejeitados, setRejeitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [editando, setEditando] = useState(null);
  const [erroModal, setErroModal] = useState('');
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [buscaPonto, setBuscaPonto] = useState('');
  const [aba, setAba] = useState('usuarios');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [pontosData, usuariosData, pendentesData] = await Promise.all([
        apiService.listarTodosPontos(),
        apiService.listarUsuarios(),
        apiService.listarPontosPendentes()
      ]);
      const mapPonto = p => ({
        id: p.id, nome: p.nome, cep: p.cep, numero: p.numero,
        complemento: p.complemento, logradouro: p.logradouro,
        telefone: p.telefone, descricao: p.descricao,
        material: p.material, horaFuncionamento: p.horaFuncionamento,
        status: p.statusPonto, email: p.email
      });
      setPontos(pontosData.filter(p => p.statusPonto === 'ATIVO').map(mapPonto));
      setPontosInativos(pontosData.filter(p => p.statusPonto === 'INATIVO').map(mapPonto));
      setRejeitados(pontosData.filter(p => p.statusPonto === 'REJEITADO').map(p => ({
        id: p.id, nome: p.nome, cep: p.cep, material: p.material,
        horaFuncionamento: p.horaFuncionamento, email: p.email,
        status: p.statusPonto,
        telefone: p.telefone, descricao: p.descricao, logradouro: p.logradouro
      })));
      setPendentes(pendentesData.map(p => ({
        id: p.id, nome: p.nome, cep: p.cep, material: p.material,
        horaFuncionamento: p.horaFuncionamento, email: p.email,
        telefone: p.telefone, descricao: p.descricao, logradouro: p.logradouro
      })));
      const usuariosMapeados = usuariosData.map(u => ({
        id: u.id, nome: u.nome, email: u.email,
        ativo: u.statusUsuario === 'ATIVO', nivelAcesso: u.nivelAcesso
      }));
      setUsuarios(usuariosMapeados.filter(u => u.ativo || u.nivelAcesso === 'ADMIN'));
      setInativos(usuariosMapeados.filter(u => !u.ativo && u.nivelAcesso !== 'ADMIN'));
    } catch {
      setErro('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const alterarStatus = async (tipo, id) => {
    try {
      if (tipo === 'usuarios') await apiService.alterarStatusUsuario(id);
      else await apiService.alterarStatusPonto(id);
      carregarDados();
    } catch (e) { setErro(e.message || 'Erro ao alterar status.'); }
  };

  const aprovarPonto = async (id) => {
    try {
      await apiService.aprovarPonto(id);
      carregarDados();
    } catch (e) { setErro(e.message || 'Erro ao aprovar ponto.'); }
  };

  const rejeitarPonto = (id, nome) => {
    setConfirm({
      titulo: 'Rejeitar ponto',
      mensagem: `Tem certeza que deseja rejeitar "${nome}"? Ele não aparecerá no site.`,
      corBotao: 'warning',
      onConfirmar: async () => {
        setConfirm(null);
        try {
          await apiService.rejeitarPonto(id);
          carregarDados();
        } catch (e) { setErro(e.message || 'Erro ao rejeitar ponto.'); }
      },
      onCancelar: () => setConfirm(null)
    });
  };

  const abrirEdicao = (p) => {
    setErroModal('');
    setEditando({ ...p });
  };

  const salvarEdicao = async () => {
    setErroModal('');
    try {
      await apiService.atualizarPonto(editando.id, {
        nome: editando.nome,
        cep: editando.cep,
        logradouro: editando.logradouro,
        numero: editando.numero,
        complemento: editando.complemento,
        telefone: editando.telefone,
        email: editando.email,
        horaFuncionamento: editando.horaFuncionamento,
        material: editando.material,
        descricao: editando.descricao,
        statusPonto: editando.status,
      });
      setEditando(null);
      carregarDados();
    } catch (e) { setErroModal(e.message || 'Erro ao atualizar ponto.'); }
  };

  const pedirConfirmacaoExclusao = (tipo, id, nome) => {
    setConfirm({
      titulo: 'Excluir conta',
      mensagem: `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
      onConfirmar: async () => {
        setConfirm(null);
        try {
          if (tipo === 'pontos') await apiService.deletarPonto(id);
          else await apiService.deletarUsuario(id);
          carregarDados();
        } catch (e) { setErro(e.message || 'Erro ao excluir.'); }
      },
      onCancelar: () => setConfirm(null)
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="text-center">
          <div className="spinner-border text-danger mb-3" style={{width: '3rem', height: '3rem'}}></div>
          <p className="text-muted fw-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="text-center p-5">
          <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{width:'80px',height:'80px',background:'rgba(239,68,68,0.1)',borderRadius:'20px'}}>
            <i className="bi bi-wifi-off" style={{fontSize: '2.5rem', color: '#ef4444'}}></i>
          </div>
          <h5 className="text-danger fw-bold">{erro}</h5>
          <p className="text-muted">Verifique se o backend está rodando em <code>http://localhost:8080</code></p>
          <button className="btn btn-danger mt-2 px-4 fw-bold" style={{borderRadius:'12px'}} onClick={() => { setErro(''); setLoading(true); carregarDados(); }}>
            <i className="bi bi-arrow-clockwise me-2"></i>Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const usuariosFiltrados = usuarios.filter(u =>
    !buscaUsuario ||
    u.nome?.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscaUsuario.toLowerCase())
  );

  const pontosFiltrados = pontos.filter(p =>
    !buscaPonto ||
    p.nome?.toLowerCase().includes(buscaPonto.toLowerCase()) ||
    p.cep?.includes(buscaPonto)
  );

  const btn = { borderRadius: '12px', border: 'none', color: 'white', transition: 'all 0.2s' };

  const abas = [
    { id: 'usuarios', label: 'Usuários', icon: 'bi-people-fill', count: usuarios.length },
    { id: 'pontos', label: 'Pontos Ativos', icon: 'bi-geo-alt-fill', count: pontos.length },
    { id: 'pontosInativos', label: 'Pontos Inativos', icon: 'bi-geo-alt', count: pontosInativos.length },
    { id: 'rejeitados', label: 'Rejeitados', icon: 'bi-x-circle-fill', count: rejeitados.length },
    { id: 'inativos', label: 'Contas Inativas', icon: 'bi-person-slash', count: inativos.length },
    { id: 'pendentes', label: 'Aguardando Aprovação', icon: 'bi-hourglass-split', count: pendentes.length, badge: true },
  ];

  return (
    <div style={{background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem'}}>

      {/* Hero */}
      <div style={{background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 150%)', padding: '3rem 2rem 3rem', marginBottom: '0', position: 'relative', overflow: 'hidden'}}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'300px',height:'300px',background:'rgba(5,150,105,0.1)',borderRadius:'50%'}}></div>
        <div style={{position:'absolute',bottom:'-80px',left:'-40px',width:'250px',height:'250px',background:'rgba(255,255,255,0.03)',borderRadius:'50%'}}></div>
        <div className="text-center position-relative">
          <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4" style={{background:'rgba(16,185,129,0.2)',border:'1px solid rgba(16,185,129,0.4)'}}>
            <i className="bi bi-shield-lock" style={{color:'#6ee7b7',fontSize:'0.9rem'}}></i>
            <small style={{color:'#6ee7b7',fontWeight:'600',letterSpacing:'0.5px'}}>PAINEL ADMINISTRATIVO</small>
          </div>
          <h1 className="fw-bold mb-3" style={{fontSize:'2.8rem',color:'white',letterSpacing:'-0.02em'}}>
            Área <span style={{color:'#6ee7b7'}}>Administrativa</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'1rem',maxWidth:'500px',margin:'0 auto'}}>
            Gerencie usuários, pontos de coleta e monitore o sistema em tempo real
          </p>
        </div>
      </div>

      <div className="container" style={{position:'relative',zIndex:1,paddingTop:'2rem'}}>

        {/* Cards de estatísticas */}
        <div className="row mb-4 g-3" style={{marginTop:'0'}}>
          {[
            {label:'Usuários Ativos', value: usuarios.length, sub:`${inativos.length} inativos`, icon:'bi-people-fill', cor:'#3b82f6', bg:'linear-gradient(135deg, #eff6ff, #dbeafe)', sombra:'rgba(59,130,246,0.15)'},
            {label:'Pontos de Coleta', value: pontos.length, sub:`${pontos.filter(p=>p.status==='ATIVO').length} ativos`, icon:'bi-geo-alt-fill', cor:'#059669', bg:'linear-gradient(135deg, #f0fdf4, #dcfce7)', sombra:'rgba(5,150,105,0.15)'},
            {label:'Aguardando', value: pendentes.length, sub:'para aprovação', icon:'bi-hourglass-split', cor: pendentes.length > 0 ? '#d97706' : '#64748b', bg: pendentes.length > 0 ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)', sombra:'rgba(217,119,6,0.15)'},
            {label:'Rejeitados', value: rejeitados.length, sub:'pontos rejeitados', icon:'bi-x-circle-fill', cor: rejeitados.length > 0 ? '#dc2626' : '#64748b', bg: rejeitados.length > 0 ? 'linear-gradient(135deg, #fff5f5, #fee2e2)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)', sombra:'rgba(220,38,38,0.15)'},
          ].map((s,i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="h-100" style={{background:s.bg, borderRadius:'20px', padding:'1.5rem', boxShadow:`0 4px 20px ${s.sombra}`, border:`1px solid ${s.cor}20`, transition:'transform 0.2s'}}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div style={{width:'44px',height:'44px',background:`${s.cor}18`,borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <i className={`bi ${s.icon}`} style={{color:s.cor,fontSize:'1.2rem'}}></i>
                  </div>
                  <span style={{fontSize:'2rem',fontWeight:'800',color:s.cor,lineHeight:1}}>{s.value}</span>
                </div>
                <div style={{fontWeight:'700',color:'#1e293b',fontSize:'0.85rem'}}>{s.label}</div>
                <div style={{color:'#94a3b8',fontSize:'0.75rem',marginTop:'2px'}}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Abas */}
        <div style={{background:'white',borderRadius:'16px',padding:'6px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'1.5rem'}}>
          {abas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              className="position-relative fw-semibold"
              style={{
                flex:'1 1 auto', minWidth:'120px',
                borderRadius:'12px', border:'none', padding:'10px 16px',
                background: aba === a.id ? 'linear-gradient(135deg, #059669, #047857)' : 'transparent',
                color: aba === a.id ? 'white' : '#64748b',
                transition:'all 0.2s', fontSize:'0.85rem',
                boxShadow: aba === a.id ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
              }}>
              <i className={`bi ${a.icon} me-2`}></i>{a.label}
              {a.badge && a.count > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:'0.65rem',padding:'3px 6px'}}>
                  {a.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Aba Usuários */}
        {aba === 'usuarios' && (
          <div className="card border-0 mb-5" style={{borderRadius: '20px', boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>
            <div className="card-header border-0" style={{background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem'}}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '55px', height: '55px', background: 'rgba(255,255,255,0.2)'}}>
                  <i className="bi bi-people-fill text-white" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h4 className="text-white mb-0 fw-bold">Usuários Cadastrados</h4>
                  <p className="text-white-50 mb-0">Total: {usuarios.length} contas ativas</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="mb-3" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                <input type="text" className="form-control" placeholder="Buscar por nome ou email..."
                  value={buscaUsuario} onChange={e => setBuscaUsuario(e.target.value)}
                  style={{paddingLeft: '40px', paddingRight: buscaUsuario ? '36px' : '12px', borderRadius: '10px', boxShadow: 'none'}} />
                <i className="bi bi-search" style={{position: 'absolute', left: '14px', color: '#9ca3af', pointerEvents: 'none'}}></i>
                {buscaUsuario && (
                  <button onClick={() => setBuscaUsuario('')}
                    style={{position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px 6px'}}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
              {usuariosFiltrados.length === 0 && <p className="text-muted text-center py-3">Nenhum usuário encontrado.</p>}
              {usuariosFiltrados.map((u, i) => (
                <div key={u.id} className="p-4 mb-3 rounded-4"
                  style={{background: i % 2 === 0 ? 'rgba(59,130,246,0.05)' : 'rgba(248,250,252,0.8)', border: '1px solid rgba(59,130,246,0.1)', transition: 'all 0.3s'}}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{
                        width: '50px', height: '50px',
                        background: u.nivelAcesso === 'ADMIN' ? 'linear-gradient(135deg, #064e3b, #065f46)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      }}>
                        <i className={`bi ${u.nivelAcesso === 'ADMIN' ? 'bi-shield-lock' : 'bi-person'} text-white`}></i>
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark">
                          {u.nome}
                          {u.nivelAcesso === 'ADMIN' && <span className="badge ms-2" style={{fontSize: '0.7rem', background:'linear-gradient(135deg,#064e3b,#059669)'}}>ADMIN</span>}
                        </h6>
                        <small className="text-muted">{u.email}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {u.nivelAcesso !== 'ADMIN' ? (
                        <>
                          <span className="badge px-3 py-2 rounded-pill fw-bold" style={{background: u.ativo ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none'}}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => alterarStatus('usuarios', u.id)}
                            style={{...btn, background: u.ativo ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)'}}>
                            <i className={`bi ${u.ativo ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'} me-1`}></i>
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => pedirConfirmacaoExclusao('usuarios', u.id, u.nome)}
                            style={{...btn, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                            <i className="bi bi-trash3-fill me-1"></i>Excluir
                          </button>
                        </>
                      ) : (
                        <span className="text-muted fst-italic"><i className="bi bi-shield-lock me-2"></i>Conta Protegida</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba Pontos Ativos */}
        {aba === 'pontos' && (
          <div className="card border-0 mb-5" style={{borderRadius: '20px', boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>
            <div className="card-header border-0" style={{background: 'linear-gradient(135deg, #10b981, #047857)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem'}}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '55px', height: '55px', background: 'rgba(255,255,255,0.2)'}}>
                  <i className="bi bi-geo-alt-fill text-white" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h4 className="text-white mb-0 fw-bold">Pontos de Coleta</h4>
                  <p className="text-white-50 mb-0">Total: {pontos.length} locais</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {pontos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-geo-alt" style={{fontSize: '4rem', color: '#9ca3af'}}></i>
                  <h5 className="text-muted mt-3">Nenhum ponto cadastrado</h5>
                </div>
              ) : (
                <>
                  <div className="mb-3" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input type="text" className="form-control" placeholder="Buscar por nome ou CEP..."
                      value={buscaPonto} onChange={e => setBuscaPonto(e.target.value)}
                      style={{paddingLeft: '40px', paddingRight: buscaPonto ? '36px' : '12px', borderRadius: '10px', boxShadow: 'none'}} />
                    <i className="bi bi-search" style={{position: 'absolute', left: '14px', color: '#9ca3af', pointerEvents: 'none'}}></i>
                    {buscaPonto && (
                      <button onClick={() => setBuscaPonto('')}
                        style={{position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px 6px'}}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                  {pontosFiltrados.length === 0 && <p className="text-muted text-center py-3">Nenhum ponto encontrado.</p>}
                  {pontosFiltrados.map((p, i) => (
                    <div key={p.id} className="p-4 mb-3 rounded-4"
                      style={{background: i % 2 === 0 ? 'rgba(16,185,129,0.05)' : 'rgba(248,250,252,0.8)', border: '1px solid rgba(16,185,129,0.1)', transition: 'all 0.3s'}}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', background: 'linear-gradient(135deg, #10b981, #047857)'}}>
                            <i className="bi bi-geo-alt text-white"></i>
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold text-dark">{p.nome}</h6>
                            <small className="text-muted">CEP: {p.cep} · {p.material}</small>
                            <div><small className="text-success fw-bold">{p.horaFuncionamento}</small></div>
                            {p.email && <div><small className="text-muted"><i className="bi bi-envelope me-1"></i>{p.email}</small></div>}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge px-3 py-2 rounded-pill fw-bold" style={{
                            background: p.status === 'ATIVO'
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : p.status === 'REJEITADO'
                              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                              : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white', border: 'none'
                          }}>
                            {p.status === 'ATIVO' ? 'Ativo' : p.status === 'REJEITADO' ? 'Rejeitado' : 'Inativo'}
                          </span>
                          <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => abrirEdicao(p)}
                            style={{...btn, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}}>
                            <i className="bi bi-pencil-fill me-1"></i>Editar
                          </button>
                          <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => alterarStatus('pontos', p.id)}
                            style={{...btn, background: p.status === 'ATIVO' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)'}}>
                            <i className={`bi ${p.status === 'ATIVO' ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'} me-1`}></i>
                            {p.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => pedirConfirmacaoExclusao('pontos', p.id, p.nome)}
                            style={{...btn, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                            <i className="bi bi-trash3-fill me-1"></i>Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Aba Pontos Inativos */}
        {aba === 'pontosInativos' && (
          <div className="card border-0 mb-5" style={{borderRadius: '20px', boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>
            <div className="card-header border-0" style={{background: 'linear-gradient(135deg, #64748b, #475569)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem'}}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '55px', height: '55px', background: 'rgba(255,255,255,0.2)'}}>
                  <i className="bi bi-geo-alt text-white" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h4 className="text-white mb-0 fw-bold">Pontos Inativos</h4>
                  <p className="text-white-50 mb-0">{pontosInativos.length} ponto{pontosInativos.length !== 1 ? 's' : ''} desativado{pontosInativos.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {pontosInativos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-geo-alt" style={{fontSize: '4rem', color: '#10b981'}}></i>
                  <h5 className="text-success mt-3">Nenhum ponto inativo</h5>
                  <p className="text-muted">Todos os pontos aprovados estão ativos.</p>
                </div>
              ) : (
                pontosInativos.map((p, i) => (
                  <div key={p.id} className="p-4 mb-3 rounded-4"
                    style={{background: i % 2 === 0 ? 'rgba(100,116,139,0.05)' : 'rgba(248,250,252,0.8)', border: '1px solid rgba(100,116,139,0.15)', transition: 'all 0.3s'}}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(100,116,139,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', background: 'linear-gradient(135deg, #64748b, #475569)'}}>
                          <i className="bi bi-geo-alt text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">{p.nome}</h6>
                          <small className="text-muted">CEP: {p.cep}{p.logradouro ? ` · ${p.logradouro}` : ''}</small>
                          {p.material && <div><small className="text-muted">{p.material}</small></div>}
                          {p.email && <div><small className="text-muted"><i className="bi bi-envelope me-1"></i>{p.email}</small></div>}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="badge px-3 py-2 rounded-pill fw-bold" style={{background: 'linear-gradient(135deg, #64748b, #475569)', color: 'white', border: 'none'}}>
                          Inativo
                        </span>
                        <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => alterarStatus('pontos', p.id)}
                          style={{...btn, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                          <i className="bi bi-play-circle-fill me-1"></i>Reativar
                        </button>
                        <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => pedirConfirmacaoExclusao('pontos', p.id, p.nome)}
                          style={{...btn, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                          <i className="bi bi-trash3-fill me-1"></i>Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Aba Pendentes */}
        {aba === 'pendentes' && (
          <div className="card border-0 mb-5" style={{borderRadius: '20px', boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>
            <div className="card-header border-0" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem'}}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '55px', height: '55px', background: 'rgba(255,255,255,0.2)'}}>
                  <i className="bi bi-hourglass-split text-white" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h4 className="text-white mb-0 fw-bold">Aguardando Aprovação</h4>
                  <p className="text-white-50 mb-0">{pendentes.length} ponto{pendentes.length !== 1 ? 's' : ''} para revisar</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {pendentes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle" style={{fontSize: '4rem', color: '#10b981'}}></i>
                  <h5 className="text-success mt-3">Tudo em dia!</h5>
                  <p className="text-muted">Nenhum ponto aguardando aprovação.</p>
                </div>
              ) : (
                pendentes.map((p) => (
                  <div key={p.id} className="p-4 mb-4 rounded-4" style={{background: 'rgba(245,158,11,0.05)', border: '2px solid rgba(245,158,11,0.2)'}}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', flexShrink: 0}}>
                          <i className="bi bi-geo-alt text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">{p.nome}</h6>
                          <small className="text-muted">CEP: {p.cep}{p.logradouro ? ` · ${p.logradouro}` : ''}</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none'}}>
                        ⏳ Pendente
                      </span>
                    </div>
                    <div className="row g-2 mb-3">
                      {p.material && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-recycle me-1 text-success"></i>Materiais</small>
                          <small className="fw-medium">{p.material}</small>
                        </div>
                      )}
                      {p.horaFuncionamento && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-clock me-1 text-primary"></i>Horário</small>
                          <small className="fw-medium">{p.horaFuncionamento}</small>
                        </div>
                      )}
                      {p.email && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-envelope me-1 text-info"></i>Email</small>
                          <small className="fw-medium">{p.email}</small>
                        </div>
                      )}
                      {p.telefone && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-telephone me-1 text-purple"></i>Telefone</small>
                          <small className="fw-medium">{p.telefone}</small>
                        </div>
                      )}
                    </div>
                    {p.descricao && (
                      <div className="p-3 rounded-3 mb-3" style={{background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)'}}>
                        <small className="text-muted d-block mb-1"><i className="bi bi-card-text me-1"></i>Descrição</small>
                        <small>{p.descricao}</small>
                      </div>
                    )}
                    <div className="d-flex gap-2 flex-wrap">
                      <button className="btn fw-bold px-4 py-2" onClick={() => aprovarPonto(p.id)}
                        style={{...btn, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                        <i className="bi bi-check-circle-fill me-2"></i>Aprovar
                      </button>
                      <button className="btn fw-bold px-4 py-2" onClick={() => rejeitarPonto(p.id, p.nome)}
                        style={{...btn, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                        <i className="bi bi-x-circle-fill me-2"></i>Rejeitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Aba Rejeitados */}
        {aba === 'rejeitados' && (
          <div className="card border-0 mb-5" style={{borderRadius: '20px', boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>
            <div className="card-header border-0" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem'}}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '55px', height: '55px', background: 'rgba(255,255,255,0.2)'}}>
                  <i className="bi bi-x-circle-fill text-white" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h4 className="text-white mb-0 fw-bold">Pontos Rejeitados</h4>
                  <p className="text-white-50 mb-0">{rejeitados.length} ponto{rejeitados.length !== 1 ? 's' : ''} rejeitado{rejeitados.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {rejeitados.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle" style={{fontSize: '4rem', color: '#10b981'}}></i>
                  <h5 className="text-success mt-3">Nenhum ponto rejeitado</h5>
                </div>
              ) : (
                rejeitados.map((p) => (
                  <div key={p.id} className="p-4 mb-4 rounded-4" style={{background: 'rgba(239,68,68,0.05)', border: '2px solid rgba(239,68,68,0.15)'}}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', flexShrink: 0}}>
                          <i className="bi bi-geo-alt text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">{p.nome}</h6>
                          <small className="text-muted">CEP: {p.cep}{p.logradouro ? ` · ${p.logradouro}` : ''}</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none'}}>
                        Rejeitado
                      </span>
                    </div>
                    <div className="row g-2 mb-3">
                      {p.email && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-envelope me-1 text-info"></i>Email</small>
                          <small className="fw-medium">{p.email}</small>
                        </div>
                      )}
                      {p.material && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-recycle me-1 text-success"></i>Materiais</small>
                          <small className="fw-medium">{p.material}</small>
                        </div>
                      )}
                      {p.horaFuncionamento && (
                        <div className="col-md-4">
                          <small className="text-muted d-block"><i className="bi bi-clock me-1 text-primary"></i>Horário</small>
                          <small className="fw-medium">{p.horaFuncionamento}</small>
                        </div>
                      )}
                    </div>
                    {p.descricao && (
                      <div className="p-3 rounded-3 mb-3" style={{background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)'}}>
                        <small className="text-muted d-block mb-1"><i className="bi bi-card-text me-1"></i>Descrição</small>
                        <small>{p.descricao}</small>
                      </div>
                    )}
                    <div className="d-flex gap-2 flex-wrap">
                      <button className="btn fw-bold px-4 py-2" onClick={() => aprovarPonto(p.id)}
                        style={{...btn, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                        <i className="bi bi-check-circle-fill me-2"></i>Aprovar mesmo assim
                      </button>
                      <button className="btn fw-bold px-4 py-2" onClick={() => pedirConfirmacaoExclusao('pontos', p.id, p.nome)}
                        style={{...btn, background: 'linear-gradient(135deg, #6b7280, #4b5563)'}}>
                        <i className="bi bi-trash3-fill me-2"></i>Excluir permanentemente
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Aba Contas Inativas */}
        {aba === 'inativos' && (
          <div className="card border-0 mb-5" style={{borderRadius: '20px', boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>
            <div className="card-header border-0" style={{background: 'linear-gradient(135deg, #6b7280, #4b5563)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem'}}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '55px', height: '55px', background: 'rgba(255,255,255,0.2)'}}>
                  <i className="bi bi-person-slash text-white" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <h4 className="text-white mb-0 fw-bold">Contas Inativas</h4>
                  <p className="text-white-50 mb-0">{inativos.length} conta{inativos.length !== 1 ? 's' : ''} inativa{inativos.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {inativos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-person-check" style={{fontSize: '4rem', color: '#10b981'}}></i>
                  <h5 className="text-success mt-3">Nenhuma conta inativa</h5>
                  <p className="text-muted">Todos os usuários estão ativos.</p>
                </div>
              ) : (
                inativos.map((u, i) => (
                  <div key={u.id} className="p-4 mb-3 rounded-4"
                    style={{background: i % 2 === 0 ? 'rgba(107,114,128,0.05)' : 'rgba(248,250,252,0.8)', border: '1px solid rgba(107,114,128,0.15)', transition: 'all 0.3s'}}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(107,114,128,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', background: 'linear-gradient(135deg, #6b7280, #4b5563)'}}>
                          <i className="bi bi-person-slash text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">{u.nome}</h6>
                          <small className="text-muted">{u.email}</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="badge px-3 py-2 rounded-pill fw-bold" style={{background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', border: 'none'}}>
                          Inativo
                        </span>
                        <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => alterarStatus('usuarios', u.id)}
                          style={{...btn, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                          <i className="bi bi-play-circle-fill me-1"></i>Reativar
                        </button>
                        <button className="btn btn-sm px-3 py-2 fw-bold" onClick={() => pedirConfirmacaoExclusao('usuarios', u.id, u.nome)}
                          style={{...btn, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                          <i className="bi bi-trash3-fill me-1"></i>Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
      {confirm && <ConfirmModal {...confirm} />}

      {editando && (
        <>
          <div
            onClick={() => setEditando(null)}
            style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1040}}
          />
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', overflowY: 'auto', pointerEvents: 'none'
          }}>
            <div style={{
              background: 'white', borderRadius: '20px', width: '100%', maxWidth: '720px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)', pointerEvents: 'all'
            }}>
              <div style={{background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h5 style={{color: 'white', fontWeight: 'bold', margin: 0}}>
                  <i className="bi bi-pencil-fill me-2"></i>Editar Ponto
                </h5>
                <button onClick={() => setEditando(null)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', padding: '4px 10px', cursor: 'pointer'}}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div style={{padding: '2rem'}}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">Nome</label>
                    <input className="form-control" value={editando.nome || ''} onChange={e => setEditando(prev => ({...prev, nome: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold text-muted small">CEP</label>
                    <input className="form-control" value={editando.cep || ''} onChange={e => setEditando(prev => ({...prev, cep: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold text-muted small">Número</label>
                    <input className="form-control" value={editando.numero || ''} onChange={e => setEditando(prev => ({...prev, numero: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">Logradouro</label>
                    <input className="form-control" value={editando.logradouro || ''} onChange={e => setEditando(prev => ({...prev, logradouro: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">Complemento</label>
                    <input className="form-control" value={editando.complemento || ''} onChange={e => setEditando(prev => ({...prev, complemento: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">Email</label>
                    <input className="form-control" type="email" value={editando.email || ''} onChange={e => setEditando(prev => ({...prev, email: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">Telefone</label>
                    <input className="form-control" value={editando.telefone || ''} onChange={e => setEditando(prev => ({...prev, telefone: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-muted small">Horário de Funcionamento</label>
                    <input className="form-control" value={editando.horaFuncionamento || ''} onChange={e => setEditando(prev => ({...prev, horaFuncionamento: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-muted small">Materiais Aceitos</label>
                    <input className="form-control" value={editando.material || ''} onChange={e => setEditando(prev => ({...prev, material: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-muted small">Descrição</label>
                    <textarea className="form-control" rows={3} value={editando.descricao || ''} onChange={e => setEditando(prev => ({...prev, descricao: e.target.value}))} style={{borderRadius: '10px'}} />
                  </div>
                </div>
              </div>
              <div style={{background: '#f8fafc', borderRadius: '0 0 20px 20px', padding: '1.25rem 2rem'}}>
                {erroModal && (
                  <div className="alert alert-danger py-2 mb-3" style={{borderRadius: '10px'}}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{erroModal}
                  </div>
                )}
                <div className="d-flex gap-2 justify-content-end">
                  <button onClick={() => setEditando(null)}
                    style={{borderRadius: '10px', border: '2px solid #e5e7eb', background: 'white', color: '#4b5563', fontWeight: 'bold', padding: '8px 24px', cursor: 'pointer'}}>
                    Cancelar
                  </button>
                  <button onClick={salvarEdicao}
                    style={{borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 'bold', padding: '8px 24px', cursor: 'pointer'}}>
                    <i className="bi bi-check-circle-fill me-2"></i>Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GerenciarContas;
