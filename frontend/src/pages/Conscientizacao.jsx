import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CORES = [
  { cor: '#4f7da8', nome: 'Azul', material: 'Papel e Papelão', exemplos: ['Jornais', 'Revistas', 'Papelão', 'Caixas'], icone: 'bi-file-text' },
  { cor: '#b86a64', nome: 'Vermelho', material: 'Plástico', exemplos: ['Garrafas PET', 'Embalagens', 'Sacolas', 'Potes'], icone: 'bi-cup-straw' },
  { cor: '#3f8f6b', nome: 'Verde', material: 'Vidro', exemplos: ['Garrafas', 'Potes', 'Frascos', 'Copos'], icone: 'bi-cup' },
  { cor: '#b88a3d', nome: 'Amarelo', material: 'Metal', exemplos: ['Latas de alumínio', 'Latas de aço', 'Tampas', 'Arames'], icone: 'bi-gear' },
  { cor: '#6f7d86', nome: 'Cinza', material: 'Rejeito', exemplos: ['Papel higiênico', 'Fraldas', 'Cigarro', 'Cerâmica'], icone: 'bi-trash' },
  { cor: '#b9784a', nome: 'Laranja', material: 'Resíduos Perigosos', exemplos: ['Pilhas', 'Baterias', 'Eletrônicos', 'Lâmpadas'], icone: 'bi-exclamation-triangle' },
];

const BANCO_QUIZ = [
  { pergunta: 'Onde jogar uma garrafa PET?', opcoes: ['Azul', 'Vermelho', 'Verde', 'Amarelo'], correta: 1 },
  { pergunta: 'Onde descartar uma lata de refrigerante?', opcoes: ['Vermelho', 'Verde', 'Amarelo', 'Cinza'], correta: 2 },
  { pergunta: 'Onde vai uma garrafa de vidro?', opcoes: ['Azul', 'Verde', 'Vermelho', 'Amarelo'], correta: 1 },
  { pergunta: 'Onde jogar papel de jornal?', opcoes: ['Cinza', 'Vermelho', 'Azul', 'Verde'], correta: 2 },
  { pergunta: 'Onde vai uma lata de alumínio amassada?', opcoes: ['Cinza', 'Amarelo', 'Laranja', 'Azul'], correta: 1 },
  { pergunta: 'Onde vai uma caixa de papelão?', opcoes: ['Azul', 'Vermelho', 'Cinza', 'Verde'], correta: 0 },
  { pergunta: 'Onde descartar restos de comida?', opcoes: ['Verde', 'Cinza', 'Azul', 'Laranja'], correta: 1 },
  { pergunta: 'Onde descartar um pote de geleia vazio?', opcoes: ['Cinza', 'Amarelo', 'Azul', 'Verde'], correta: 3 },
  { pergunta: 'Onde vai uma revista velha?', opcoes: ['Amarelo', 'Laranja', 'Cinza', 'Azul'], correta: 3 },
  { pergunta: 'Onde descartar um pote de iogurte plástico?', opcoes: ['Azul', 'Vermelho', 'Verde', 'Cinza'], correta: 1 },
  { pergunta: 'Onde vai um copo de vidro quebrado limpo?', opcoes: ['Verde', 'Cinza', 'Azul', 'Laranja'], correta: 0 },
  { pergunta: 'Onde descartar uma embalagem de shampoo?', opcoes: ['Cinza', 'Amarelo', 'Vermelho', 'Azul'], correta: 2 },
];

const RODADA_SIZE = 6;

function sortearPerguntas() {
  return [...BANCO_QUIZ].sort(() => Math.random() - 0.5).slice(0, RODADA_SIZE);
}

function getMensagem(acertos) {
  if (acertos <= 2) return 'Vale revisar sobre reciclagem';
  if (acertos <= 4) return 'Bom trabalho!';
  return 'Mandou muito bem!';
}

