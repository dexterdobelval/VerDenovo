import { useAuth } from '../contexts/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Icon from '../components/Icon';

async function buscarCep(cep, setFormData) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8 || !/^\d{8}$/.test(cepLimpo)) return;
  try {
    const url = `https://viacep.com.br/ws/${cepLimpo}/json/`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return;
    const data = await res.json();
    if (data && !data.erro && typeof data.logradouro === 'string') {
      setFormData(prev => ({
        ...prev,
        endereco: `${data.logradouro}, ${data.bairro || ''}`.trim().replace(/,$/, ''),
      }));
    }
  } catch {
    return;
  }
}

const MATERIAIS = [
  { id: 'papel',      label: 'Papel',      nome: 'Papel',      icon: 'paper',      color: '#4f7da8' },
  { id: 'plastico',   label: 'Plástico',   nome: 'Plástico',   icon: 'plastic',    color: '#b86a64' },
  { id: 'vidro',      label: 'Vidro',      nome: 'Vidro',      icon: 'glass',      color: '#3f8f6b' },
  { id: 'metal',      label: 'Metal',      nome: 'Metal',      icon: 'metal',      color: '#b88a3d' },
  { id: 'eletronico', label: 'Eletrônico', nome: 'Eletrônico', icon: 'electronic', color: '#7c6aa8' },
  { id: 'organico',   label: 'Orgânico',   nome: 'Orgânico',   icon: 'organic',    color: '#6b9448' },
];

const mapear = (d) => ({
  nome: d.nome || '',
  endereco: d.logradouro || '',
  numero: d.numero || '',
  cep: d.cep || '',
  complemento: d.complemento || '',
  telefone: d.telefone || '',
  horario: d.horaFuncionamento || '',
  descricao: d.descricao || '',
  materiais: {
    papel:      d.material?.includes('Papel')      || false,
    plastico:   d.material?.includes('Plástico')   || false,
    vidro:      d.material?.includes('Vidro')      || false,
    metal:      d.material?.includes('Metal')      || false,
    eletronico: d.material?.includes('Eletrônico') || false,
    organico:   d.material?.includes('Orgânico')   || false,
  }
});

