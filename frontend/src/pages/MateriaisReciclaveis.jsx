function MateriaisReciclaveis() {
  const materiais = [
    {
      id: 1,
      nome: "Papel",
      cor: '#3b82f6',
      tom: 'paper',
      icone: "bi-file-text",
      exemplos: ["Jornais", "Revistas", "Papelão", "Papel de escritório", "Caixas"],
      tempoDecomposicao: "3 a 6 meses",
      beneficios: "Economiza água e energia, reduz desmatamento",
      naoReciclar: ["Papel higiênico", "Guardanapos sujos", "Papel carbono"]
    },
    {
      id: 2,
      nome: "Plástico",
      cor: '#ef4444',
      tom: 'plastic',
      icone: "bi-cup-straw",
      exemplos: ["Garrafas PET", "Embalagens", "Sacolas", "Potes", "Tampas"],
      tempoDecomposicao: "100 a 400 anos",
      beneficios: "Reduz poluição dos oceanos, economiza petróleo",
      naoReciclar: ["Plásticos sujos", "Isopor", "Plástico filme"]
    },
    {
      id: 3,
      nome: "Vidro",
      cor: '#059669',
      tom: 'glass',
      icone: "bi-cup",
      exemplos: ["Garrafas", "Potes", "Frascos", "Copos", "Janelas"],
      tempoDecomposicao: "Mais de 1000 anos",
      beneficios: "100% reciclável, economiza energia e matéria-prima",
      naoReciclar: ["Espelhos", "Lâmpadas", "Vidros temperados", "Cristal"]
    },
    {
      id: 4,
      nome: "Metal",
      cor: '#f59e0b',
      tom: 'metal',
      icone: "bi-gear",
      exemplos: ["Latas de alumínio", "Latas de aço", "Tampas", "Arames", "Pregos"],
      tempoDecomposicao: "10 a 100 anos",
      beneficios: "Economiza energia, reduz mineração",
      naoReciclar: ["Latas de tinta", "Aerossóis", "Materiais contaminados"]
    }
  ];

  const passos = [
    { icon: 'bi-droplet', title: 'Limpe', text: 'Retire restos de alimento antes do descarte.' },
    { icon: 'bi-layers', title: 'Separe', text: 'Não misture recicláveis com orgânicos.' },
    { icon: 'bi-geo-alt', title: 'Leve', text: 'Procure um ponto de coleta quando não houver coleta seletiva.' },
  ];

  return (
    <div className="materials-page">
      <section className="materials-intro animate-fadeInUp">
        <div>
          <span className="section-kicker"><i className="bi bi-recycle me-2" />Guia de separação</span>
          <h1>Materiais Recicláveis</h1>
          <p>Veja o que pode ser reciclado, quais itens exigem atenção e como preparar cada material para a coleta.</p>
        </div>
        <div className="materials-score-card">
          <strong>4 grupos principais</strong>
          <span>Papel, plástico, vidro e metal</span>
          <div className="materials-score-icons">
            {materiais.map((material) => (
              <i key={material.nome} className={`bi ${material.icone}`} style={{ color: material.cor }} />
            ))}
          </div>
        </div>
      </section>

      <section className="materials-steps animate-fadeInUp animate-delay-1" aria-label="Passos para reciclar corretamente">
        {passos.map((passo) => (
          <article key={passo.title}>
            <i className={`bi ${passo.icon}`} />
            <div>
              <h2>{passo.title}</h2>
              <p>{passo.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="materials-section">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Materiais</span>
            <h2>Como separar cada tipo</h2>
          </div>
          <p>Cards compactos com exemplos, tempo de decomposição, benefícios e itens que não entram na reciclagem comum.</p>
        </div>

        <div className="materials-redesign-grid">
          {materiais.map((material, index) => (
            <article key={material.id} className={`material-guide-card material-tone-${material.tom} animate-scaleIn animate-delay-${(index % 4) + 1}`} style={{ '--material-color': material.cor }}>
              <div className="material-guide-top">
                <div className="material-guide-icon"><i className={`bi ${material.icone}`} /></div>
                <span>Reciclável</span>
              </div>

              <div className="material-guide-title">
                <h3>{material.nome}</h3>
                <strong>{material.tempoDecomposicao}</strong>
              </div>

              <div className="material-guide-block">
                <span>Exemplos</span>
                <div className="material-chip-list">
                  {material.exemplos.map((item) => <em key={item}>{item}</em>)}
                </div>
              </div>

              <div className="material-benefit">
                <i className="bi bi-leaf" />
                <p>{material.beneficios}</p>
              </div>

              <div className="material-guide-block material-avoid">
                <span>Evite colocar</span>
                <div className="material-chip-list">
                  {material.naoReciclar.map((item) => <em key={item}>{item}</em>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="materials-note-band animate-fadeInUp">
        <i className="bi bi-check2-circle" />
        <div>
          <h2>Separar bem aumenta a chance de reciclagem</h2>
          <p>Materiais limpos, secos e agrupados por tipo chegam em melhor condição aos pontos de coleta e cooperativas.</p>
        </div>
      </section>
    </div>
  );
}

export default MateriaisReciclaveis;