function QuizCard() {
  const [perguntas, setPerguntas] = useState(() => sortearPerguntas());
  const [idx, setIdx] = useState(0);
  const [selecionado, setSelecionado] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);

  const responder = (i) => {
    if (selecionado !== null) return;
    setSelecionado(i);
    if (i === perguntas[idx].correta) setAcertos(a => a + 1);
  };

  const avancar = () => {
    if (idx + 1 >= perguntas.length) setFim(true);
    else { setIdx(i => i + 1); setSelecionado(null); }
  };

  const reiniciar = () => {
    setPerguntas(sortearPerguntas());
    setIdx(0);
    setSelecionado(null);
    setAcertos(0);
    setFim(false);
  };

  if (fim) return (
    <div className="quiz-finish">
      <div><i className="bi bi-trophy" /></div>
      <h4>Você acertou {acertos} de {RODADA_SIZE}!</h4>
      <p>{getMensagem(acertos)}</p>
      <button className="btn btn-success" type="button" onClick={reiniciar}>Tentar novamente</button>
    </div>
  );

  const q = perguntas[idx];
  return (
    <div className="quiz-card-inner">
      <div className="quiz-meta">
        <span>Pergunta {idx + 1} de {RODADA_SIZE}</span>
        <strong>{acertos} acerto{acertos !== 1 ? 's' : ''}</strong>
      </div>
      <div className="quiz-progress"><span style={{ width: `${(idx / RODADA_SIZE) * 100}%` }} /></div>
      <h5>{q.pergunta}</h5>
      <div className="quiz-options">
        {q.opcoes.map((op, i) => {
          const corLixeira = CORES.find(c => c.nome === op);
          const status = selecionado === null ? '' : i === q.correta ? 'is-correct' : i === selecionado ? 'is-wrong' : '';
          return (
            <button key={op} type="button" onClick={() => responder(i)} className={`quiz-option ${status}`} disabled={selecionado !== null}>
              {corLixeira && <span style={{ background: corLixeira.cor }} />}
              {op}
            </button>
          );
        })}
      </div>
      {selecionado !== null && (
        <button onClick={avancar} className="btn btn-success w-100 mt-3 fw-bold" type="button">
          {idx + 1 >= perguntas.length ? 'Ver resultado' : 'Próxima pergunta'}
        </button>
      )}
    </div>
  );
}

