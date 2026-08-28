const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ALLOWED_ORIGIN = new URL(API_BASE_URL).origin;

function buildSafeUrl(endpoint) {
  if (!/^\/[a-zA-Z0-9\-_/]+$/.test(endpoint)) {
    throw new Error('Endpoint inválido.');
  }
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (url.origin !== ALLOWED_ORIGIN) {
    throw new Error('URL fora do domínio permitido.');
  }
  return url.toString();
}

function mensagemAmigavel(mensagem, fallback = 'Não foi possível concluir a operação. Tente novamente.') {
  if (!mensagem) return fallback;
  const texto = String(mensagem).trim();
  const pareceTecnica = /(java\.|SQLException|JWT|stack|trace|undefined|null|Failed to fetch|NetworkError|TypeError)/i.test(texto);
  if (pareceTecnica || texto.length > 180) return fallback;
  return texto;
}

// Token mantido em memória — não acessível por scripts XSS via localStorage
let _tokenMemoria = null;

class ApiService {
  getToken() {
    const token = _tokenMemoria;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return null;
      }
    } catch {
      this.logout();
      return null;
    }
    return token;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = buildSafeUrl(endpoint);
    let response;
    try {
      response = await fetch(url, {
        headers: this.getHeaders(),
        ...options,
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
    }

    if (response.status === 401) {
      this.logout();
      window.location.href = '/';
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      let mensagem;
      try {
        const errorJson = JSON.parse(errorText);
        mensagem = errorJson.message || `Erro ${response.status}`;
      } catch {
        mensagem = errorText || `Erro ${response.status}`;
      }
      throw new Error(mensagemAmigavel(mensagem));
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return { message: await response.text() };
  }

  async login(email, senha) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (response.token) {
      _tokenMemoria = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    }
    return response;
  }

  async cadastrar(usuario) {
    return this.request('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        nivelAcesso: usuario.nivelAcesso || 'USER',
      }),
    });
  }

  logout() {
    _tokenMemoria = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('ponto');
  }

  async listarPontos() { return this.request('/pontos'); }
  async listarTodosPontos() { return this.request('/pontos/todos'); }
  async listarPontosPendentes() { return this.request('/pontos/pendentes'); }
  async listarMeusPontos() { return this.request('/pontos/meus'); }
  async criarPonto(ponto) { return this.request('/pontos', { method: 'POST', body: JSON.stringify(ponto) }); }
  async atualizarPonto(id, ponto) { return this.request(`/pontos/${id}`, { method: 'PUT', body: JSON.stringify(ponto) }); }
  async aprovarPonto(id) { return this.request(`/pontos/${id}/aprovar`, { method: 'PUT' }); }
  async rejeitarPonto(id) { return this.request(`/pontos/${id}/rejeitar`, { method: 'PUT' }); }
  async alterarStatusPonto(id) { return this.request(`/pontos/${id}/status`, { method: 'PUT' }); }
  async deletarPonto(id) { return this.request(`/pontos/${id}`, { method: 'DELETE' }); }
  async listarCategorias() { return this.request('/categorias'); }
  async listarUsuarios() { return this.request('/auth/usuarios'); }
  async alterarStatusUsuario(id) { return this.request(`/auth/usuarios/${id}/status`, { method: 'PUT' }); }
  async deletarUsuario(id) { return this.request(`/auth/usuarios/${id}`, { method: 'DELETE' }); }

  async loginPonto(email, senha) {
    const response = await this.request('/pontos/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (response.token) {
      _tokenMemoria = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('ponto', JSON.stringify(response.ponto));
    }
    return response;
  }

  async recuperarSenha(email) {
    return this.request('/auth/recuperar-senha', { method: 'POST', body: JSON.stringify({ email }) });
  }

  async verificarCodigo(email, codigo) {
    return this.request('/auth/verificar-codigo', { method: 'POST', body: JSON.stringify({ email, codigo }) });
  }

  async redefinirSenhaPorCodigo(email, codigo, novaSenha) {
    return this.request('/auth/redefinir-senha', { method: 'POST', body: JSON.stringify({ email, codigo, novaSenha }) });
  }

  async redefinirSenha(token, novaSenha) {
    return this.request('/auth/redefinir-senha', { method: 'POST', body: JSON.stringify({ token, novaSenha }) });
  }

  isAuthenticated() { return !!this.getToken(); }

  // Restaura token da sessão anterior se ainda válido (chamado no bootstrap da app)
  restoreSession() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          _tokenMemoria = token;
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }

  getUsuarioLogado() {
    try {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    } catch {
      localStorage.removeItem('usuario');
      return null;
    }
  }
}

export const apiService = new ApiService();
