import { useAuth } from '../contexts/useAuth';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Icon from '../components/Icon';
import { buscarEnderecoPorCep, normalizarCep } from '../utils/cep';
import { MATERIAIS_ACEITOS, materiaisParaEstado, materiaisSelecionadosParaTexto } from '../utils/materiais';

const formInicial = {
  nome: '',
  cnpj: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
  numero: '',
  cep: '',
  complemento: '',
  telefone: '',
  horario: '',
  descricao: '',
  materiais: materiaisParaEstado(''),
};

const formatarCnpj = (cnpj) => String(cnpj || '')
  .replace(/\D/g, '')
  .replace(/^(\d{2})(\d)/, '$1.$2')
  .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
  .replace(/\.(\d{3})(\d)/, '.$1/$2')
  .replace(/(\d{4})(\d)/, '$1-$2');

const mapear = (ponto) => ({
  nome: ponto.nome || '',
  cnpj: ponto.cnpj || '',
  endereco: ponto.logradouro || '',
  bairro: ponto.bairro || '',
  cidade: ponto.cidade || '',
  estado: ponto.estado || '',
  numero: ponto.numero || '',
  cep: ponto.cep || '',
  complemento: ponto.complemento || '',
  telefone: ponto.telefone || '',
  horario: ponto.horaFuncionamento || '',
  descricao: ponto.descricao || '',
  materiais: materiaisParaEstado(ponto.material),
});

function statusInfo(ponto) {
  if (ponto?.statusVerificacao === 'VERIFICADO') {
    return {
      label: 'Verificado',
      detail: 'Dados conferidos automaticamente',
      icon: 'bi-patch-check-fill',
      tone: 'verified',
    };
  }
  if (ponto?.statusVerificacao === 'NAO_VERIFICADO') {
    return {
      label: 'Nao verificado',
      detail: 'Precisa de revisao',
      icon: 'bi-x-circle-fill',
      tone: 'blocked',
    };
  }
  return {
    label: 'Pendente de revisao',
    detail: 'Aguardando validacao',
    icon: 'bi-hourglass-split',
    tone: 'pending',
  };
}

