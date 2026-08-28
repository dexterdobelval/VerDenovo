// Simulação de banco de dados local
function lerListaLocalStorage(chave) {
  try {
    const valor = localStorage.getItem(chave);
    const lista = valor ? JSON.parse(valor) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    localStorage.removeItem(chave);
    return [];
  }
}

class Database {
  constructor() {
    this.pontos = lerListaLocalStorage('pontos');
    this.empresas = lerListaLocalStorage('empresas');
    this.usuarios = lerListaLocalStorage('usuarios');
    this.inicializarDadosExemplo();
  }

  inicializarDadosExemplo() {
    // Adicionar conta do administrador se não existir
    if (!this.usuarios.find(u => u.email === 'vitorhugobate@gmail.com')) {
      this.usuarios.push({
        id: 999999,
        nome: 'Administrador VerDenovo',
        email: 'vitorhugobate@gmail.com',
        senha: '[PROTEGIDO]',
        nivelAcesso: 'ADMIN',
        foto: null,
        dataCadastro: new Date().toISOString(),
        statusUsuario: 'ATIVO'
      });
      localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    }

    // Adicionar usuários de exemplo se não existirem
    if (this.usuarios.length === 1) {
      const usuariosExemplo = [
        {
          id: 1001,
          nome: 'João Silva',
          email: 'joao.silva@email.com',
          senha: '[PROTEGIDO]',
          nivelAcesso: 'USER',
          foto: null,
          dataCadastro: new Date().toISOString(),
          statusUsuario: 'ATIVO'
        },
        {
          id: 1002,
          nome: 'Maria Santos',
          email: 'maria.santos@email.com',
          senha: '[PROTEGIDO]',
          nivelAcesso: 'USER',
          foto: null,
          dataCadastro: new Date().toISOString(),
          statusUsuario: 'INATIVO'
        }
      ];
      this.usuarios.push(...usuariosExemplo);
      localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    }

    // Adicionar empresas de exemplo se não existirem
    if (this.empresas.length === 0 || this.empresas.some(e => e.id === 2001 || e.id === 2002)) {
      // Remover empresas antigas se existirem
      this.empresas = this.empresas.filter(e => e.id !== 2001 && e.id !== 2002);
      
      const empresasExemplo = [

        {
          id: 2003,
          nome: 'Sustenta Logística',
          email: 'sustenta@logistica.com.br',
          endereco: 'Rod. Castelo Branco, 2000',
          cidade: 'Osasco',
          cep: '06020-000',
          telefone: '(11) 5555-6666',
          setor: 'Logística',
          descricao: 'Transporte e logística verde para coleta seletiva',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-10'
        },
        {
          id: 2004,
          nome: 'Recicla Corp',
          email: 'contato@reciclacorp.com.br',
          endereco: 'Av. das Nações, 800',
          cidade: 'Santana de Parnaíba',
          cep: '06543-000',
          telefone: '(11) 6666-7777',
          setor: 'Reciclagem',
          descricao: 'Processamento e transformação de materiais recicláveis',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-10'
        },
        {
          id: 2005,
          nome: 'GreenOffice Consultoria',
          email: 'green@office.com.br',
          endereco: 'Rua dos Negócios, 300',
          cidade: 'Alphaville',
          cep: '06454-100',
          telefone: '(11) 7777-8888',
          setor: 'Consultoria',
          descricao: 'Consultoria em sustentabilidade e certificações ambientais',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-10'
        },
        {
          id: 2006,
          nome: 'EcoMateriais Brasil',
          email: 'brasil@ecomateriais.com.br',
          endereco: 'Av. Sustentável, 1500',
          cidade: 'Jandira',
          cep: '06600-000',
          telefone: '(11) 8888-9999',
          setor: 'Materiais',
          descricao: 'Fornecimento de materiais sustentáveis e ecológicos',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-10'
        },
        {
          id: 2007,
          nome: 'CleanTech Inovação',
          email: 'contato@cleantech.com.br',
          endereco: 'Rua da Inovação, 250',
          cidade: 'Campinas',
          cep: '13025-000',
          telefone: '(19) 3333-2222',
          setor: 'Tecnologia Limpa',
          descricao: 'Desenvolvimento de tecnologias limpas e soluções ambientais inovadoras para empresas e municípios',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-02-01'
        },
        {
          id: 2008,
          nome: 'BioRecicla Ambiental',
          email: 'parceria@biorecicla.com.br',
          endereco: 'Av. Ecológica, 1200',
          cidade: 'Santos',
          cep: '11075-000',
          telefone: '(13) 4444-5555',
          setor: 'Gestão Ambiental',
          descricao: 'Especializada em gestão de resíduos orgânicos e compostagem industrial, promovendo economia circular',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-02-05'
        }
      ];
      
      // Adicionar apenas as empresas que não existem
      empresasExemplo.forEach(empresa => {
        if (!this.empresas.find(e => e.id === empresa.id)) {
          this.empresas.push(empresa);
        }
      });
      
      localStorage.setItem('empresas', JSON.stringify(this.empresas));
    }

    // Adicionar pontos de exemplo se não existirem
    if (this.pontos.length === 0) {
      const pontosExemplo = [
        {
          id: 3001,
          nome: 'EcoVerde Reciclagem',
          cep: '01234567',
          numero: '123',
          complemento: 'Sala 1',
          telefone: '(11) 9999-8888',
          email: 'contato@ecoverde.com',
          horaFuncionamento: '08:00 às 18:00',
          material: 'Papel, Plástico, Vidro',
          categoria_id: 1,
          usuario_id: 999999,
          dataCadastro: new Date().toISOString(),
          statusPonto: 'ATIVO'
        },
        {
          id: 3002,
          nome: 'Centro Verde Sustentável',
          endereco: 'Av. Meio Ambiente, 456',
          cidade: 'Rio de Janeiro',
          cep: '20123-456',
          telefone: '(21) 8888-7777',
          horario: '07:00 às 17:00',
          materiais: { papel: true, plastico: true, vidro: false, metal: true },
          codigo: 'CENTROVERDE001',
          email: 'contato@centroverde.com',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-20'
        },
        {
          id: 3003,
          nome: 'Recicla Mais Ecológico',
          endereco: 'Rua da Natureza, 789',
          cidade: 'Belo Horizonte',
          cep: '30456-789',
          telefone: '(31) 7777-6666',
          horario: '09:00 às 16:00',
          materiais: { papel: true, plastico: true, vidro: true, metal: true },
          codigo: 'RECICLAMAIS001',
          email: 'contato@reciclamais.com',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-20'
        },
        {
          id: 3004,
          nome: 'Ponto Verde Consciente',
          endereco: 'Praça da Sustentabilidade, 321',
          cidade: 'Porto Alegre',
          cep: '90123-321',
          telefone: '(51) 6666-5555',
          horario: '08:30 às 17:30',
          materiais: { papel: false, plastico: true, vidro: true, metal: true },
          codigo: 'PONTOVERDE001',
          email: 'contato@pontoverde.com',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-20'
        },
        {
          id: 3005,
          nome: 'EcoPoint Renovável',
          endereco: 'Rua do Futuro Verde, 654',
          cidade: 'Curitiba',
          cep: '80654-987',
          telefone: '(41) 5555-4444',
          horario: '07:30 às 18:30',
          materiais: { papel: true, plastico: false, vidro: true, metal: true },
          codigo: 'ECOPOINT001',
          email: 'contato@ecopoint.com',
          senha: '123456',
          ativo: false,
          dataCadastro: '2024-02-15'
        },
        {
          id: 3006,
          nome: 'Reciclagem Planeta Limpo',
          endereco: 'Av. Terra Verde, 987',
          cidade: 'Salvador',
          cep: '40987-123',
          telefone: '(71) 4444-3333',
          horario: '08:00 às 17:00',
          materiais: { papel: true, plastico: true, vidro: false, metal: false },
          codigo: 'PLANETALIMPO001',
          email: 'contato@planetalimpo.com',
          senha: '123456',
          ativo: true,
          dataCadastro: '2024-01-20'
        }
      ];
      this.pontos.push(...pontosExemplo);
      localStorage.setItem('pontos', JSON.stringify(this.pontos));
    }
  }

