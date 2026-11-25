import argparse
import os
import shutil
import zipfile
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ANALISE_DIR = os.path.join(BASE_DIR, "analise")
ANALISE_DADOS_DIR = os.path.join(ANALISE_DIR, "dados")
ANALISE_ENTREGAVEIS_DIR = os.path.join(ANALISE_DIR, "entregaveis")
ANALISE_EVIDENCIAS_DIR = os.path.join(ANALISE_DIR, "evidencias")
ANALISE_INSTRUMENTOS_DIR = os.path.join(ANALISE_DIR, "instrumentos")
ANALISE_MATRIZES_DIR = os.path.join(ANALISE_DIR, "matrizes")
ANALISE_RELATORIOS_DIR = os.path.join(ANALISE_DIR, "relatorios")

OUTPUT_DIR = os.path.join(BASE_DIR, "Dossie_de_Avaliacao_da_Qualidade")
ZIP_NAME = os.path.join(ANALISE_ENTREGAVEIS_DIR, "Dossie_de_Avaliacao_da_Qualidade_TeacherMakers.zip")

# Mapping of markdown files (canonical paths under analise/) to friendly document names
MD_CONVERSIONS = [
    (os.path.join(ANALISE_RELATORIOS_DIR, "Relatorio_Mestre _Avaliacao_Qualidade.md"), "01_Plano_Mestre_de_Avaliacao"),
    (os.path.join(ANALISE_EVIDENCIAS_DIR, "Caderno_de_Evidencias_de_Qualidade.md"), "05_Caderno_de_Evidencias_de_Qualidade"),
    (os.path.join(ANALISE_RELATORIOS_DIR, "Analises_Realizadas.md"), "06_Analises_Realizadas"),
    (os.path.join(ANALISE_RELATORIOS_DIR, "Respostas_as_Perguntas_de_Avaliacao.md"), "07_Respostas_as_Perguntas_de_Avaliacao"),
    (os.path.join(ANALISE_RELATORIOS_DIR, "Triangulacao_de_Resultados.md"), "08_Triangulacao_de_Resultados"),
    (os.path.join(ANALISE_MATRIZES_DIR, "Matriz_Consolidada_de_Problemas.md"), "09_Matriz_Consolidada_de_Problemas"),
]

# Existing docx files to copy and convert to PDF
DOCX_FILES = [
    (os.path.join(ANALISE_INSTRUMENTOS_DIR, "Fichas_de_Avaliacao.docx"), "02_Perguntas_de_Avaliacao_Fichas"),
    (os.path.join(ANALISE_INSTRUMENTOS_DIR, "protocolo de avaliações.docx"), "04_Protocolo_de_Avaliacoes"),
]

# Excel matrices (from canonical analise/matrizes/)
EXCEL_FILES = [
    (os.path.join(ANALISE_MATRIZES_DIR, "Matriz_de_Avaliacao.xlsx"), "03_Matriz_de_Avaliacao.xlsx"),
    (os.path.join(ANALISE_MATRIZES_DIR, "Matriz_Consolidada_de_Problemas.xlsx"), "09_Matriz_Consolidada_de_Problemas.xlsx"),
]

# Raw survey spreadsheets (under analise/dados/)
RAW_SHEETS = [
    os.path.join(ANALISE_DADOS_DIR, "Avaliação de Primeiro Acesso e Aprendizagem Inicial (Learnability) — TeacherMakers (respostas).xlsx"),
    os.path.join(ANALISE_DADOS_DIR, "Ficha de Teste de Usabilidade — Tarefa Crítica (Módulo de Atividades) (respostas).xlsx"),
    os.path.join(ANALISE_DADOS_DIR, "Questionário de Experiência do Usuário (UEQ-S) (respostas).xlsx"),
    os.path.join(ANALISE_DADOS_DIR, "Checklist de Avaliação Técnica e Segurança da API — TeacherMakers (respostas).xlsx"),
    os.path.join(ANALISE_DADOS_DIR, "Ficha de Inspeção Visual e Percurso Cognitivo — TeacherMakers (respostas).xlsx"),
    os.path.join(ANALISE_DADOS_DIR, "Registro de Auditoria de Desempenho (Performance) — TeacherMakers (respostas).xlsx"),
    os.path.join(ANALISE_DADOS_DIR, "Avaliação de Conhecimento em Cultura Maker e Pensamento Computacional — Pré-teste (respostas).xlsx"),
]


