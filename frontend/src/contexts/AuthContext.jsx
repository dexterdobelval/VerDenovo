import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const saved = localStorage.getItem('usuario_logado');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('usuario_logado');
      return null;
    }
  });
  const [mostrarMensagemLogout, setMostrarMensagemLogout] = useState(false);

  useEffect(() => {
    if (usuario && usuario.tipo === 'usuario' && !usuario.pontoVinculado) {
      apiService.listarMeusPontos().catch(() => []).then(meusPontos => {
        const pontoAtivo = meusPontos.find(p => p.statusPonto === 'ATIVO') || null;
        if (pontoAtivo) setUsuario(prev => ({ ...prev, pontoVinculado: pontoAtivo }));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario_logado', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuario_logado');
    }
  }, [usuario]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('usuario_logado');
        const savedUser = saved ? JSON.parse(saved) : null;
        if (JSON.stringify(savedUser) !== JSON.stringify(usuario)) {
          setUsuario(savedUser);
        }
      } catch {
        localStorage.removeItem('usuario_logado');
        setUsuario(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [usuario]);

  const loginAdmin = async (email, senha) => {
    const response = await apiService.login(email, senha);
    if (response.usuario?.nivelAcesso !== 'ADMIN') {
      apiService.logout(); // limpa o token que foi salvo
      throw new Error('Acesso negado. Conta sem permissão de administrador.');
    }
    setUsuario({ tipo: 'admin', dados: response.usuario });
    return response;
  };

  const loginUsuario = async (email, senha) => {
    const response = await apiService.login(email, senha);
    let pontoAtivo = null;
    if (response.usuario?.nivelAcesso !== 'ADMIN') {
      const meusPontos = await apiService.listarMeusPontos().catch(() => []);
      pontoAtivo = meusPontos.find(p => p.statusPonto === 'ATIVO') || null;
      if (!pontoAtivo) {
        const todosPontos = await apiService.listarPontos().catch(() => []);
        pontoAtivo = todosPontos.find(p => p.email === response.usuario.email && p.statusPonto === 'ATIVO') || null;
      }
    }
    setUsuario({ tipo: 'usuario', dados: response.usuario, pontoVinculado: pontoAtivo });
    return response;
  };

  const loginPonto = (ponto) => {
    setUsuario({ tipo: 'ponto', dados: ponto });
    return { success: true };
  };

  const cadastrarUsuario = async (dadosUsuario) => {
    await apiService.cadastrar(dadosUsuario);
    return { success: true };
  };

  const logout = () => {
    apiService.logout();
    setUsuario(null);
    setMostrarMensagemLogout(true);
    setTimeout(() => setMostrarMensagemLogout(false), 3000);
    window.location.href = '/';
  };

  const atualizarPontoVinculado = async () => {
    if (!usuario || usuario.tipo !== 'usuario') return;
    const [meusPontos, todosPontos] = await Promise.all([
      apiService.listarMeusPontos().catch(() => []),
      apiService.listarPontos().catch(() => [])
    ]);
    const pontoAtivo =
      meusPontos.find(p => p.statusPonto === 'ATIVO') ||
      todosPontos.find(p => p.email === usuario.dados?.email && p.statusPonto === 'ATIVO') ||
      null;
    setUsuario(prev => ({ ...prev, pontoVinculado: pontoAtivo }));
  };

  const isLogado = () => usuario !== null;

  return (
    <AuthContext.Provider value={{
      usuario,
      loginAdmin,
      loginUsuario,
      loginPonto,
      cadastrarUsuario,
      logout,
      isLogado,
      mostrarMensagemLogout,
      atualizarPontoVinculado,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