  // Pontos de Coleta
  adicionarPonto(ponto) {
    const novoPonto = {
      id: Date.now(),
      nome: ponto.nome,
      cep: ponto.cep?.replace(/\D/g, ''),
      numero: ponto.numero || 'S/N',
      complemento: ponto.complemento || null,
      telefone: ponto.telefone,
      email: ponto.email,
      horaFuncionamento: ponto.horario || ponto.horaFuncionamento,
      material: this.formatarMateriais(ponto.materiais),
      categoria_id: 1,
      usuario_id: 999999,
      dataCadastro: new Date().toISOString(),
      statusPonto: 'ATIVO'
    };
    this.pontos.push(novoPonto);
    localStorage.setItem('pontos', JSON.stringify(this.pontos));
    return novoPonto;
  }

  formatarMateriais(materiais) {
    if (!materiais) return '';
    const tipos = [];
    if (materiais.papel) tipos.push('Papel');
    if (materiais.plastico) tipos.push('Plástico');
    if (materiais.vidro) tipos.push('Vidro');
    if (materiais.metal) tipos.push('Metal');
    return tipos.join(', ');
  }

  buscarPonto() {
    // Autenticação de pontos deve ser feita via API backend
    return null;
  }

  listarPontos() {
    return this.pontos;
  }