function Section({ eyebrow, title, icon, children, aside }) {
  return (
    <section className="my-point-section">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">{eyebrow}</span>
          <h2><i className={`bi ${icon}`} />{title}</h2>
        </div>
        {aside && <div className="section-aside">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, icon, error, className = '', children }) {
  return (
    <label className={`field-shell ${error ? 'has-error' : ''} ${className}`} htmlFor={id}>
      <span className="field-label"><i className={`bi ${icon}`} />{label}</span>
      {children}
      {error && <span className="field-error">Obrigatorio</span>}
    </label>
  );
}

function MaterialChip({ material, checked, onChange }) {
  return (
    <label
      className={`material-chip ${checked ? 'is-active' : ''}`}
      style={{ '--mat-color': material.color }}
      htmlFor={material.id}>
      <input
        type="checkbox"
        name={`materiais.${material.id}`}
        id={material.id}
        checked={checked}
        onChange={onChange}
      />
      <span className="material-icon"><Icon name={material.icon} size={17} /></span>
      <span>{material.label}</span>
      <i className="bi bi-check2 material-check" />
    </label>
  );
}

function PersonalizarPonto() {
  const { usuario, atualizarPontoVinculado } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(formInicial);
  const [pontoAtual, setPontoAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erroSalvar, setErroSalvar] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');
  const [erros, setErros] = useState({});
  const [confirm, setConfirm] = useState(null);
  const ultimoCepBuscado = useRef('');

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      setErroSalvar('');
      try {
        const ponto = usuario?.tipo === 'ponto'
          ? await apiService.buscarMeuPonto()
          : usuario?.pontoVinculado;
        if (!ponto) throw new Error('Ponto nao encontrado para esta conta.');
        setPontoAtual(ponto);
        ultimoCepBuscado.current = normalizarCep(ponto.cep);
        setFormData(mapear(ponto));
      } catch (err) {
        setErroSalvar(err.message || 'Nao foi possivel carregar seu ponto.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [usuario]);

  useEffect(() => {
    const cepLimpo = normalizarCep(formData.cep);
    if (cepLimpo.length !== 8 || cepLimpo === ultimoCepBuscado.current) {
      if (cepLimpo.length < 8) setErroCep('');
      return undefined;
    }

    let ativo = true;
    setBuscandoCep(true);
    setErroCep('');
    ultimoCepBuscado.current = cepLimpo;

    buscarEnderecoPorCep(cepLimpo).then(resultado => {
      if (!ativo) return;
      setBuscandoCep(false);

      if (resultado.status !== 'ok') {
        setErroCep(resultado.mensagem || 'CEP nao encontrado.');
        return;
      }

      setFormData(prev => {
        if (normalizarCep(prev.cep) !== cepLimpo) return prev;
        return {
          ...prev,
          cep: cepLimpo,
          endereco: resultado.endereco.logradouro,
          bairro: resultado.endereco.bairro,
          cidade: resultado.endereco.cidade,
          estado: resultado.endereco.estado,
        };
      });
    });

    return () => {
      ativo = false;
    };
  }, [formData.cep]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (erros[name]) setErros(prev => ({ ...prev, [name]: false }));
    if (name.startsWith('materiais.')) {
      const mat = name.split('.')[1];
      setFormData(prev => ({ ...prev, materiais: { ...prev.materiais, [mat]: checked } }));
      return;
    }
    if (name === 'cep') {
      setFormData(prev => ({ ...prev, cep: normalizarCep(value) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: name === 'estado' ? value.toUpperCase().slice(0, 2) : value }));
  };

  const salvarInformacoes = async (e) => {
    e.preventDefault();
    const novosErros = {};
    ['nome', 'endereco', 'cep', 'numero', 'cidade', 'estado', 'telefone', 'horario'].forEach(campo => {
      if (!formData[campo]) novosErros[campo] = true;
    });

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    setErroSalvar('');
    setSucesso('');
    try {
      const payload = {
        nome: formData.nome,
        cep: normalizarCep(formData.cep),
        numero: formData.numero,
        logradouro: formData.endereco,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        complemento: formData.complemento,
        telefone: formData.telefone,
        horaFuncionamento: formData.horario,
        descricao: formData.descricao,
        material: materiaisSelecionadosParaTexto(formData.materiais),
      };

      const atualizado = usuario?.tipo === 'ponto'
        ? await apiService.atualizarMeuPonto(payload)
        : await apiService.atualizarPonto(pontoAtual.id, payload);
      setPontoAtual(atualizado);
      setFormData(mapear(atualizado));
      setSucesso(atualizado.statusPonto === 'PENDENTE'
        ? 'Alteracoes salvas. Como o endereco mudou, o ponto voltou para revisao.'
        : 'Alteracoes salvas com sucesso.');
      if (usuario?.tipo !== 'ponto') await atualizarPontoVinculado();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErroSalvar(err.message || 'Erro ao salvar informacoes.');
    } finally {
      setSalvando(false);
    }
  };

  const excluirPonto = () => {
    setConfirm({
      titulo: 'Excluir ponto de coleta',
      mensagem: 'Tem certeza que deseja excluir este ponto? Esta acao nao pode ser desfeita.',
      onConfirmar: async () => {
        setConfirm(null);
        try {
          await apiService.deletarPonto(pontoAtual?.id);
          await atualizarPontoVinculado();
          navigate('/');
        } catch (err) {
          setErroSalvar(err.message || 'Erro ao excluir ponto.');
        }
      },
      onCancelar: () => setConfirm(null),
    });
  };

  const info = statusInfo(pontoAtual);
  const materiaisAtivos = MATERIAIS_ACEITOS.filter(m => formData.materiais[m.id]).length;

  if (carregando) {
    return (
      <div className="my-point-loading">
        <div className="spinner-border text-success mb-3"></div>
        <p>Carregando seu ponto...</p>
      </div>
    );
  }

  return (
    <div className="my-point-page">
      <style>{`
        .my-point-page {
          --panel: rgba(255,255,255,0.82);
          --panel-strong: rgba(255,255,255,0.94);
          --line: rgba(15, 23, 42, 0.09);
          --text: #102018;
          --muted: #647067;
          --green: #059669;
          --green-dark: #047857;
          --ease: cubic-bezier(.2,.8,.2,1);
          min-height: 100vh;
          padding: 1.5rem 0 3rem;
          color: var(--text);
          background:
            linear-gradient(180deg, rgba(240,253,244,0.85) 0%, rgba(255,255,255,1) 42%),
            radial-gradient(circle at 12% 8%, rgba(34,197,94,0.12), transparent 34%),
            #fff;
        }
        .my-point-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #647067;
        }
        .my-point-shell {
          width: min(1180px, calc(100vw - 2rem));
          margin: 0 auto;
        }
        .my-point-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1.25rem;
          align-items: center;
          margin-bottom: 1.2rem;
          padding: 1.1rem;
          border: 1px solid rgba(255,255,255,0.82);
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255,255,255,0.84), rgba(236,253,245,0.76));
          box-shadow: 0 18px 50px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
          backdrop-filter: blur(18px);
        }
        .hero-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 0;
        }
        .hero-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: #047857;
          background: linear-gradient(145deg, rgba(209,250,229,0.95), rgba(255,255,255,0.9));
          border: 1px solid rgba(16,185,129,0.18);
          box-shadow: 0 10px 24px rgba(5,150,105,0.12);
          flex: 0 0 auto;
        }
        .hero-copy { min-width: 0; }
        .hero-copy span {
          display: inline-flex;
          margin-bottom: 0.25rem;
          color: #047857;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .hero-copy h1 {
          margin: 0;
          font-size: clamp(1.55rem, 3vw, 2.15rem);
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: 0;
          color: #0f2419;
          overflow-wrap: anywhere;
        }
        .hero-copy p {
          margin: 0.35rem 0 0;
          color: var(--muted);
          font-size: 0.93rem;
        }
        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 230px;
          padding: 0.78rem 0.9rem;
          border-radius: 17px;
          border: 1px solid var(--status-border);
          background: var(--status-bg);
          color: var(--status-color);
          box-shadow: 0 10px 28px rgba(15,23,42,0.07);
        }
        .status-pill.verified { --status-bg: rgba(236,253,245,0.9); --status-color: #047857; --status-border: rgba(16,185,129,0.24); }
        .status-pill.pending { --status-bg: rgba(255,251,235,0.95); --status-color: #a16207; --status-border: rgba(245,158,11,0.26); }
        .status-pill.blocked { --status-bg: rgba(254,242,242,0.95); --status-color: #b91c1c; --status-border: rgba(248,113,113,0.24); }
        .status-dot {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.72);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8);
        }
        .status-pill strong {
          display: block;
          font-size: 0.9rem;
          line-height: 1.1;
        }
        .status-pill small {
          display: block;
          margin-top: 0.15rem;
          color: currentColor;
          opacity: 0.72;
          font-size: 0.73rem;
        }
        .feedback {
          border: 1px solid;
          border-radius: 16px;
          padding: 0.9rem 1rem;
          margin-bottom: 1rem;
          font-weight: 650;
        }
        .feedback.success { color: #047857; background: rgba(236,253,245,0.88); border-color: rgba(16,185,129,0.22); }
        .feedback.error { color: #b91c1c; background: rgba(254,242,242,0.9); border-color: rgba(248,113,113,0.22); }
        .my-point-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 1.1rem;
          align-items: start;
        }
        .my-point-form {
          display: grid;
          gap: 1rem;
        }
        .my-point-section,
        .side-panel {
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--panel-strong);
          box-shadow: 0 14px 36px rgba(15,23,42,0.055);
        }
        .my-point-section {
          padding: 1.1rem;
          transition: transform 180ms var(--ease), box-shadow 180ms var(--ease), border-color 180ms var(--ease);
        }
        .my-point-section:hover {
          transform: translateY(-1px);
          border-color: rgba(5,150,105,0.18);
          box-shadow: 0 18px 42px rgba(15,23,42,0.075);
        }
        .section-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .section-eyebrow {
          display: block;
          margin-bottom: 0.22rem;
          color: #6b7a70;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .section-head h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 1rem;
          font-weight: 800;
          color: #102018;
        }
        .section-head h2 i { color: #059669; font-size: 0.96rem; }
        .section-aside {
          color: #7a857e;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .field-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 0.85rem;
        }
        .span-2 { grid-column: span 2; }
        .span-3 { grid-column: span 3; }
        .span-4 { grid-column: span 4; }
        .span-5 { grid-column: span 5; }
        .span-6 { grid-column: span 6; }
        .span-7 { grid-column: span 7; }
        .span-8 { grid-column: span 8; }
        .span-12 { grid-column: span 12; }
        .field-shell {
          display: flex;
          flex-direction: column;
          gap: 0.38rem;
          min-width: 0;
        }
        .field-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #526159;
          font-size: 0.78rem;
          font-weight: 750;
        }
        .field-label i {
          color: #059669;
          font-size: 0.8rem;
        }
        .field-shell input,
        .field-shell textarea {
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
          transition: border-color 180ms var(--ease), box-shadow 180ms var(--ease), background 180ms var(--ease), transform 180ms var(--ease);
        }
        .field-shell textarea {
          min-height: 108px;
          resize: vertical;
          line-height: 1.55;
        }
        .field-shell input:hover,
        .field-shell textarea:hover {
          border-color: rgba(5,150,105,0.25);
          background: rgba(255,255,255,0.96);
        }
        .field-shell input:focus,
        .field-shell textarea:focus {
          border-color: rgba(5,150,105,0.52);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(5,150,105,0.095);
        }
        .field-shell input[readonly] {
          color: #6b7280;
          background: linear-gradient(180deg, rgba(243,244,246,0.88), rgba(249,250,251,0.9));
          cursor: not-allowed;
        }
        .field-shell.has-error input,
        .field-shell.has-error textarea {
          border-color: rgba(220,38,38,0.44);
          background: #fff7f7;
        }
        .field-error {
          color: #b91c1c;
          font-size: 0.74rem;
          font-weight: 750;
        }
        .field-hint {
          color: #047857;
          font-size: 0.74rem;
          font-weight: 750;
        }
        .field-hint.error {
          color: #b91c1c;
        }
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }
        .material-chip {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.68rem;
          min-height: 58px;
          padding: 0.78rem 0.86rem;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.09);
          background: rgba(248,250,252,0.75);
          color: #27342d;
          font-weight: 750;
          cursor: pointer;
          overflow: hidden;
          transition: transform 180ms var(--ease), box-shadow 180ms var(--ease), border-color 180ms var(--ease), background 180ms var(--ease);
        }
        .material-chip input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .material-icon {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: var(--mat-color);
          background: color-mix(in srgb, var(--mat-color) 12%, white);
          border: 1px solid color-mix(in srgb, var(--mat-color) 20%, white);
          flex: 0 0 auto;
        }
        .material-check {
          margin-left: auto;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: white;
          background: var(--mat-color);
          opacity: 0;
          transform: scale(0.72);
          transition: opacity 180ms var(--ease), transform 180ms var(--ease);
        }
        .material-chip:hover {
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--mat-color) 28%, white);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--mat-color) 16%, transparent);
        }
        .material-chip.is-active {
          background: color-mix(in srgb, var(--mat-color) 13%, white);
          border-color: color-mix(in srgb, var(--mat-color) 34%, white);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--mat-color) 15%, transparent);
        }
        .material-chip.is-active .material-check {
          opacity: 1;
          transform: scale(1);
        }
        .side-rail {
          position: sticky;
          top: 76px;
          display: grid;
          gap: 1rem;
        }
        .side-panel {
          padding: 1rem;
        }
        .side-panel h3 {
          margin: 0 0 0.8rem;
          font-size: 0.92rem;
          font-weight: 820;
          color: #102018;
        }
        .side-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.72rem 0;
          border-top: 1px solid rgba(15,23,42,0.07);
          color: #526159;
          font-size: 0.86rem;
        }
        .side-item strong {
          color: #17231c;
          font-size: 0.86rem;
          text-align: right;
        }
        .reason-box {
          margin-top: 0.75rem;
          padding: 0.82rem;
          border-radius: 14px;
          color: #7c4a03;
          background: rgba(255,251,235,0.82);
          border: 1px solid rgba(245,158,11,0.18);
          font-size: 0.84rem;
          line-height: 1.5;
        }
        .actions-panel {
          display: grid;
          gap: 0.65rem;
        }
        .primary-action,
        .danger-action {
          width: 100%;
          min-height: 44px;
          padding: 0.72rem 0.95rem;
          border-radius: 13px;
          border: 1px solid transparent;
          font-size: 0.9rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          transition: transform 180ms var(--ease), box-shadow 180ms var(--ease), background 180ms var(--ease), border-color 180ms var(--ease), color 180ms var(--ease);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.78), 0 10px 22px rgba(15,23,42,0.06);
        }
        .primary-action i,
        .danger-action i {
          font-size: 0.96rem;
        }
        .primary-action {
          color: white;
          background: linear-gradient(135deg, #047857, #10b981);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 14px 28px rgba(5,150,105,0.18);
        }
        .primary-action:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 34px rgba(5,150,105,0.25);
        }
        .primary-action:disabled {
          opacity: 0.68;
          cursor: wait;
        }
        .danger-action {
          color: #b42318;
          background: rgba(255,255,255,0.9);
          border-color: rgba(180,35,24,0.18);
        }
        .danger-action:hover {
          transform: translateY(-1px);
          color: #941f16;
          background: rgba(255,247,247,0.94);
          border-color: rgba(180,35,24,0.3);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.92), 0 13px 26px rgba(180,35,24,0.08);
        }
        .primary-action:focus-visible,
        .danger-action:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(16,185,129,0.16), 0 14px 28px rgba(15,23,42,0.09);
        }
        @media (max-width: 991px) {
          .my-point-layout { grid-template-columns: 1fr; }
          .side-rail { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 767px) {
          .my-point-page { padding-top: 1rem; }
          .my-point-shell { width: min(100% - 1rem, 1180px); }
          .my-point-hero { grid-template-columns: 1fr; padding: 0.95rem; border-radius: 18px; }
          .hero-main { align-items: flex-start; }
          .hero-icon { width: 48px; height: 48px; border-radius: 14px; }
          .status-pill { min-width: 0; width: 100%; }
          .field-grid { grid-template-columns: 1fr; }
          .span-2, .span-3, .span-4, .span-5, .span-6, .span-7, .span-8, .span-12 { grid-column: auto; }
          .materials-grid { grid-template-columns: 1fr; }
          .side-rail { grid-template-columns: 1fr; }
          .section-head { flex-direction: column; gap: 0.35rem; }
          .section-aside { white-space: normal; }
        }
      `}</style>

      <div className="my-point-shell">
        <header className="my-point-hero">
          <div className="hero-main">
            <div className="hero-icon">
              <i className="bi bi-shop" />
            </div>
            <div className="hero-copy">
              <span>Painel do ponto</span>
              <h1>{formData.nome || 'Meu ponto'}</h1>
              <p>Gerencie dados publicos, materiais aceitos e localizacao.</p>
            </div>
          </div>

          <div className={`status-pill ${info.tone}`}>
            <span className="status-dot"><i className={`bi ${info.icon}`} /></span>
            <div>
              <strong>{info.label}</strong>
              <small>{info.detail}</small>
            </div>
          </div>
        </header>

        {erroSalvar && (
          <div className="feedback error">
            <i className="bi bi-exclamation-triangle me-2" />{erroSalvar}
          </div>
        )}

        {sucesso && (
          <div className="feedback success">
            <i className="bi bi-check-circle-fill me-2" />{sucesso}
          </div>
        )}

        <div className="my-point-layout">
          <form className="my-point-form" onSubmit={salvarInformacoes}>
            <Section eyebrow="Perfil" title="Informacoes basicas" icon="bi-card-heading">
              <div className="field-grid">
                <Field id="nome" label="Nome do ponto" icon="bi-geo-alt" error={erros.nome} className="span-8">
                  <input id="nome" type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome exibido ao publico" />
                </Field>
                <Field id="cnpj" label="CNPJ" icon="bi-building-lock" className="span-4">
                  <input id="cnpj" type="text" value={formatarCnpj(formData.cnpj)} readOnly />
                </Field>
              </div>
            </Section>

            <Section eyebrow="Endereco" title="Localizacao" icon="bi-map" aside="Alteracoes podem revalidar o CNPJ">
              <div className="field-grid">
                <Field id="cep" label="CEP" icon="bi-mailbox" error={erros.cep} className="span-3">
                  <input id="cep" type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000000" inputMode="numeric" maxLength={9} />
                  {buscandoCep && <span className="field-hint">Buscando endereco...</span>}
                  {erroCep && <span className="field-hint error">{erroCep}</span>}
                </Field>
                <Field id="endereco" label="Logradouro" icon="bi-signpost" error={erros.endereco} className="span-7">
                  <input id="endereco" type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, avenida ou estrada" />
                </Field>
                <Field id="numero" label="Numero" icon="bi-hash" error={erros.numero} className="span-2">
                  <input id="numero" type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="123" />
                </Field>
                <Field id="bairro" label="Bairro" icon="bi-map" className="span-4">
                  <input id="bairro" type="text" name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Bairro" />
                </Field>
                <Field id="cidade" label="Cidade" icon="bi-buildings" error={erros.cidade} className="span-5">
                  <input id="cidade" type="text" name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" />
                </Field>
                <Field id="estado" label="UF" icon="bi-flag" error={erros.estado} className="span-3">
                  <input id="estado" type="text" name="estado" value={formData.estado} onChange={handleChange} maxLength={2} placeholder="SP" />
                </Field>
                <Field id="complemento" label="Complemento" icon="bi-house" className="span-12">
                  <input id="complemento" type="text" name="complemento" value={formData.complemento} onChange={handleChange} maxLength={50} placeholder="Sala, bloco, referencia ou observacao curta" />
                </Field>
              </div>
            </Section>

            <Section eyebrow="Atendimento" title="Contato" icon="bi-telephone">
              <div className="field-grid">
                <Field id="telefone" label="Telefone" icon="bi-telephone" error={erros.telefone} className="span-5">
                  <input id="telefone" type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
                </Field>
                <Field id="horario" label="Horario de funcionamento" icon="bi-clock" error={erros.horario} className="span-7">
                  <input id="horario" type="text" name="horario" value={formData.horario} onChange={handleChange} placeholder="Seg a sex, 8h as 18h" />
                </Field>
              </div>
            </Section>

            <Section eyebrow="Coleta" title="Materiais aceitos" icon="bi-recycle" aside={`${materiaisAtivos} selecionados`}>
              <div className="materials-grid">
                {MATERIAIS_ACEITOS.map(material => (
                  <MaterialChip
                    key={material.id}
                    material={material}
                    checked={formData.materiais[material.id]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </Section>

            <Section eyebrow="Publicacao" title="Descricao" icon="bi-card-text">
              <div className="field-grid">
                <Field id="descricao" label="Sobre o ponto" icon="bi-info-circle" className="span-12">
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={4}
                    maxLength={500}
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Explique como chegar, quais cuidados seguir ou observacoes importantes para visitantes."
                  />
                </Field>
              </div>
            </Section>
          </form>

          <aside className="side-rail">
            <div className="side-panel">
              <h3>Status do ponto</h3>
              <div className="side-item">
                <span>Verificacao</span>
                <strong>{info.label}</strong>
              </div>
              <div className="side-item">
                <span>Status publico</span>
                <strong>{pontoAtual?.statusPonto || 'PENDENTE'}</strong>
              </div>
              <div className="side-item">
                <span>Fonte</span>
                <strong>{pontoAtual?.fonteVerificacao || 'Sistema'}</strong>
              </div>
              {pontoAtual?.motivoVerificacao && (
                <div className="reason-box">{pontoAtual.motivoVerificacao}</div>
              )}
            </div>

            <div className="side-panel actions-panel">
              <h3>Ações</h3>
              <button type="button" className="primary-action" onClick={salvarInformacoes} disabled={salvando}>
                {salvando
                  ? <><span className="spinner-border spinner-border-sm" />Salvando...</>
                  : <><i className="bi bi-floppy" />Salvar alterações</>}
              </button>
              <button type="button" className="danger-action" onClick={excluirPonto}>
                <i className="bi bi-trash" />Excluir ponto
              </button>
            </div>
          </aside>
        </div>
      </div>
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
}

export default PersonalizarPonto;
