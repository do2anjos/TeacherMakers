import os
import shutil
import zipfile
import subprocess
import win32com.client

BASE_DIR = r"c:\Users\Do2anjos\Desktop\T.I\TeacherMakers"
OUTPUT_DIR = os.path.join(BASE_DIR, "Dossie_de_Avaliacao_da_Qualidade")
ZIP_NAME = os.path.join(BASE_DIR, "Dossie_de_Avaliacao_da_Qualidade_TeacherMakers.zip")

# Mapping of markdown files to friendly document names
MD_CONVERSIONS = [
    ("Relatorio_Mestre _Avaliacao_Qualidade.md", "01_Plano_Mestre_de_Avaliacao"),
    ("Caderno_de_Evidencias_de_Qualidade.md", "05_Caderno_de_Evidencias_de_Qualidade"),
    ("Analises_Realizadas.md", "06_Analises_Realizadas"),
    ("Respostas_as_Perguntas_de_Avaliacao.md", "07_Respostas_as_Perguntas_de_Avaliacao"),
    ("Triangulacao_de_Resultados.md", "08_Triangulacao_de_Resultados"),
    ("Matriz_Consolidada_de_Problemas.md", "09_Matriz_Consolidada_de_Problemas"),
]

# Existing docx files to copy and convert to PDF
DOCX_FILES = [
    ("Fichas_de_Avaliacao.docx", "02_Perguntas_de_Avaliacao_Fichas"),
    ("protocolo de avaliações.docx", "04_Protocolo_de_Avaliacoes"),
]

# Excel matrices
EXCEL_FILES = [
    ("Matriz_de_Avaliacao.xlsx", "03_Matriz_de_Avaliacao.xlsx"),
    ("Matriz_Consolidada_de_Problemas.xlsx", "09_Matriz_Consolidada_de_Problemas.xlsx"),
]

# Raw survey spreadsheets
RAW_SHEETS = [
    "Avaliação de Primeiro Acesso e Aprendizagem Inicial (Learnability) — TeacherMakers (respostas).xlsx",
    "Ficha de Teste de Usabilidade — Tarefa Crítica (Módulo de Atividades) (respostas).xlsx",
    "Questionário de Experiência do Usuário (UEQ-S) (respostas).xlsx",
    "Checklist de Avaliação Técnica e Segurança da API — TeacherMakers (respostas).xlsx",
    "Ficha de Inspeção Visual e Percurso Cognitivo — TeacherMakers (respostas).xlsx",
    "Registro de Auditoria de Desempenho (Performance) — TeacherMakers (respostas).xlsx",
    "Avaliação de Conhecimento em Cultura Maker e Pensamento Computacional — Pré-teste (respostas).xlsx"
]

def main():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    raw_dir = os.path.join(OUTPUT_DIR, "Planilhas_de_Dados_Coletados")
    os.makedirs(raw_dir, exist_ok=True)

    print("1. Convertendo Markdown para DOCX via Pandoc...")
    for md_file, out_base in MD_CONVERSIONS:
        md_path = os.path.join(BASE_DIR, md_file)
        docx_path = os.path.join(OUTPUT_DIR, f"{out_base}.docx")
        if os.path.exists(md_path):
            print(f"  Convertendo: {md_file} -> {out_base}.docx")
            cmd = ["pandoc", "-s", md_path, "-o", docx_path]
            subprocess.run(cmd, check=True)
        else:
            print(f"  AVISO: {md_file} não encontrado!")

    print("\n2. Copiando DOCX existentes...")
    for orig_file, out_base in DOCX_FILES:
        orig_path = os.path.join(BASE_DIR, orig_file)
        dest_path = os.path.join(OUTPUT_DIR, f"{out_base}.docx")
        if os.path.exists(orig_path):
            print(f"  Copiando: {orig_file} -> {out_base}.docx")
            shutil.copy2(orig_path, dest_path)
        else:
            print(f"  AVISO: {orig_file} não encontrado!")

    print("\n3. Copiando Matrizes Excel...")
    for orig_file, out_name in EXCEL_FILES:
        orig_path = os.path.join(BASE_DIR, orig_file)
        dest_path = os.path.join(OUTPUT_DIR, out_name)
        if os.path.exists(orig_path):
            print(f"  Copiando: {orig_file} -> {out_name}")
            shutil.copy2(orig_path, dest_path)
        else:
            print(f"  AVISO: {orig_file} não encontrado!")

    print("\n4. Copiando planilhas de dados brutos coletados...")
    for sheet_file in RAW_SHEETS:
        orig_path = os.path.join(BASE_DIR, sheet_file)
        dest_path = os.path.join(raw_dir, sheet_file)
        if os.path.exists(orig_path):
            print(f"  Copiando: {sheet_file}")
            shutil.copy2(orig_path, dest_path)
        else:
            print(f"  AVISO: {sheet_file} não encontrado!")

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
