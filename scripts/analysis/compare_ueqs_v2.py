"""Compara os escores UEQ-S coletados na V2 com o baseline (PB-07).

Uso:
    python scripts/analysis/compare_ueqs_v2.py <caminho-do-csv-v2>

O CSV deve seguir analise/protocolos/Questionario_UEQ-S_V2_template.csv.
O script apenas lê dados reais e imprime o relatorio; nao gera evidencia.
"""
import argparse
import csv
import math
import os
import statistics
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASELINE_XLSX = os.path.join(
    PROJECT_ROOT, 'analise', 'dados',
    'Questionário de Experiência do Usuário (UEQ-S) (respostas).xlsx'
)

ITEM_COLUMNS = [
    'item_1_obstrutivo_apoiador',
    'item_2_complicado_facil',
    'item_3_ineficiente_eficiente',
    'item_4_confuso_claro',
    'item_5_chato_empolgante',
    'item_6_desinteressante_interessante',
    'item_7_convencional_inovador',
    'item_8_tradicional_criativo',
]
ITEM_NAMES = [
    'Obstrutivo-Apoiador', 'Complicado-Facil', 'Ineficiente-Eficiente', 'Confuso-Claro',
    'Chato-Empolgante', 'Desinteressante-Interessante', 'Convencional-Inovador', 'Tradicional-Criativo',
]
SCALES = {'QP': range(0, 4), 'QH': range(4, 8), 'QG': range(0, 8)}
REFERENCE = {'QP': 1.19, 'QH': 0.31, 'QG': 0.75}


def read_v2(path):
    with open(path, newline='', encoding='utf-8-sig') as handle:
        reader = csv.DictReader(handle)
        missing = [column for column in ITEM_COLUMNS if column not in (reader.fieldnames or [])]
        if missing:
            raise ValueError('Colunas ausentes no CSV: ' + ', '.join(missing))
        responses = []
        for line, row in enumerate(reader, start=2):
            if not any((row.get(column) or '').strip() for column in ITEM_COLUMNS):
                continue
            code = (row.get('codigo_participante') or '').strip()
            if not code:
                raise ValueError(f'Linha {line}: codigo_participante vazio')
            values = []
            for column in ITEM_COLUMNS:
                raw = (row.get(column) or '').strip().replace(',', '.')
                try:
                    note = float(raw)
                except ValueError:
                    raise ValueError(f'Linha {line}: nota invalida em {column}: {raw!r}')
                if not 1 <= note <= 7:
                    raise ValueError(f'Linha {line}: nota fora de 1..7 em {column}: {note}')
                values.append(note - 4.0)
            responses.append({'code': code, 'values': values})
    codes = [item['code'] for item in responses]
    duplicates = sorted({code for code in codes if codes.count(code) > 1})
    if duplicates:
        raise ValueError('Codigos de participante repetidos: ' + ', '.join(duplicates))
    if not responses:
        raise ValueError('Nenhuma resposta preenchida no CSV; nao ha dados para analisar.')
    return responses


def read_baseline(path):
    try:
        import openpyxl
    except ImportError:
        raise RuntimeError('openpyxl e necessario para ler o baseline: pip install openpyxl')
    if not os.path.exists(path):
        raise FileNotFoundError(f'Baseline nao encontrado: {path}')
    workbook = openpyxl.load_workbook(path, data_only=True)
    rows = list(workbook.active.iter_rows(values_only=True))
    scores = []
    for row in rows[1:]:
        if len(row) < 10 or row[2] is None:
            continue
        scores.append([float(value) - 4.0 for value in row[2:10]])
    if not scores:
        raise ValueError('Baseline sem respostas validas.')
    return scores


def scale_scores(scores, indices):
    return [statistics.mean([values[index] for index in indices]) for values in scores]


def describe(values):
    mean = statistics.mean(values)
    sd = statistics.stdev(values) if len(values) > 1 else 0.0
    margin = 1.96 * sd / math.sqrt(len(values))
    return mean, sd, (mean - margin, mean + margin)


def benchmark(mean):
    if mean > 0.8:
        return 'Positiva'
    if mean < -0.8:
        return 'Negativa'
    return 'Neutra'


def welch_p_value(current, baseline):
    try:
        from scipy import stats
    except ImportError:
        return None
    if len(current) < 2 or len(baseline) < 2:
        return None
    return stats.ttest_ind(current, baseline, equal_var=False).pvalue


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv_v2', help='CSV preenchido da reaplicacao V2')
    parser.add_argument('--baseline', default=BASELINE_XLSX, help='XLSX original do baseline')
    args = parser.parse_args()

    current = read_v2(args.csv_v2)
    baseline = read_baseline(args.baseline)
    print(f'UEQ-S V2 — N={len(current)} participantes; baseline — N={len(baseline)} participantes')
    if len(current) < 8:
        print('AVISO: amostra V2 abaixo da meta N>=8 do protocolo; informar N real no relatorio.')
    print()

    print('=== ITENS V2 (escala -3 a +3) ===')
    for index, name in enumerate(ITEM_NAMES):
        mean, sd, _ = describe([item['values'][index] for item in current])
        print(f'{index + 1}. {name}: media={mean:+.2f}, DP={sd:.2f}')
    print()

    print('=== ESCALAS V2 x BASELINE ===')
    for key, indices in SCALES.items():
        v2_scores = scale_scores([item['values'] for item in current], indices)
        base_scores = scale_scores(baseline, indices)
        v2_mean, v2_sd, v2_ci = describe(v2_scores)
        base_mean, base_sd, base_ci = describe(base_scores)
        print(f'{key}: V2 media={v2_mean:+.2f} (DP={v2_sd:.2f}, IC95=[{v2_ci[0]:+.2f}; {v2_ci[1]:+.2f}], {benchmark(v2_mean)})')
        print(f'   baseline calculado={base_mean:+.2f} (DP={base_sd:.2f}, IC95=[{base_ci[0]:+.2f}; {base_ci[1]:+.2f}]) | referencia documentada={REFERENCE[key]:+.2f}')
        print(f'   diferenca (V2 - baseline)={v2_mean - base_mean:+.2f}')
        p_value = welch_p_value(v2_scores, base_scores)
        print('   teste de Welch: ' + (f'p={p_value:.4f}' if p_value is not None else 'nao disponivel (scipy ausente ou N<2)'))
        print()
    print('Interpretacao: benchmark > +0,80 positiva; -0,80 a +0,80 neutra; < -0,80 negativa.')
    print('Este script nao grava arquivos e nao substitui observacoes ausentes.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, FileNotFoundError) as error:
        print(f'Erro: {error}', file=sys.stderr)
        sys.exit(1)
