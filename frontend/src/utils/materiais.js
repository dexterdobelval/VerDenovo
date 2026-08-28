export const MATERIAIS_ACEITOS = [
  { id: 'papel', label: 'Papel', nome: 'Papel', icon: 'paper', color: '#4f7da8' },
  { id: 'plastico', label: 'Plástico', nome: 'Plástico', icon: 'plastic', color: '#b86a64' },
  { id: 'vidro', label: 'Vidro', nome: 'Vidro', icon: 'glass', color: '#3f8f6b' },
  { id: 'metal', label: 'Metal', nome: 'Metal', icon: 'metal', color: '#b88a3d' },
  { id: 'eletronico', label: 'Eletrônico', nome: 'Eletrônico', icon: 'electronic', color: '#7c6aa8' },
  { id: 'organico', label: 'Orgânico', nome: 'Orgânico', icon: 'organic', color: '#6b9448' },
];

const aliases = {
  papel: 'papel',
  papeis: 'papel',
  papelao: 'papel',
  plastico: 'plastico',
  plasticos: 'plastico',
  vidro: 'vidro',
  vidros: 'vidro',
  metal: 'metal',
  metais: 'metal',
  eletronico: 'eletronico',
  eletronicos: 'eletronico',
  eletronica: 'eletronico',
  eletronicas: 'eletronico',
  eletronicoeletronico: 'eletronico',
  organico: 'organico',
  organicos: 'organico',
  organica: 'organico',
  organicas: 'organico',
};

export const MATERIAL_IDS = MATERIAIS_ACEITOS.map(material => material.id);

const removerAcentos = (valor) => String(valor || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export function normalizarMaterialId(valor) {
  const texto = removerAcentos(valor)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return aliases[texto] || null;
}

export function getMaterialConfig(valor) {
  const id = normalizarMaterialId(valor);
  return MATERIAIS_ACEITOS.find(material => material.id === id) || null;
}

export function normalizarMateriais(material) {
  if (!material) return [];

  const valores = Array.isArray(material)
    ? material
    : typeof material === 'object'
      ? Object.entries(material)
          .filter(([, ativo]) => Boolean(ativo))
          .map(([nome]) => nome)
      : String(material).split(/[,;|/]+/);

  const vistos = new Set();
  return valores.reduce((lista, valor) => {
    const config = getMaterialConfig(valor);
    const label = config?.label || String(valor || '').trim();
    if (!label || vistos.has(config?.id || label.toLowerCase())) return lista;

    vistos.add(config?.id || label.toLowerCase());
    lista.push(config || { id: null, label, nome: label, icon: 'recycle', color: '#6b7280' });
    return lista;
  }, []);
}

export function materiaisParaEstado(material) {
  const estado = Object.fromEntries(MATERIAL_IDS.map(id => [id, false]));
  normalizarMateriais(material).forEach(item => {
    if (item.id) estado[item.id] = true;
  });
  return estado;
}

export function materiaisSelecionadosParaTexto(materiaisSelecionados) {
  return MATERIAIS_ACEITOS
    .filter(material => Boolean(materiaisSelecionados?.[material.id]))
    .map(material => material.nome)
    .join(', ');
}
