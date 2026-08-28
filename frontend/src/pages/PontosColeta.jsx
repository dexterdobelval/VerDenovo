import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Icon from '../components/Icon';
import { MATERIAIS_ACEITOS, normalizarMateriais } from '../utils/materiais';

const materialConfig = Object.fromEntries(
  MATERIAIS_ACEITOS.map(material => [
    material.label,
    { id: material.id, icon: material.icon, color: material.color }
  ])
);

const pastel = {
  'Papel':      { bg: '#dbeafe', activeBg: '#2563eb', border: '#93c5fd', activeText: '#fff', text: '#1d4ed8' },
  'Plástico':   { bg: '#fee2e2', activeBg: '#dc2626', border: '#fca5a5', activeText: '#fff', text: '#b91c1c' },
  'Vidro':      { bg: '#d1fae5', activeBg: '#059669', border: '#6ee7b7', activeText: '#fff', text: '#065f46' },
  'Metal':      { bg: '#fef3c7', activeBg: '#d97706', border: '#fcd34d', activeText: '#fff', text: '#92400e' },
  'Eletrônico': { bg: '#ede9fe', activeBg: '#7c3aed', border: '#c4b5fd', activeText: '#fff', text: '#5b21b6' },
  'Orgânico':   { bg: '#ecfccb', activeBg: '#65a30d', border: '#bef264', activeText: '#fff', text: '#3f6212' },
};


const textoOuPadrao = (valor, padrao = 'Não informado') => valor || padrao;

const pontoVerificado = (ponto) => ponto?.statusVerificacao === 'VERIFICADO';

function FilterChip({ nome, cfg, ativo, onClick }) {
  const p = pastel[nome] || { bg: '#f3f4f6', activeBg: '#374151', border: '#d1d5db', activeText: '#fff', text: '#374151' };
  const bg = ativo ? p.activeBg : p.bg;
  const color = ativo ? p.activeText : p.text;
  const shadow = ativo ? `0 4px 14px ${p.activeBg}55` : 'none';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className="filter-chip"
      style={{
        border: `1.5px solid ${ativo ? p.activeBg : p.border}`,
        background: bg, color,
        boxShadow: shadow,
      }}>
      <Icon name={cfg.icon} size={15} />
      {nome}
      {ativo && <i className="bi bi-check-lg" style={{ fontSize: '0.75rem', marginLeft: '2px' }} />}
    </button>
  );
}

function SearchInput({ busca, setBusca }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`points-search ${focused ? 'is-focused' : ''}`}>
      <i className="bi bi-search flex-shrink-0"
        style={{ fontSize: '1.1rem', color: focused ? '#059669' : '#9ca3af', transition: 'color 0.2s ease' }} />
      <input
        type="text"
        aria-label="Buscar pontos de coleta"
        className="border-0 w-100 bg-transparent"
        placeholder="Buscar por nome, CEP ou endereço..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ outline: 'none', fontSize: '0.97rem', color: '#111827', fontWeight: 400 }}
      />
      {busca && (
        <button className="btn p-0 d-flex align-items-center flex-shrink-0"
          onClick={() => setBusca('')}
          aria-label="Limpar busca"
          style={{ color: '#9ca3af', lineHeight: 1, background: 'none', border: 'none' }}>
          <i className="bi bi-x-circle-fill" style={{ fontSize: '1rem' }} />
        </button>
      )}
    </div>
  );
}

