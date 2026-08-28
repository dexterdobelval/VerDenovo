function Residuos() {
  const residuosComuns = [
    {
      id: 1,
      nome: "Resíduos Orgânicos",
      cor: '#059669',
      tom: 'green',
      icone: "bi-flower1",
      exemplos: ["Restos de comida", "Cascas de frutas", "Folhas", "Galhos", "Borra de café"],
      tempoDecomposicao: "2 semanas a 6 meses",
      tratamento: "Compostagem doméstica ou industrial",
      cuidados: ["Separar de outros resíduos", "Evitar carnes e laticínios na compostagem"]
    },
    {
      id: 2,
      nome: "Resíduos Secos",
      cor: '#0ea5e9',
      tom: 'blue',
      icone: "bi-box",
      exemplos: ["Papel limpo", "Plástico", "Vidro", "Metal", "Embalagens"],
      tempoDecomposicao: "Varia por material",
      tratamento: "Coleta seletiva e reciclagem",
      cuidados: ["Limpar antes do descarte", "Separar por tipo de material"]
    }
  ];

  const residuosEspeciais = [
    {
      id: 1,
      nome: "Eletrônicos",
      cor: '#5f7f95',
      icone: "bi-phone",
      exemplos: ["Celulares", "Computadores", "TVs", "Pilhas", "Baterias"],
      perigos: "Metais pesados tóxicos",
      tratamento: "Pontos de coleta especializados",
      cuidados: ["Nunca descartar no lixo comum", "Procurar fabricantes ou lojas"]
    },
    {
      id: 2,
      nome: "Medicamentos",
      cor: '#a96f5f',
      icone: "bi-capsule",
      exemplos: ["Comprimidos vencidos", "Xaropes", "Pomadas", "Injeções", "Termômetros"],
      perigos: "Contaminação do solo e água",
      tratamento: "Farmácias e postos de saúde",
      cuidados: ["Manter na embalagem original", "Não jogar no vaso sanitário"]
    },
    {
      id: 3,
      nome: "Óleo de Cozinha",
      cor: '#a97935',
      icone: "bi-droplet-fill",
      exemplos: ["Óleo de fritura", "Gordura animal", "Azeite usado", "Margarina"],
      perigos: "Entupimento de tubulações, poluição da água",
      tratamento: "Pontos de coleta para produção de biodiesel",
      cuidados: ["Armazenar em recipiente fechado", "Nunca despejar no ralo"]
    },
    {
      id: 4,
      nome: "Lâmpadas",
      cor: '#66757b',
      icone: "bi-lightbulb",
      exemplos: ["Fluorescentes", "LED", "Halógenas", "Incandescentes"],
      perigos: "Mercúrio e outros metais pesados",
      tratamento: "Lojas de materiais elétricos",
      cuidados: ["Embalar com cuidado", "Não quebrar antes do descarte"]
    }
  ];

  const orientacoes = [
    { icon: 'bi-shield-check', title: 'Risco primeiro', text: 'Se pode contaminar água, solo ou pessoas, trate como resíduo especial.' },
    { icon: 'bi-droplet', title: 'Nada no ralo', text: 'Óleo, remédio e químicos precisam de ponto adequado, mesmo em pequenas quantidades.' },
    { icon: 'bi-box-seam', title: 'Embale melhor', text: 'Proteja lâmpadas, pilhas e objetos cortantes antes de levar para descarte.' },
  ];

  const ChipList = ({ items, color }) => (
    <div className="waste-chip-list">
      {items.map((item) => (
        <span key={item} style={{ borderColor: `${color}35`, color, background: `${color}12` }}>{item}</span>
      ))}
    </div>
  );

  return (
    <div className="waste-page">
      <section className="waste-command animate-fadeInUp">
        <div className="waste-command-copy">
          <span className="section-kicker"><i className="bi bi-trash3 me-2" />Gestão de resíduos</span>
          <h1>Resíduos com descarte consciente</h1>
          <p>Identifique o tipo certo, entenda o risco e escolha o descarte adequado sem transformar tudo em lixo comum.</p>
        </div>
        <div className="waste-command-panel">
          <strong>Regra rápida</strong>
          <p>Orgânicos e secos entram na rotina da coleta. Eletrônicos, remédios, óleo e lâmpadas precisam de encaminhamento específico.</p>
          <div>
            <span>{residuosComuns.length} comuns</span>
            <span>{residuosEspeciais.length} especiais</span>
          </div>
        </div>
      </section>

      <section className="waste-guidance-grid animate-fadeInUp animate-delay-1" aria-label="Orientações de descarte seguro">
        {orientacoes.map((item) => (
          <article key={item.title} className="waste-guidance-card">
            <i className={`bi ${item.icon}`} />
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="waste-section">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Rotina doméstica</span>
            <h2>Resíduos comuns</h2>
          </div>
          <p>Materiais do dia a dia, com foco em separação, limpeza e aproveitamento.</p>
        </div>

        <div className="waste-common-grid">
          {residuosComuns.map((residuo, index) => (
            <article key={residuo.id} className={`waste-common-card waste-tone-${residuo.tom} animate-scaleIn animate-delay-${index + 1}`}>
              <div className="waste-card-side" />
              <div className="waste-common-icon" style={{ color: residuo.cor, background: `${residuo.cor}14` }}>
                <i className={`bi ${residuo.icone}`} />
              </div>
              <div className="waste-common-body">
                <h3>{residuo.nome}</h3>
                <p>{residuo.tratamento}</p>
                <ChipList items={residuo.exemplos} color={residuo.cor} />
                <div className="waste-info-strip">
                  <span><i className="bi bi-clock" />{residuo.tempoDecomposicao}</span>
                  <span><i className="bi bi-check2-circle" />{residuo.cuidados[0]}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="waste-section">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker section-kicker-danger">Atenção especial</span>
            <h2>Resíduos especiais</h2>
          </div>
          <p>Itens que pedem cuidado por risco químico, contaminação ou descarte técnico.</p>
        </div>

        <div className="waste-special-grid">
          {residuosEspeciais.map((residuo, index) => (
            <article key={residuo.id} className={`waste-special-card animate-scaleIn animate-delay-${(index % 4) + 1}`} style={{ '--waste-color': residuo.cor }}>
              <div className="waste-special-top">
                <div className="waste-special-icon"><i className={`bi ${residuo.icone}`} /></div>
                <span>Especial</span>
              </div>
              <h3>{residuo.nome}</h3>
              <p className="waste-risk"><i className="bi bi-exclamation-triangle" />{residuo.perigos}</p>
              <ChipList items={residuo.exemplos.slice(0, 4)} color={residuo.cor} />
              <div className="waste-special-footer">
                <strong>Onde descartar</strong>
                <p>{residuo.tratamento}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="waste-alert-band animate-fadeInUp">
        <div>
          <i className="bi bi-lightbulb" />
          <div>
            <h2>Dica de segurança</h2>
            <p>Na dúvida, não misture com o lixo comum. Guarde em embalagem fechada e procure um ponto de coleta adequado.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Residuos;
