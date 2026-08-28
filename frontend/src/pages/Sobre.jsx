import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

function Sobre() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const timeline = [
    { etapa: 'Ideia', texto: 'Perceber que o descarte correto ainda depende de informação dispersa.' },
    { etapa: 'Pesquisa', texto: 'Entender materiais, pontos de coleta e dificuldades da comunidade.' },
    { etapa: 'Desenvolvimento', texto: 'Construir uma plataforma simples para consulta, cadastro e educação.' },
    { etapa: 'Entrega', texto: 'Transformar o TCC em uma experiência útil, visual e sustentável.' },
  ];

  const destaques = [
    { icon: 'status', titulo: 'Localização clara', texto: 'Pontos organizados por busca, endereço e materiais aceitos.' },
    { icon: 'paper', titulo: 'Educação ambiental', texto: 'Conteúdo direto sobre materiais, resíduos e descarte seguro.' },
    { icon: 'recycle', titulo: 'Ação comunitária', texto: 'Cadastro de pontos para ampliar a rede sustentável.' },
    { icon: 'organic', titulo: 'Propósito local', texto: 'Foco em impacto real para a cidade e seus moradores.' },
  ];

  return (
    <div className="about-redesign">
      <section className="about-manifesto">
        <div className="about-manifesto-copy">
          <span className="section-kicker">Sobre o VerDenovo</span>
          <h1>Um TCC com vocação de produto sustentável.</h1>
          <p>O VerDenovo nasce para reduzir a distância entre vontade de reciclar e ação concreta. A proposta é simples: mostrar onde descartar, explicar como separar e incentivar a comunidade a participar.</p>
          <div className="about-manifesto-actions">
            <Link to="/pontos" className="btn btn-success">Conhecer pontos</Link>
            <Link to="/conscientizacao" className="btn btn-outline-success">Ver educação ambiental</Link>
          </div>
        </div>
        <div className="about-purpose-panel">
          <img src="/Verdenovologo.png" alt="VerDenovo" />
          <div>
            <strong>Propósito</strong>
            <p>Transformar descarte correto em rotina acessível, visual e comunitária.</p>
          </div>
        </div>
      </section>

      <section className="about-runway">
        <div className="home-section-heading">
          <span className="section-kicker">Linha do projeto</span>
          <h2>Da ideia ao protótipo funcional</h2>
          <p>Uma evolução pensada para unir pesquisa, tecnologia e impacto ambiental.</p>
        </div>
        <div className="about-runway-track">
          {timeline.map((item, index) => (
            <article key={item.etapa}>
              <span>{index + 1}</span>
              <h3>{item.etapa}</h3>
              <p>{item.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-impact-mosaic">
        <div className="about-impact-main">
          <span className="section-kicker">Impacto ambiental</span>
          <h2>Reciclagem precisa de acesso, clareza e repetição.</h2>
          <p>Quando o caminho é confuso, o material vai para o lixo comum. O VerDenovo organiza informações para que a escolha correta pareça natural.</p>
        </div>
        <div className="about-impact-side">
          <strong>6+</strong>
          <span>materiais orientados</span>
          <p>papel, plástico, vidro, metal, orgânico e eletrônico.</p>
        </div>
      </section>

      <section className="about-feature-rail">
        {destaques.map((item) => (
          <article key={item.titulo}>
            <div><Icon name={item.icon} size={20} /></div>
            <h3>{item.titulo}</h3>
            <p>{item.texto}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Sobre;