function PersonalizarPonto() {
  const { usuario, atualizarPontoVinculado } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '', endereco: '', numero: '', cep: '', complemento: '',
    telefone: '', horario: '', descricao: '',
    materiais: { papel: false, plastico: false, vidro: false, metal: false, eletronico: false, organico: false }
  });
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const [erros, setErros] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [pontoIdFallback, setPontoIdFallback] = useState(null);

  useEffect(() => {
    const dados = usuario?.tipo === 'ponto' ? usuario.dados : usuario?.pontoVinculado;
    const emailUsuario = usuario?.dados?.email;

    // Sempre buscar dados frescos do banco ao carregar
    const carregarDados = async () => {
      try {
        let ponto = null;

        // Tenta pelos pontos do usuário logado
        const meus = await apiService.listarMeusPontos().catch(() => []);
        ponto = meus.find(p => p.statusPonto === 'ATIVO') || meus[0];

        // Fallback: busca por email na lista pública
        if (!ponto && emailUsuario) {
          const todos = await apiService.listarPontos().catch(() => []);
          ponto = todos.find(p => p.email === emailUsuario);
        }

        // Fallback: usa dados do contexto
        if (!ponto && dados) ponto = dados;

        if (ponto) {
          setFormData(mapear(ponto));
          setPontoIdFallback(ponto.id);
        }
      } catch {
        return;
      }
    };

    if (usuario?.tipo === 'ponto' && dados) {
      setFormData(mapear(dados));
    } else {
      carregarDados();
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (erros[name]) setErros(prev => ({ ...prev, [name]: false }));
    if (name.startsWith('materiais.')) {
      const mat = name.split('.')[1];
      setFormData(prev => ({ ...prev, materiais: { ...prev.materiais, [mat]: checked } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const salvarInformacoes = async (e) => {
    e.preventDefault();
    const novosErros = {};
    if (!formData.nome) novosErros.nome = true;
    if (!formData.endereco) novosErros.endereco = true;
    if (!formData.cep) novosErros.cep = true;
    if (!formData.telefone) novosErros.telefone = true;
    if (!formData.horario) novosErros.horario = true;

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      const primeiro = Object.keys(novosErros)[0];
      setTimeout(() => {
        const el = document.getElementById(primeiro);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); }
      }, 100);
      return;
    }

    setErros({});
    setCarregando(true);
    try {
      const dadosAtual = usuario?.tipo === 'ponto' ? usuario.dados : usuario?.pontoVinculado;
      const pontoId = dadosAtual?.id || pontoIdFallback;
      const dadosParaSalvar = {
        nome: formData.nome,
        cep: formData.cep,
        numero: formData.numero,
        logradouro: formData.endereco,
        complemento: formData.complemento,
        telefone: formData.telefone,
        horaFuncionamento: formData.horario,
        descricao: formData.descricao,
        material: MATERIAIS.filter(m => formData.materiais[m.id]).map(m => m.nome).join(', '),
        email: dadosAtual?.email,
        statusPonto: 'ATIVO',
      };

      await apiService.atualizarPonto(pontoId, dadosParaSalvar);

      // Recarregar dados atualizados do banco
      try {
        const meus = await apiService.listarMeusPontos();
        const atualizado = meus.find(p => p.id === pontoId) ||
          (await apiService.listarPontos()).find(p => p.id === pontoId);
        if (atualizado) setFormData(mapear(atualizado));
      } catch {
        setErroSalvar('Não foi possível atualizar os dados exibidos agora. As alterações foram salvas.');
      }

      setErroSalvar('');
      setSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErroSalvar(err.message || 'Erro ao salvar informações.');
    } finally {
      setCarregando(false);
    }
  };

  const excluirPonto = () => {
    setConfirm({
      titulo: 'Excluir ponto de coleta',
      mensagem: 'Tem certeza que deseja excluir este ponto? Esta ação não pode ser desfeita.',
      onConfirmar: async () => {
        setConfirm(null);
        try {
          const dadosAtual = usuario?.tipo === 'ponto' ? usuario.dados : usuario?.pontoVinculado;
          await apiService.deletarPonto(dadosAtual?.id || pontoIdFallback);
          await atualizarPontoVinculado();
          navigate('/');
        } catch (err) {
          setConfirm(null);
          setErroSalvar(err.message || 'Erro ao excluir ponto.');
        }
      },
      onCancelar: () => setConfirm(null)
    });
  };

  const inputStyle = (campo) => erros[campo]
    ? { border: '2px solid #dc2626', borderRadius: '12px', background: '#fef2f2' }
    : { border: '2px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' };

  const erroMsg = (campo) => erros[campo] && (
    <div className="mt-1" style={{ fontSize: '13px', color: '#dc2626' }}>
      <i className="bi bi-exclamation-triangle-fill me-1"></i>Obrigatório
    </div>
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '2rem 0' }}>
      <style>{`.form-floating input,.form-floating textarea{border:2px solid #e5e7eb;border-radius:12px;background:#f9fafb;transition:all 0.3s}.form-floating input:focus,.form-floating textarea:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,0.1);background:white}`}</style>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <div className="text-center mb-5 animate-fadeInUp">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 10px 30px rgba(5,150,105,0.3)' }}>
                <i className="bi bi-geo-alt text-white" style={{ fontSize: '2rem' }}></i>
              </div>
              <h1 className="display-6 fw-bold text-success mb-2">Gerenciar Ponto de Coleta</h1>
              <p className="text-muted">Configure as informações do seu ponto de coleta</p>
            </div>

            {erroSalvar && (
              <div className="alert alert-danger border-0 rounded-3 mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>{erroSalvar}
              </div>
            )}

            {sucesso && (
              <div className="alert text-white text-center position-fixed" style={{
                top: '20px', right: '20px', zIndex: 9999,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                border: 'none', borderRadius: '15px', padding: '1rem 1.5rem',
                fontWeight: '600', boxShadow: '0 10px 30px rgba(5,150,105,0.4)', minWidth: '300px'
              }}>
                <i className="bi bi-check-circle-fill me-2"></i>Alterações salvas com sucesso!
              </div>
            )}

            <div className="card border-0 shadow-lg" style={{ borderRadius: '25px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
              <div className="card-header border-0 position-relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '25px 25px 0 0', padding: '2rem' }}>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
                    <i className="bi bi-geo-alt-fill text-white" style={{ fontSize: '1.8rem' }}></i>
                  </div>
                  <div>
                    <h4 className="text-white mb-1 fw-bold">Configurações do Ponto</h4>
                    <p className="text-white-50 mb-0">Atualize as informações do seu ponto de coleta</p>
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                <form onSubmit={salvarInformacoes}>

                  {/* Nome */}
                  <div className="form-floating mb-3">
                    <input type="text" name="nome" className="form-control" id="nome"
                      placeholder="Nome do Ponto" value={formData.nome} onChange={handleChange}
                      required style={inputStyle('nome')} />
                    <label htmlFor="nome"><i className="bi bi-geo-alt me-2"></i>Nome do Ponto de Coleta</label>
                    {erroMsg('nome')}
                  </div>

                  {/* Endereço + Número + CEP */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" name="endereco" className="form-control" id="endereco"
                          placeholder="Logradouro e bairro" value={formData.endereco} onChange={handleChange}
                          required style={inputStyle('endereco')}
                          onBlur={() => buscarCep(formData.cep, setFormData)} />
                        <label htmlFor="endereco"><i className="bi bi-signpost me-2"></i>Logradouro / Bairro</label>
                        {erroMsg('endereco')}
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-floating">
                        <input type="text" name="numero" className="form-control" id="numero"
                          placeholder="Nº" value={formData.numero} onChange={handleChange}
                          style={{ border: '2px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' }} />
                        <label htmlFor="numero"><i className="bi bi-hash me-2"></i>Nº</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <input type="text" name="cep" className="form-control" id="cep"
                          placeholder="00000-000" value={formData.cep} onChange={handleChange}
                          onBlur={e => buscarCep(e.target.value, setFormData)}
                          required style={inputStyle('cep')} />
                        <label htmlFor="cep"><i className="bi bi-mailbox me-2"></i>CEP</label>
                        {erroMsg('cep')}
                      </div>
                    </div>
                  </div>

                  {/* Complemento */}
                  <div className="form-floating mb-3">
                    <input type="text" name="complemento" className="form-control" id="complemento"
                      placeholder="Complemento" value={formData.complemento} onChange={handleChange}
                      maxLength={50}
                      style={{ border: '2px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' }} />
                    <label htmlFor="complemento"><i className="bi bi-house me-2"></i>Complemento (opcional)</label>
                  </div>

                  {/* Telefone + Horário */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="tel" name="telefone" className="form-control" id="telefone"
                          placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange}
                          required style={inputStyle('telefone')} />
                        <label htmlFor="telefone"><i className="bi bi-telephone me-2"></i>Telefone</label>
                        {erroMsg('telefone')}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" name="horario" className="form-control" id="horario"
                          placeholder="Ex: 08:00 - 18:00" value={formData.horario} onChange={handleChange}
                          required style={inputStyle('horario')} />
                        <label htmlFor="horario"><i className="bi bi-clock me-2"></i>Horário de Funcionamento</label>
                        {erroMsg('horario')}
                      </div>
                    </div>
                  </div>

                  {/* Materiais */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-success">
                      <i className="bi bi-recycle me-2"></i>Materiais Aceitos
                    </label>
                    <div className="row g-2">
                      {MATERIAIS.map(m => (
                        <div key={m.id} className="col-md-4 col-6">
                          <div className="form-check material-choice p-3 rounded-3" style={{
                            background: formData.materiais[m.id] ? 'rgba(5,150,105,0.1)' : 'rgba(248,250,252,0.8)',
                            border: `2px solid ${formData.materiais[m.id] ? '#059669' : '#e5e7eb'}`,
                            transition: 'all 0.2s'
                          }}>
                            <input className="form-check-input" type="checkbox"
                              name={`materiais.${m.id}`} id={m.id}
                              checked={formData.materiais[m.id]} onChange={handleChange} />
                            <label className="form-check-label fw-medium d-inline-flex align-items-center gap-2" htmlFor={m.id}>
                              <span className="material-choice-icon" style={{ color: m.color }}><Icon name={m.icon} size={15} /></span>
                              {m.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-success">
                      <i className="bi bi-card-text me-2"></i>Descrição (opcional)
                    </label>
                    <textarea className="form-control" name="descricao" id="descricao" rows={3}
                      placeholder="Descreva o ponto de coleta, como chegar, observações importantes..."
                      maxLength={500} value={formData.descricao} onChange={handleChange}
                      style={{ border: '2px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb', resize: 'none' }} />
                    <small className="text-muted">Ajuda os usuários a encontrar e entender o ponto</small>
                  </div>

                  {/* Botões */}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <button type="submit" className="btn text-white w-100"
                        disabled={carregando}
                        style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: '600' }}>
                        {carregando
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>SALVANDO...</>
                          : <><i className="bi bi-floppy me-2"></i>SALVAR ALTERAÇÕES</>}
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button type="button" className="btn btn-outline-danger w-100" onClick={excluirPonto}
                        style={{ borderRadius: '12px', padding: '12px', fontWeight: '600', border: '2px solid #dc2626' }}>
                        <i className="bi bi-trash me-2"></i>Excluir Ponto
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
}

export default PersonalizarPonto;