  excluirPonto(id) {
    this.pontos = this.pontos.filter(p => p.id !== id);
    localStorage.setItem('pontos', JSON.stringify(this.pontos));
  }

  atualizarPonto(id, dadosAtualizados) {
    const index = this.pontos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pontos[index] = { ...this.pontos[index], ...dadosAtualizados };
      localStorage.setItem('pontos', JSON.stringify(this.pontos));
      return this.pontos[index];
    }
    return null;
  }

  // Empresas
  adicionarEmpresa(empresa) {
    const novaEmpresa = {
      id: Date.now(),
      ...empresa,
      ativo: true,
      dataCadastro: new Date().toISOString()
    };
    this.empresas.push(novaEmpresa);
    localStorage.setItem('empresas', JSON.stringify(this.empresas));
    return novaEmpresa;
  }

  buscarEmpresa() {
    // Autenticação de empresas deve ser feita via API backend
    return null;
  }

  listarEmpresas() {
    return this.empresas;
  }

  excluirEmpresa(id) {
    this.empresas = this.empresas.filter(e => e.id !== id);
    localStorage.setItem('empresas', JSON.stringify(this.empresas));
  }

  atualizarEmpresa(id, dadosAtualizados) {
    const index = this.empresas.findIndex(e => e.id === id);
    if (index !== -1) {
      this.empresas[index] = { ...this.empresas[index], ...dadosAtualizados };
      localStorage.setItem('empresas', JSON.stringify(this.empresas));
      return this.empresas[index];
    }
    return null;
  }

  // Usuários
  adicionarUsuario(usuario) {
    const novoUsuario = {
      id: Date.now(),
      ...usuario,
      nivelAcesso: 'USER',
      foto: null,
      dataCadastro: new Date().toISOString(),
      statusUsuario: 'ATIVO'
    };
    this.usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    return novoUsuario;
  }

  buscarUsuario() {
    // Autenticação de usuários deve ser feita via API backend
    return null;
  }

  listarUsuarios() {
    return this.usuarios;
  }

  excluirUsuario(id) {
    this.usuarios = this.usuarios.filter(u => u.id !== id);
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }

  atualizarUsuario(id, dadosAtualizados) {
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      this.usuarios[index] = { ...this.usuarios[index], ...dadosAtualizados };
      localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
      return this.usuarios[index];
    }
    return null;
  }

  // Métodos para gerenciamento de status
  alterarStatusPonto(id, ativo) {
    return this.atualizarPonto(id, { ativo });
  }

  alterarStatusEmpresa(id, ativo) {
    return this.atualizarEmpresa(id, { ativo });
  }

  alterarStatusUsuario(id, ativo) {
    return this.atualizarUsuario(id, { ativo });
  }
}

export const database = new Database();
