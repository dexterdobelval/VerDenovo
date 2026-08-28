import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import Icon from '../components/Icon';

function Home() {
  const { mostrarMensagemLogout, usuario, isLogado } = useAuth();

  const botaoSecundario = () => {
    if (!isLogado()) return (
      <Link to="/cadastro-usuario" className="btn btn-outline-success btn-lg px-5">
        <i className="bi bi-person-plus me-2"></i>Criar Conta
      </Link>
    );
    if (usuario?.pontoVinculado) return (
      <Link to="/personalizar-ponto" className="btn btn-outline-success btn-lg px-5">
        <i className="bi bi-gear me-2"></i>Gerenciar Meu Ponto
      </Link>
    );
    if (usuario?.tipo === 'usuario') return (
      <Link to="/cadastrar" className="btn btn-outline-success btn-lg px-5">
        <i className="bi bi-plus-circle me-2"></i>Cadastrar Ponto
      </Link>
    );
    return null;
  };

  const fluxo = [
    { icon: 'layers', titulo: 'Separar', texto: 'Organize materiais recicláveis ainda em casa.' },
    { icon: 'status', titulo: 'Encontrar ponto', texto: 'Use a busca para localizar o destino correto.' },
    { icon: 'recycle', titulo: 'Reciclar', texto: 'Leve o material limpo ao ponto indicado.' },
    { icon: 'organic', titulo: 'Impacto positivo', texto: 'Ajude a reduzir descarte incorreto na cidade.' },
  ];

  const impacto = [
    { valor: '400', unidade: 'anos', label: 'para plástico se decompor', barra: '82%' },
    { valor: '95%', unidade: 'energia', label: 'economizada ao reciclar alumínio', barra: '95%' },
    { valor: '17', unidade: 'árvores', label: 'poupadas por tonelada de papel', barra: '68%' },
  ];

  return (
    <div className="page-content home-redesign">
      {mostrarMensagemLogout && (
        <div className="home-toast">
          <i className="bi bi-check-circle-fill"></i>
          <span>Logout realizado com sucesso!</span>
        </div>
      )}

      <section className="home-cinematic">
        <div className="home-cinematic-copy">
          <span className="section-kicker"><i className="bi bi-leaf me-2" />Sustentabilidade em ação</span>
          <h1>VerDenovo transforma descarte em hábito inteligente.</h1>
          <p>Uma plataforma para encontrar pontos de coleta, entender materiais recicláveis e conectar a cidade a escolhas mais sustentáveis.</p>
          <div className="home-cta-row">
            <Link to="/pontos" className="btn btn-success btn-lg px-5">
              <i className="bi bi-geo-alt me-2"></i>Encontrar pontos
            </Link>
            {botaoSecundario()}
          </div>
        </div>

        <div className="home-product-stage">
          <div className="home-stage-photo">
            <img src="/image.png" alt="Sustentabilidade" />
          </div>
          <div className="home-floating-panel home-floating-panel-top">
            <strong>6 tipos</strong>
            <span>materiais mapeados</span>
          </div>
          <div className="home-floating-panel home-floating-panel-bottom">
            <Icon name="recycle" size={18} />
            <span>reciclagem guiada</span>
          </div>
        </div>
      </section>

      <section className="home-flow-section">
        <div className="home-section-heading">
          <span className="section-kicker">Fluxo VerDenovo</span>
          <h2>Do material separado ao impacto positivo</h2>
          <p>Uma jornada clara para transformar intenção em ação concreta.</p>
        </div>
        <div className="home-flow-line">
          {fluxo.map((item, index) => (
            <article key={item.titulo} className="home-flow-step">
              <span>{index + 1}</span>
              <div><Icon name={item.icon} size={20} /></div>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-impact-showcase">
        <div>
          <span className="section-kicker">Impacto ambiental</span>
          <h2>Dados que explicam por que separar importa</h2>
          <p>Reciclar reduz tempo de decomposição, consumo de energia e pressão sobre recursos naturais. A interface ajuda a transformar esses dados em decisão prática.</p>
        </div>
        <div className="home-impact-metrics">
          {impacto.map((item) => (
            <article key={item.label}>
              <div>
                <strong>{item.valor}</strong>
                <span>{item.unidade}</span>
              </div>
              <p>{item.label}</p>
              <em><i style={{ width: item.barra }} /></em>
            </article>
          ))}
        </div>
      </section>

      <section className="home-app-preview">
        <div className="home-map-visual" aria-hidden="true">
          <span className="map-pin map-pin-a" />
          <span className="map-pin map-pin-b" />
          <span className="map-pin map-pin-c" />
          <div className="map-route" />
        </div>
        <div className="home-preview-content">
          <span className="section-kicker">Preview da plataforma</span>
          <h2>Pontos de coleta com cara de ferramenta real</h2>
          <p>Busca, filtros por material, detalhes do ponto e chamada para cadastro em uma experiência mais objetiva.</p>
          <div className="home-preview-list">
            <span><Icon name="paper" size={14} /> Papel</span>
            <span><Icon name="plastic" size={14} /> Plástico</span>
            <span><Icon name="glass" size={14} /> Vidro</span>
          </div>
          <Link to="/pontos" className="btn btn-success">
            Abrir pontos de coleta
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
