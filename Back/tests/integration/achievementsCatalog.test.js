const fs = require('fs');
const path = require('path');

const { ACHIEVEMENT_CATALOG, normalizeTitle, isSatisfiedBy } = require('../../src/config/achievements');

const conteudoReal = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../db_dump.json'), 'utf8'));
const titulosReais = (conteudoReal.praticas || []).map((pratica) => `${pratica.titulo || ''} ${pratica.tipo || ''}`);

describe('catálogo pedagógico das conquistas (PB-07)', () => {
  test('toda conquista tem código único, nome e descrição', () => {
    const codigos = ACHIEVEMENT_CATALOG.map((badge) => badge.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
    for (const badge of ACHIEVEMENT_CATALOG) {
      expect(badge.nome.trim()).not.toBe('');
      expect(badge.descricao.trim()).not.toBe('');
      expect(Array.isArray(badge.titulos) || Array.isArray(badge.pilares)).toBe(true);
    }
  });

  test('toda conquista é alcançável com as práticas do conteúdo real', () => {
    for (const badge of ACHIEVEMENT_CATALOG) {
      expect({ codigo: badge.codigo, alcancavel: isSatisfiedBy(badge, titulosReais) })
        .toEqual({ codigo: badge.codigo, alcancavel: true });
    }
  });

  test('Primeiro Circuito é concedido pela prática de Eletrônica do conteúdo real', () => {
    const badge = ACHIEVEMENT_CATALOG.find((item) => item.codigo === 'primeiro-circuito');
    const eletronica = titulosReais.find((titulo) => normalizeTitle(titulo).includes('eletronica'));
    expect(eletronica).toBeDefined();
    expect(isSatisfiedBy(badge, [eletronica])).toBe(true);
  });

  test('Pensador Computacional exige os quatro pilares, não apenas um', () => {
    const badge = ACHIEVEMENT_CATALOG.find((item) => item.codigo === 'pensador-computacional');
    expect(isSatisfiedBy(badge, ['Prática 1: Decomposição'])).toBe(false);
    expect(isSatisfiedBy(badge, titulosReais)).toBe(true);
  });

  test('a normalização remove acentos e ignora caixa', () => {
    expect(normalizeTitle('Prática 2: Reconhecimento de Padrões')).toBe('pratica 2: reconhecimento de padroes');
  });
});
