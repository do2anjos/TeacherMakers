// Catálogo pedagógico das conquistas Maker (PB-07).
// Os critérios são avaliados sobre os títulos normalizados das práticas
// concluídas (sem acentos, em caixa baixa). Manter as definições em um único
// lugar permite validar o catálogo contra o conteúdo real em db_dump.json.
const ACHIEVEMENT_CATALOG = Object.freeze([
  {
    codigo: 'primeiro-circuito',
    nome: 'Primeiro Circuito',
    descricao: 'Concluiu a prática de Eletrônica – O Inseto Vibratório (primeiro circuito).',
    titulos: ['circuit', 'eletronica', 'inseto vibratorio']
  },
  {
    codigo: 'mestre-decomposicao',
    nome: 'Mestre da Decomposição',
    descricao: 'Concluiu a prática de Decomposição.',
    titulos: ['decomposicao']
  },
  {
    codigo: 'cacador-padroes',
    nome: 'Caçador de Padrões',
    descricao: 'Concluiu a prática de Reconhecimento de Padrões.',
    titulos: ['padroes']
  },
  {
    codigo: 'pensador-computacional',
    nome: 'Pensador Computacional',
    descricao: 'Concluiu práticas dos quatro pilares do pensamento computacional.',
    pilares: ['decomposicao', 'padroes', 'abstracao', 'algoritmos']
  }
]);

function normalizeTitle(value) {
  return `${value || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function isSatisfiedBy(entry, completedTitles) {
  const titles = completedTitles.map(normalizeTitle);
  if (Array.isArray(entry.titulos)) {
    return titles.some((title) => entry.titulos.some((keyword) => title.includes(keyword)));
  }
  if (Array.isArray(entry.pilares)) {
    return entry.pilares.every((pilar) => titles.some((title) => title.includes(pilar)));
  }
  return false;
}

module.exports = { ACHIEVEMENT_CATALOG, normalizeTitle, isSatisfiedBy };
