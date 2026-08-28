export function normalizarCep(cep) {
  return String(cep || '').replace(/\D/g, '').slice(0, 8);
}

export async function buscarEnderecoPorCep(cep) {
  const cepLimpo = normalizarCep(cep);
  if (cepLimpo.length !== 8) {
    return { status: 'incompleto', cep: cepLimpo };
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, { method: 'GET' });
    if (!res.ok) {
      return { status: 'erro', cep: cepLimpo, mensagem: 'Nao foi possivel buscar este CEP agora.' };
    }

    const data = await res.json();
    if (!data || data.erro) {
      return { status: 'nao_encontrado', cep: cepLimpo, mensagem: 'CEP nao encontrado. Confira os numeros informados.' };
    }

    return {
      status: 'ok',
      cep: cepLimpo,
      endereco: {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      },
    };
  } catch {
    return { status: 'erro', cep: cepLimpo, mensagem: 'Nao foi possivel buscar o endereco. Tente novamente.' };
  }
}
