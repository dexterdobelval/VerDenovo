// Simulação de API de notícias do Brasil
function lerNoticiasSalvas() {
  try {
    const noticias = JSON.parse(localStorage.getItem('noticias') || '[]');
    return Array.isArray(noticias) ? noticias : [];
  } catch {
    localStorage.removeItem('noticias');
    return [];
  }
}

class NoticiasService {
  constructor() {
    this.ultimaAtualizacao = localStorage.getItem('ultimaAtualizacaoNoticias');
    this.noticias = lerNoticiasSalvas();
  }

  // Simula busca de notícias do Brasil
  async buscarNoticias() {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const noticiasSimuladas = [
      {
        id: Date.now() + Math.random(),
        titulo: "Brasil Aumenta Reciclagem de Plástico em 25% Este Ano",
        resumo: "Novo programa nacional de coleta seletiva mostra resultados positivos em todo território brasileiro.",
        data: new Date().toLocaleDateString('pt-BR'),
        imagem: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=200&fit=crop"
      },
      {
        id: Date.now() + Math.random() + 1,
        titulo: "São Paulo Inaugura 50 Novos Pontos de Coleta Sustentável",
        resumo: "Iniciativa visa facilitar descarte correto de materiais recicláveis na capital paulista.",
        data: new Date().toLocaleDateString('pt-BR'),
        imagem: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop"
      },
      {
        id: Date.now() + Math.random() + 2,
        titulo: "Energia Solar Cresce 40% no Brasil em 2024",
        resumo: "País se consolida como líder em energia renovável na América Latina com novos investimentos.",
        data: new Date().toLocaleDateString('pt-BR'),
        imagem: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=200&fit=crop"
      }
    ];

    return noticiasSimuladas;
  }

  // Verifica se precisa atualizar (24 horas)
  precisaAtualizar() {
    if (!this.ultimaAtualizacao) return true;
    
    const agora = new Date().getTime();
    const ultimaAtualizacao = new Date(this.ultimaAtualizacao).getTime();
    const diferencaHoras = (agora - ultimaAtualizacao) / (1000 * 60 * 60);
    
    return diferencaHoras >= 24;
  }

  // Atualiza notícias se necessário
  async atualizarNoticias() {
    if (this.precisaAtualizar()) {
      this.noticias = await this.buscarNoticias();
      this.ultimaAtualizacao = new Date().toISOString();
      localStorage.setItem('noticias', JSON.stringify(this.noticias));
      localStorage.setItem('ultimaAtualizacaoNoticias', this.ultimaAtualizacao);
    }
    
    return this.noticias;
  }

  // Retorna notícias (atualiza se necessário)
  async obterNoticias() {
    return await this.atualizarNoticias();
  }
}

export const noticiasService = new NoticiasService();