function Conscientizacao() {
  const navigate = useNavigate();

  const fluxo = [
    { icon: 'bi-layers', title: 'Separar', text: 'Organize por tipo de material ainda em casa.' },
    { icon: 'bi-droplet', title: 'Limpar', text: 'Retire excesso de alimento e líquidos.' },
    { icon: 'bi-geo-alt', title: 'Levar', text: 'Procure coleta seletiva ou ponto cadastrado.' },
    { icon: 'bi-recycle', title: 'Reciclar', text: 'O material volta para a cadeia produtiva.' },
  ];

  const impactos = [
    { icon: 'bi-trash', numero: '79M', unidade: 'ton/ano', desc: 'de resíduos produzidos no Brasil' },
    { icon: 'bi-recycle', numero: '4%', unidade: 'reciclado', desc: 'do lixo brasileiro ainda volta à cadeia' },
    { icon: 'bi-water', numero: '8M', unidade: 'ton/ano', desc: 'de plástico chegam aos oceanos' },
  ];

  const principios = [
    { icon: 'bi-graph-down-arrow', titulo: 'Reduzir', texto: 'Evite consumo desnecessário e prefira produtos duráveis.' },
    { icon: 'bi-arrow-clockwise', titulo: 'Reutilizar', texto: 'Dê nova função a embalagens, potes, caixas e objetos.' },
    { icon: 'bi-recycle', titulo: 'Reciclar', texto: 'Quando não houver reuso, separe e leve ao destino correto.' },
  ];

  return (
    <div className="awareness-page">
      <section className="awareness-hero animate-fadeInUp">
        <div>
          <span className="section-kicker"><i className="bi bi-leaf me-2" />Educação ambiental</span>
          <h1>Consciência que vira hábito</h1>
          <p>Aprenda o ciclo básico da reciclagem, entenda impactos reais e teste seus conhecimentos de forma simples.</p>
        </div>
        <div className="awareness-impact-stack">
          {impactos.map((item) => (
            <article key={item.numero}>
              <i className={`bi ${item.icon}`} />
              <strong>{item.numero}</strong>
              <span>{item.unidade}</span>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="awareness-storyline">
        <article>
          <div>
            <span className="section-kicker">Por que importa</span>
            <h2>O resíduo certo no lugar errado vira problema ambiental.</h2>
            <p>Separar melhor reduz contaminação, facilita a coleta e aumenta o valor do material reciclável.</p>
          </div>
          <div className="storyline-visual storyline-visual-a" aria-hidden="true">
            <div className="storyline-icon-panel">
              <i className="bi bi-recycle" />
              <span>Reciclagem consciente</span>
            </div>
            <div className="storyline-eco-tags">
              <span>Menos descarte incorreto</span>
              <span>Mais reaproveitamento</span>
            </div>
          </div>
        </article>
        <article>
          <div className="storyline-visual storyline-visual-b" aria-hidden="true">
            <div className="storyline-flow-mini">
              {['Separar', 'Limpar', 'Levar', 'Reciclar'].map((etapa, index) => (
                <div key={etapa} className="storyline-flow-step">
                  <span>{index + 1}</span>
                  <strong>{etapa}</strong>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="section-kicker">Como agir</span>
            <h2>Pequenas etapas criam uma rotina sustentável.</h2>
            <p>O VerDenovo traduz o processo em passos claros: separar, limpar, levar e reciclar.</p>
          </div>
        </article>
      </section>

      <section className="recycle-flow">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Fluxo visual</span>
            <h2>Como reciclar corretamente</h2>
          </div>
          <p>Um processo simples que melhora a qualidade dos materiais e aumenta a chance de reciclagem.</p>
        </div>
        <div className="recycle-flow-grid">
          {fluxo.map((item, index) => (
            <article key={item.title} className={`animate-scaleIn animate-delay-${index + 1}`}>
              <span>{index + 1}</span>
              <i className={`bi ${item.icon}`} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="awareness-principles">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">3 Rs</span>
            <h2>A hierarquia da sustentabilidade</h2>
          </div>
          <p>Antes de reciclar, pense em reduzir e reutilizar. Isso diminui o impacto desde a origem.</p>
        </div>
        <div className="principles-grid">
          {principios.map((item, index) => (
            <article key={item.titulo} className={`principle-card animate-scaleIn animate-delay-${index + 1}`}>
              <i className={`bi ${item.icon}`} />
              <h3>{index + 1}. {item.titulo}</h3>
              <p>{item.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bin-guide-section">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Guia de cores</span>
            <h2>Entenda as lixeiras</h2>
          </div>
          <p>Cores mais suaves, mesma lógica: identificar o destino correto de cada material.</p>
        </div>
        <div className="bin-guide-grid">
          {CORES.map((c, index) => (
            <article key={c.nome} className={`bin-guide-card animate-scaleIn animate-delay-${(index % 4) + 1}`} style={{ '--bin-color': c.cor }}>
              <i className={`bi ${c.icone}`} />
              <div>
                <span>Lixeira {c.nome}</span>
                <h3>{c.material}</h3>
              </div>
              <div className="bin-chip-row">
                {c.exemplos.map((e) => <em key={e}>{e}</em>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-lab">
        <div className="quiz-panel">
          <div className="learning-panel-header">
            <i className="bi bi-lightbulb" />
            <div>
              <h2>Quiz de reciclagem</h2>
              <p>Teste seus conhecimentos em uma rodada rápida.</p>
            </div>
          </div>
          <QuizCard />
        </div>
        <div className="video-panel">
          <span className="section-kicker">Conteúdo extra</span>
          <h2>Aprenda sobre reciclagem</h2>
          <p>Veja um conteúdo educativo e conecte os conceitos do VerDenovo com ações do cotidiano.</p>
          <blockquote>"Cada gesto pequeno fica maior quando vira hábito coletivo."</blockquote>
          <button onClick={() => window.open('https://www.tiktok.com/@haileydollie/video/7463768126761504005', '_blank')} className="btn btn-success fw-bold" type="button">
            <i className="bi bi-play-fill me-2" />Assistir agora
          </button>
        </div>
      </section>

      <section className="awareness-cta">
        <h2>Pronto para fazer a diferença?</h2>
        <p>Encontre um ponto de coleta próximo ou cadastre um novo local para fortalecer a rede.</p>
        <div>
          <button onClick={() => navigate('/pontos')} className="btn btn-success" type="button"><i className="bi bi-geo-alt me-2" />Ver pontos</button>
          <button onClick={() => navigate('/cadastrar')} className="btn btn-outline-success" type="button"><i className="bi bi-plus-circle me-2" />Cadastrar ponto</button>
        </div>
      </section>
    </div>
  );
}

export default Conscientizacao;