def validate_inputs():
    """Verifica se todos os insumos esperados existem em analise/*."""
    expected = (
        [p for p, _ in MD_CONVERSIONS]
        + [p for p, _ in DOCX_FILES]
        + [p for p, _ in EXCEL_FILES]
        + list(RAW_SHEETS)
    )
    missing = [p for p in expected if not os.path.exists(p)]
    return expected, missing


def main():
    parser = argparse.ArgumentParser(description="Empacota o Dossiê de Avaliação da Qualidade.")
    parser.add_argument("--dry-run", action="store_true", help="Valida entradas em analise/* sem gerar arquivos.")
    args = parser.parse_args()

    expected, missing = validate_inputs()
    if args.dry_run:
        print(f"[DRY-RUN] Insumos verificados: {len(expected) - len(missing)}/{len(expected)} encontrados.")
        if missing:
            for m in missing:
                print(f"  [AUSENTE] {os.path.relpath(m, BASE_DIR)}")
            sys.exit(1)
        print(f"[DRY-RUN] Destino previsto: {os.path.relpath(ZIP_NAME, BASE_DIR)}")
        return

    if missing:
        print("ERRO: Insumos ausentes em analise/:")
        for m in missing:
            print(f"  - {os.path.relpath(m, BASE_DIR)}")
        sys.exit(1)

    import win32com.client

    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(ANALISE_ENTREGAVEIS_DIR, exist_ok=True)
    raw_dir = os.path.join(OUTPUT_DIR, "Planilhas_de_Dados_Coletados")
    os.makedirs(raw_dir, exist_ok=True)

    print("1. Convertendo Markdown para DOCX via Pandoc...")
    for md_path, out_base in MD_CONVERSIONS:
        docx_path = os.path.join(OUTPUT_DIR, f"{out_base}.docx")
        print(f"  Convertendo: {os.path.basename(md_path)} -> {out_base}.docx")
        cmd = ["pandoc", "-s", md_path, "-o", docx_path]
        subprocess.run(cmd, check=True)

    print("\n2. Copiando DOCX existentes...")
    for orig_path, out_base in DOCX_FILES:
        dest_path = os.path.join(OUTPUT_DIR, f"{out_base}.docx")
        print(f"  Copiando: {os.path.basename(orig_path)} -> {out_base}.docx")
        shutil.copy2(orig_path, dest_path)

    print("\n3. Copiando Matrizes Excel...")
    for orig_path, out_name in EXCEL_FILES:
        dest_path = os.path.join(OUTPUT_DIR, out_name)
        print(f"  Copiando: {os.path.basename(orig_path)} -> {out_name}")
        shutil.copy2(orig_path, dest_path)

    print("\n4. Copiando planilhas de dados brutos coletados...")
    for orig_path in RAW_SHEETS:
        sheet_file = os.path.basename(orig_path)
        dest_path = os.path.join(raw_dir, sheet_file)
        print(f"  Copiando: {sheet_file}")
        shutil.copy2(orig_path, dest_path)

    print("\n5. Convertendo DOCX para PDF via Word COM...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    try:
        for file_name in os.listdir(OUTPUT_DIR):
            if file_name.endswith(".docx"):
                in_docx = os.path.join(OUTPUT_DIR, file_name)
                out_pdf = os.path.join(OUTPUT_DIR, file_name[:-5] + ".pdf")
                print(f"  Gerando PDF: {file_name} -> {os.path.basename(out_pdf)}")
                doc = word.Documents.Open(in_docx)
                doc.SaveAs(out_pdf, FileFormat=17) # 17 = wdFormatPDF
                doc.Close()
    finally:
        word.Quit()

    print("\n6. Empacotando tudo em ZIP...")
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)
    
    with zipfile.ZipFile(ZIP_NAME, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(OUTPUT_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, BASE_DIR)
                zipf.write(file_path, arcname)
                print(f"  Zipado: {arcname}")

    print(f"\nSUCESSO TOTAL!")
    print(f"Arquivo ZIP criado em: {ZIP_NAME}")
    print(f"Tamanho do ZIP: {os.path.getsize(ZIP_NAME) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