function PontoCard({ ponto, onClick }) {
  const materiais = normalizarMateriais(ponto.material);
  const enderecoCurto = ponto.logradouro
    ? `${ponto.logradouro}${ponto.numero ? `, Nº ${ponto.numero}` : ''}`
    : `CEP: ${textoOuPadrao(ponto.cep)}`;
  const bairroCidade = [ponto.bairro, ponto.cidade].filter(Boolean).join(' - ');

  return (
    <div
      className="ponto-card point-card h-100"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick();
      }}>
      <div className="point-card-main">
        <div className="point-card-icon">
          <i className="bi bi-geo-alt-fill" />
        </div>

        <div className="point-card-content">
          <div className="point-card-heading">
            <div>
              <div className="d-flex gap-2 flex-wrap mb-1">
                <span className="point-status">
                  <i className="bi bi-circle-fill" />
                  Ativo
                </span>
                {pontoVerificado(ponto) && (
                  <span className="point-status" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                    <i className="bi bi-patch-check-fill" />
                    Verificado
                  </span>
                )}
              </div>
              <h3>{textoOuPadrao(ponto.nome, 'Ponto de coleta')}</h3>
            </div>
          </div>

          <p className="point-address">
            <i className="bi bi-map" />
            <span>{enderecoCurto}</span>
          </p>
          {bairroCidade && <p className="point-neighborhood">{bairroCidade}</p>}

          <div className="point-meta-grid">
            <span>
              <i className="bi bi-clock-fill" />
              {textoOuPadrao(ponto.horaFuncionamento, 'Horário não informado')}
            </span>
            <span>
              <i className="bi bi-telephone-fill" />
              {textoOuPadrao(ponto.telefone, 'Contato não informado')}
            </span>
          </div>
        </div>
      </div>

      <div className="point-card-footer">
        <div className="point-materials">
          {materiais.slice(0, 4).map((mat) => {
              const c = materialConfig[mat.label] || { color: mat.color, icon: mat.icon };
              return (
                <span key={mat.id || mat.label} className="material-tag" style={{ color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}35` }}>
                  <Icon name={c.icon} size={13} />{mat.label}
                </span>
              );
            })}
          {materiais.length > 4 && <span className="material-tag material-tag-more">+{materiais.length - 4}</span>}
        </div>
        <button
          type="button"
          className="point-card-action"
          aria-label={`Ver detalhes de ${textoOuPadrao(ponto.nome, 'ponto de coleta')}`}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}>
          Detalhes
          <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}

function ModalButton({ onClick, disabled, variant, icon, label, style }) {
  const [hovered, setHovered] = useState(false);

  const variants = {
    primary: {
      background: hovered ? 'linear-gradient(135deg, #047857, #059669)' : 'linear-gradient(135deg, #059669, #10b981)',
      color: 'white',
      border: 'none',
      boxShadow: hovered ? '0 8px 24px rgba(5,150,105,0.45)' : '0 3px 12px rgba(5,150,105,0.25)',
      transform: hovered ? 'translateY(-2px)' : 'none',
    },
    outline: {
      background: hovered ? '#f0fdf4' : 'white',
      color: disabled ? '#9ca3af' : '#059669',
      border: `1.5px solid ${disabled ? '#d1d5db' : hovered ? '#059669' : '#10b981'}`,
      boxShadow: hovered && !disabled ? '0 4px 12px rgba(5,150,105,0.15)' : 'none',
      transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
    },
    ghost: {
      background: hovered ? '#e2e8f0' : '#f1f5f9',
      color: hovered ? '#475569' : '#64748b',
      border: 'none',
      boxShadow: 'none',
      transform: 'none',
    },
  };

  const v = variants[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        padding: '12px 16px', borderRadius: '13px',
        fontSize: '0.88rem', fontWeight: variant === 'primary' ? 700 : variant === 'outline' ? 600 : 500,
        letterSpacing: '0.01em', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        ...v,
      }}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: '0.9rem' }} />}
      {label}
    </button>
  );
}

function LocationField({ label, icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem 1.1rem', borderRadius: '14px', background: '#fafafa', border: '1px solid #f0f0f0' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
        <i className={`bi ${icon}`} style={{ color: '#059669', fontSize: '0.85rem' }}></i>
      </div>
      <div>
        <p style={{ color: '#9ca3af', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>{label}</p>
        <p style={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{value}</p>
      </div>
    </div>
  );
}

function MapsButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '12px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 700,
        border: 'none', cursor: 'pointer', letterSpacing: '0.01em',
        background: hovered ? 'linear-gradient(135deg, #047857, #059669)' : 'linear-gradient(135deg, #059669, #10b981)',
        color: 'white',
        boxShadow: hovered ? '0 8px 24px rgba(5,150,105,0.4)' : '0 3px 10px rgba(5,150,105,0.2)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
      }}>
      <i className="bi bi-map-fill" style={{ fontSize: '1rem' }}></i>
      Abrir no Google Maps
    </button>
  );
}

function PontosColeta() {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroMateriais, setFiltroMateriais] = useState([]);

  useEffect(() => { carregarPontos(); }, []);

  useEffect(() => {
    if (!pontoSelecionado) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPontoSelecionado(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pontoSelecionado]);

  const carregarPontos = async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await apiService.listarPontos();
      setPontos(Array.isArray(data) ? data : []);
    } catch {
      setErro('Não foi possível carregar os pontos de coleta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaterial = (materialId) => {
    setFiltroMateriais(prev =>
      prev.includes(materialId) ? prev.filter(m => m !== materialId) : [...prev, materialId]
    );
  };

  const pontosFiltrados = useMemo(() => {
    return pontos.filter(p => {
      const termoBusca = busca.toLowerCase();
      const materialIds = normalizarMateriais(p.material).map(material => material.id);
      const matchBusca = !busca ||
        p.nome?.toLowerCase().includes(termoBusca) ||
        p.cep?.includes(termoBusca) ||
        p.logradouro?.toLowerCase().includes(termoBusca) ||
        p.numero?.toLowerCase().includes(termoBusca);
      const matchMaterial = filtroMateriais.length === 0 ||
        filtroMateriais.every(m => materialIds.includes(m));
      return matchBusca && matchMaterial;
    });
  }, [pontos, busca, filtroMateriais]);

  const formatarMateriais = (material) => {
    const materiais = normalizarMateriais(material);
    return materiais.length ? materiais.map(item => item.label).join(', ') : 'Não informado';
  };

  const abrirMaps = (ponto) => {
    const query = encodeURIComponent(`${ponto?.logradouro || ''} ${ponto?.numero || ''} ${ponto?.cep || ''}`.trim() || ponto?.nome || 'ponto de coleta');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <>
      {/* Page background */}
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #d4edda 0%, #c8e6c9 40%, #dcedc8 100%)', zIndex: -1, pointerEvents: 'none' }} />

      <div className="pontos-shell points-page-shell">

      <section className="points-dashboard animate-fadeInUp">
        <div className="points-dashboard-copy">
          <span className="section-kicker"><i className="bi bi-recycle me-2" />Reciclagem local</span>
          <h1>Pontos de Coleta</h1>
          <p>Encontre locais cadastrados, filtre por material e veja rapidamente o melhor lugar para descartar seus recicláveis.</p>
        </div>

        <div className="points-app-panel" aria-label="Resumo visual dos pontos de coleta">
          <div className="points-mini-map" aria-hidden="true">
            <span className="map-pin map-pin-a" />
            <span className="map-pin map-pin-b" />
            <span className="map-pin map-pin-c" />
            <div className="map-route" />
          </div>
          <div className="points-dashboard-stats">
            {[
              { icon: 'bi-geo-alt-fill', label: 'Pontos ativos', value: pontos.length, tone: 'green' },
              { icon: 'bi-funnel-fill', label: 'Na tela', value: pontosFiltrados.length, tone: 'blue' },
              { icon: 'bi-tags-fill', label: 'Materiais', value: '6 tipos', tone: 'amber' },
            ].map((stat) => (
              <div key={stat.label} className={`points-stat points-stat-${stat.tone}`}>
                <i className={`bi ${stat.icon}`} />
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="points-toolbar animate-fadeInUp animate-delay-1" aria-label="Busca e filtros de pontos de coleta">
        <div className="points-toolbar-row">
          <SearchInput busca={busca} setBusca={setBusca} />
          {(busca || filtroMateriais.length > 0) && (
            <button className="points-clear-btn"
              type="button"
              onClick={() => { setBusca(''); setFiltroMateriais([]); }}>
              <i className="bi bi-x-lg"></i>Limpar
            </button>
          )}
        </div>

        <div className="points-filter-row">
          <span className="points-filter-label">Materiais</span>
          <div className="points-filter-chips">
            {MATERIAIS_ACEITOS.map((material) => {
              const cfg = materialConfig[material.label];
              const ativo = filtroMateriais.includes(material.id);
              return (
                <FilterChip key={material.id} nome={material.label} cfg={cfg} ativo={ativo} onClick={() => toggleMaterial(material.id)} />
              );
            })}
          </div>
          <span className="points-result-count">
            <strong>{pontosFiltrados.length}</strong> de {pontos.length}
          </span>
        </div>
      </section>

      {loading && (
        <div className="points-state loading-state animate-scaleIn">
          <div className="points-state-icon">
            <div className="spinner-border text-success" />
          </div>
          <h2>Carregando pontos</h2>
          <p>Buscando os locais cadastrados para você.</p>
        </div>
      )}

      {!loading && erro && (
        <div className="points-state error-state animate-scaleIn">
          <div className="points-state-icon points-state-icon-error">
            <i className="bi bi-wifi-off"></i>
          </div>
          <h2>Não foi possível carregar</h2>
          <p>{erro}</p>
          <button className="btn btn-success fw-semibold px-4" type="button" onClick={carregarPontos}>
            <i className="bi bi-arrow-clockwise me-2"></i>Tentar novamente
          </button>
        </div>
      )}

      {!loading && !erro && pontosFiltrados.length === 0 && (
        <div className="points-state empty-state animate-scaleIn">
          <div className="points-state-icon">
            <i className="bi bi-map"></i>
          </div>
          <h2>
            {pontos.length === 0 ? 'Nenhum ponto cadastrado ainda.' : 'Nenhum resultado encontrado'}
          </h2>
          <p>
            {pontos.length === 0
              ? 'Quando um ponto for cadastrado, ele aparecerá aqui com materiais, endereço e detalhes.'
              : 'Tente combinar menos filtros ou buscar por outro endereço, CEP ou nome.'}
          </p>
          <div className="points-state-actions">
            <Link to="/cadastrar" className="btn btn-success fw-semibold px-4">
              <i className="bi bi-plus-circle me-2"></i>Cadastrar ponto
            </Link>
            {(busca || filtroMateriais.length > 0) && (
              <button className="btn btn-outline-success fw-semibold px-4" type="button" onClick={() => { setBusca(''); setFiltroMateriais([]); }}>
              <i className="bi bi-x-circle me-2"></i>Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !erro && pontosFiltrados.length > 0 && (
        <div className="points-grid pb-4">
          {pontosFiltrados.map((ponto, index) => (
            <div key={ponto.id || `${ponto.nome}-${ponto.cep}-${index}`} className="animate-scaleIn" style={{ animationDelay: `${index * 0.06}s` }}>
              <PontoCard ponto={ponto} onClick={() => setPontoSelecionado(ponto)} />
            </div>
          ))}
        </div>
      )}

      </div>{/* end maxWidth wrapper */}

      {/* Modal */}
      {pontoSelecionado && (
        <>
          <style>{`
            @keyframes modalBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalContentIn  { from { opacity: 0; transform: scale(0.985) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .modal-pontos-backdrop { animation: modalBackdropIn var(--motion-normal, 220ms) ease both; }
            .modal-pontos-content  { animation: modalContentIn 260ms var(--ease-out, ease) both; }
            @media (max-width: 575px) {
              .modal-pontos-stats { grid-template-columns: repeat(2, 1fr) !important; padding: 1rem !important; }
            }
          `}</style>
          <div
            className="modal d-block modal-pontos-backdrop"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setPontoSelecionado(null)}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: '1.5rem auto' }}>
              <div className="modal-content modal-pontos-content border-0" style={{ borderRadius: '28px', overflow: 'hidden', boxShadow: '8px 8px 0px rgba(0,0,0,0.15), 0 32px 80px rgba(0,0,0,0.20)', border: '2px solid rgba(255,255,255,0.6)' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)', padding: '2.25rem 2rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                    {pontoSelecionado.imagemPonto
                      ? <img src={pontoSelecionado.imagemPonto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                      : <i className="bi bi-geo-alt-fill" style={{ color: '#6ee7b7', fontSize: '1.7rem' }}></i>
                    }
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', letterSpacing: '-0.03em', marginBottom: '5px', lineHeight: 1.15 }}>
                      {pontoSelecionado.nome}
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400, fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.01em' }}>
                      <i className="bi bi-geo-alt" style={{ fontSize: '0.75rem' }}></i>
                      {pontoSelecionado.logradouro
                        ? `${pontoSelecionado.logradouro}${pontoSelecionado.numero ? `, Nº ${pontoSelecionado.numero}` : ''}`
                        : `CEP: ${textoOuPadrao(pontoSelecionado.cep)}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Fechar detalhes do ponto"
                    onClick={() => setPontoSelecionado(null)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease' }}>
                    <i className="bi bi-x-lg" style={{ fontSize: '0.95rem' }}></i>
                  </button>
                </div>
              </div>

              {/* Stats bar */}
              <div className="modal-pontos-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', borderBottom: '1px solid #f0f0f0', background: '#f8fafc', padding: '1.25rem 1.5rem', gap: '0.75rem' }}>
                {[
                  { label: 'Status',    value: 'Ativo',                                                                   icon: 'bi-check-circle-fill', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
                  ...(pontoVerificado(pontoSelecionado)
                    ? [{ label: 'Verificacao', value: 'Verificado', icon: 'bi-patch-check-fill', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' }]
                    : []),
                  { label: 'Horário',   value: textoOuPadrao(pontoSelecionado.horaFuncionamento, 'Não informado'),        icon: 'bi-clock-fill',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                  { label: 'Contato',   value: textoOuPadrao(pontoSelecionado.telefone),                                  icon: 'bi-telephone-fill',    color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
                  { label: 'Materiais', value: `${formatarMateriais(pontoSelecionado.material).split(', ').length} tipos`, icon: 'bi-recycle',           color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '1rem 0.75rem',
                    textAlign: 'center',
                    border: `1.5px solid ${item.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', color: item.color }}></i>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3, wordBreak: 'break-word' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Body */}
              <div style={{ padding: '2rem' }}>
                <div className="row g-4">

                  {/* Localização */}
                  <div className="col-12 col-md-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.6rem', borderBottom: '2px solid #f0fdf4' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="bi bi-geo-alt-fill" style={{ color: '#059669', fontSize: '0.85rem' }}></i>
                      </div>
                      <h6 style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em', margin: 0 }}>Localização</h6>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <LocationField
                        label="Endereço"
                        icon="bi-signpost-2-fill"
                        value={pontoSelecionado.logradouro
                          ? `${pontoSelecionado.logradouro}${pontoSelecionado.numero ? `, Nº ${pontoSelecionado.numero}` : ''}`
                          : `CEP: ${textoOuPadrao(pontoSelecionado.cep)}${pontoSelecionado.numero ? `, Nº ${pontoSelecionado.numero}` : ''}`}
                      />
                      {pontoSelecionado.complemento && (
                        <LocationField
                          label="Complemento"
                          icon="bi-building"
                          value={pontoSelecionado.complemento}
                        />
                      )}
                    </div>

                    <MapsButton onClick={() => abrirMaps(pontoSelecionado)} />
                  </div>

                  {/* Materiais */}
                  <div className="col-12 col-md-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.6rem', borderBottom: '2px solid #f0fdf4' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="bi bi-recycle" style={{ color: '#059669', fontSize: '0.85rem' }}></i>
                      </div>
                      <h6 style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em', margin: 0 }}>Materiais Aceitos</h6>
                    </div>

                    {(() => {
                      const lista = formatarMateriais(pontoSelecionado.material).split(', ');
                      const naoInformado = lista.length === 1 && (lista[0] === 'Não informado' || !materialConfig[lista[0]]);
                      if (naoInformado) {
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.9rem 1rem', borderRadius: '12px', background: '#f9fafb', border: '1px dashed #d1d5db' }}>
                            <i className="bi bi-question-circle" style={{ color: '#9ca3af', fontSize: '1rem' }}></i>
                            <span style={{ color: '#9ca3af', fontSize: '0.83rem', fontWeight: 500 }}>Materiais não especificados</span>
                          </div>
                        );
                      }
                      return (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {lista.map((mat, i) => {
                            const cfg = materialConfig[mat] || { color: '#6b7280', icon: 'recycle' };
                            const p = pastel[mat] || { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
                            return (
              <span key={i} className="material-tag" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 13px', borderRadius: '999px',
                                background: p.bg, border: `1.5px solid ${p.border}`,
                                color: p.text, fontSize: '0.78rem', fontWeight: 600,
                              }}>
                                <Icon name={cfg.icon} size={14} />
                                {mat}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Descrição */}
                  {pontoSelecionado.descricao && (
                    <div className="col-12">
                      <div style={{ background: '#fffbeb', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid #fde68a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                          <i className="bi bi-info-circle-fill" style={{ color: '#d97706', fontSize: '0.9rem' }}></i>
                          <h6 style={{ color: '#92400e', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>Sobre este ponto</h6>
                        </div>
                        <p style={{ margin: 0, color: '#78716c', fontSize: '0.88rem', lineHeight: '1.75', fontWeight: 400 }}>{pontoSelecionado.descricao}</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '0 2rem 2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <ModalButton
                  onClick={() => pontoSelecionado.telefone && window.open(`tel:${pontoSelecionado.telefone}`)}
                  disabled={!pontoSelecionado.telefone}
                  variant="outline"
                  icon="bi-telephone-fill"
                  label="Ligar"
                  style={{ flex: 1, minWidth: '100px' }}
                />
                <ModalButton
                  onClick={() => abrirMaps(pontoSelecionado)}
                  variant="primary"
                  icon="bi-map-fill"
                  label="Como Chegar"
                  style={{ flex: 2, minWidth: '150px' }}
                />
                <ModalButton
                  onClick={() => setPontoSelecionado(null)}
                  variant="ghost"
                  label="Fechar"
                  style={{ flex: 1, minWidth: '90px' }}
                />
              </div>

            </div>
          </div>
        </div>
      </>
      )}
    </>
  );
}

export default PontosColeta;

