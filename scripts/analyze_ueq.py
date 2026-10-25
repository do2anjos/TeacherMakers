import openpyxl
import statistics
import math

def analyze_ueq():
    wb = openpyxl.load_workbook(r'c:\Users\Do2anjos\Desktop\T.I\TeacherMakers\Questionário de Experiência do Usuário (UEQ-S) (respostas).xlsx')
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))[1:]

    items = [
        '1. Obstrutivo - Apoiador',
        '2. Complicado - Fácil',
        '3. Ineficiente - Eficiente',
        '4. Confuso - Claro',
        '5. Chato - Empolgante',
        '6. Desinteressante - Interessante',
        '7. Convencional - Inovador',
        '8. Tradicional - Criativo'
    ]

    user_scores = []
    transformed_rows = []

    for r in rows:
        name = r[1] or 'Anônimo'
        raw_vals = [float(x) for x in r[2:10]]
        trans_vals = [x - 4.0 for x in raw_vals]
        pragmatic = statistics.mean(trans_vals[0:4])
        hedonic = statistics.mean(trans_vals[4:8])
        overall = statistics.mean(trans_vals)
        user_scores.append({
            'name': name,
            'raw': raw_vals,
            'trans': trans_vals,
            'pragmatic': pragmatic,
            'hedonic': hedonic,
            'overall': overall
        })
        transformed_rows.append(trans_vals)

    print('=== UEQ-S RESULTADOS INDIVIDUAIS ===')
    for u in user_scores:
        print(f"{u['name']}: Pragmática={u['pragmatic']:+.2f}, Hedônica={u['hedonic']:+.2f}, Geral={u['overall']:+.2f}")

    print('\n=== UEQ-S MÉDIAS E DESVIO POR ITEM (-3 a +3) ===')
    for col_idx in range(8):
        vals = [row[col_idx] for row in transformed_rows]
        m = statistics.mean(vals)
        s = statistics.stdev(vals)
        print(f"{items[col_idx]}: Média={m:+.2f}, Desvio={s:.2f}")

    mean_pragmatic = statistics.mean([u['pragmatic'] for u in user_scores])
    mean_hedonic = statistics.mean([u['hedonic'] for u in user_scores])
    mean_overall = statistics.mean([u['overall'] for u in user_scores])

    std_pragmatic = statistics.stdev([u['pragmatic'] for u in user_scores])
    std_hedonic = statistics.stdev([u['hedonic'] for u in user_scores])
    std_overall = statistics.stdev([u['overall'] for u in user_scores])

    print(f"\n=== ESCALAS UEQ-S CONSOLIDADAS ===")
    print(f"Qualidade Pragmática: Média = {mean_pragmatic:+.2f} (DP = {std_pragmatic:.2f})")
    print(f"Qualidade Hedônica:   Média = {mean_hedonic:+.2f} (DP = {std_hedonic:.2f})")
    print(f"Qualidade Geral:      Média = {mean_overall:+.2f} (DP = {std_overall:.2f})")

    # Benchmark interpretation:
    # Scale: > 0.8 is positive, -0.8 to 0.8 neutral, < -0.8 negative
    print(f"Classificação Pragmática: {'Excelente/Positiva' if mean_pragmatic > 0.8 else ('Neutra' if mean_pragmatic >= -0.8 else 'Negativa')}")
    print(f"Classificação Hedônica:   {'Excelente/Positiva' if mean_hedonic > 0.8 else ('Neutra' if mean_hedonic >= -0.8 else 'Negativa')}")
    print(f"Classificação Geral:      {'Excelente/Positiva' if mean_overall > 0.8 else ('Neutra' if mean_overall >= -0.8 else 'Negativa')}")

if __name__ == '__main__':
    analyze_ueq()
