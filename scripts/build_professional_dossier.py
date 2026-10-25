"""
Dossiê de Avaliação da Qualidade — TeacherMakers
Script de geração profissional de documentos Word (.docx) e PDF (.pdf)
Atende rigorosamente a todos os critérios de qualidade visual, técnica e editorial:
- Sem emojis
- Tipografia profissional (Calibri)
- Azul-marinho principal (#1B3A5C) e cinza-escuro (#333333)
- Capas profissionais, cabeçalhos e rodapés com paginação
- Tabelas com cabeçalho repetido (tblHeader) e linhas protegidas contra quebra (cantSplit)
- Rastreabilidade total entre critérios, perguntas, protocolos, evidências, análises e problemas
- Conversão Word COM de alta fidelidade
- Empacotamento em ZIP estruturado por categorias
"""

import os
import shutil
import zipfile
import re
import subprocess
from docx import Document
from docx.shared import Pt, Cm, Inches, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import win32com.client

# ── Paths ──
BASE = r"c:\Users\Do2anjos\Desktop\T.I\TeacherMakers"
OUT = os.path.join(BASE, "Dossie_Avaliacao_Qualidade")
ZIP_PATH = os.path.join(BASE, "Dossie_Avaliacao_Qualidade.zip")

# ── Color palette ──
NAVY = RGBColor(0x1B, 0x3A, 0x5C)        # Azul-marinho principal (#1B3A5C)
DARK_GRAY = RGBColor(0x33, 0x33, 0x33)    # Texto do corpo (#333333)
MID_GRAY = RGBColor(0x66, 0x66, 0x66)     # Elementos secundários (#666666)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
ACCENT_BG = "1B3A5C"                       # Fundo azul-marinho de tabelas/destaques
ZEBRA_BG = "F2F6FA"                        # Fundo alternado sutil de tabelas
BORDER_COLOR = "D0D8E0"

FONT_BODY = "Calibri"
FONT_HEADING = "Calibri"


def setup_styles(doc):
    """Configura estilos tipográficos globais do documento."""
    normal = doc.styles['Normal']
    normal.font.name = FONT_BODY
    normal.font.size = Pt(11)
    normal.font.color.rgb = DARK_GRAY
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.15

    for level in range(1, 4):
        sname = f'Heading {level}'
        if sname in doc.styles:
            hs = doc.styles[sname]
            hs.font.name = FONT_HEADING
            hs.font.color.rgb = NAVY
            hs.font.bold = True
            if level == 1:
                hs.font.size = Pt(16)
                hs.paragraph_format.space_before = Pt(18)
                hs.paragraph_format.space_after = Pt(8)
            elif level == 2:
                hs.font.size = Pt(13)
                hs.paragraph_format.space_before = Pt(14)
                hs.paragraph_format.space_after = Pt(6)
            else:
                hs.font.size = Pt(11.5)
                hs.paragraph_format.space_before = Pt(10)
                hs.paragraph_format.space_after = Pt(4)


def set_cell_shading(cell, color_hex):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def set_margins(doc, top=2.5, bottom=2.0, left=2.5, right=2.0):
    for section in doc.sections:
        section.top_margin = Cm(top)
        section.bottom_margin = Cm(bottom)
        section.left_margin = Cm(left)
        section.right_margin = Cm(right)


def add_page_number_to_run(run):
    """Insere campo dinâmico de número de página do Word."""
    fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
    instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
    fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
    fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)


def add_header_footer(doc, doc_title, project_name="TeacherMakers"):
    """Adiciona cabeçalho com identificação e rodapé com paginação automática."""
    for section in doc.sections:
        header = section.header
        hp = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
        hp.text = f"{project_name}  |  {doc_title}"
        hp.style.font.name = FONT_BODY
        hp.style.font.size = Pt(8.5)
        hp.style.font.color.rgb = MID_GRAY
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT

        footer = section.footer
        fp = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
        fp.text = "Pagina "
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fp.style.font.name = FONT_BODY
        fp.style.font.size = Pt(8.5)
        fp.style.font.color.rgb = MID_GRAY
        add_page_number_to_run(fp.runs[0])


def add_cover(doc, title, subtitle="", project="TeacherMakers", version="v1.0", date="Outubro de 2026"):
    """Cria capa profissional e sóbria."""
    for _ in range(5):
        doc.add_paragraph("")

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_proj = p_proj.add_run(project.upper())
    run_proj.font.size = Pt(14)
    run_proj.font.color.rgb = MID_GRAY
    run_proj.font.name = FONT_HEADING
    run_proj.font.bold = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p_title.add_run(title.upper())
    run.font.size = Pt(24)
    run.font.color.rgb = NAVY
    run.font.bold = True
    run.font.name = FONT_HEADING

    if subtitle:
        p_sub = doc.add_paragraph()
        p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_s = p_sub.add_run(subtitle)
        run_s.font.size = Pt(12)
        run_s.font.color.rgb = MID_GRAY
        run_s.font.name = FONT_HEADING

    doc.add_paragraph("")

    # Linha divisória fina
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_l = p_line.add_run("________________________________________________________")
    run_l.font.color.rgb = NAVY
    run_l.font.size = Pt(9)

    doc.add_paragraph("")

    info_lines = [
        f"Sistema: {project}",
        f"Versao da Plataforma: {version}",
        "Ambiente de Avaliacao: Producao (Render) e Desenvolvimento Local",
        f"Periodo de Consolidacao: {date}",
        "Equipe de Avaliacao da Qualidade de Software"
    ]
    for line in info_lines:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(line)
        r.font.size = Pt(10)
        r.font.color.rgb = MID_GRAY
        r.font.name = FONT_BODY

    doc.add_page_break()


def style_table(table, col_widths=None):
    """Aplica o padrão visual formal do dossiê a qualquer tabela."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Cabeçalho da tabela
    if len(table.rows) > 0:
        header_row = table.rows[0]
        header_tr = header_row._tr.get_or_add_trPr()
        header_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

        for cell in header_row.cells:
            set_cell_shading(cell, ACCENT_BG)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in cell.paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in p.runs:
                    run.font.bold = True
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = WHITE
                    run.font.name = FONT_BODY

    # Linhas de dados
    for r_idx, row in enumerate(table.rows[1:]):
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

        for cell in row.cells:
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if r_idx % 2 == 1:
                set_cell_shading(cell, ZEBRA_BG)
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(9.5)
                    run.font.name = FONT_BODY
                    run.font.color.rgb = DARK_GRAY

    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                if i < len(row.cells):
                    row.cells[i].width = Cm(w)


def add_table(doc, headers, rows, col_widths=None):
    """Cria tabela formatada do zero."""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'

    for i, h in enumerate(headers):
        table.rows[0].cells[i].text = h

    for r_idx, row_data in enumerate(rows):
        for c_idx, val in enumerate(row_data):
            table.rows[r_idx + 1].cells[c_idx].text = str(val) if val is not None else ""

    style_table(table, col_widths)
    doc.add_paragraph("")
    return table


def clean_markdown_text(text):
    """Remove emojis, normaliza símbolos matemáticos, remove links file:/// e limpa artefatos."""
    # Substituições textuais para símbolos de status comuns
    text = text.replace("✅", "[Conforme]")
    text = text.replace("❌", "[Nao Conforme]")
    text = text.replace("⚠️", "[Atencao]")
    text = text.replace("🔴", "[Critica]")
    text = text.replace("🟡", "[Alta]")
    text = text.replace("🟢", "[Media]")
    text = text.replace("⚪", "[Baixa]")
    text = text.replace("📋", "")
    text = text.replace("🗺️", "")
    text = text.replace("⏱️", "")
    text = text.replace("🚦", "")

    # Remover padrão genérico de emojis remanescentes
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001f900-\U0001f9ff"
        "\U00010000-\U0010ffff"
        "\u2600-\u26FF"
        "\u2700-\u27BF"
        "\u23CF-\u23F3"
        "\u23E9-\u23F3"
        "\u2934-\u2935"
        "\u25AA-\u25FE"
        "\u2B05-\u2B07"
        "\u2B1B-\u2B1C"
        "\u3030\u303D"
        "\u3297\u3299"
        "\u200d\ufe0f"
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)

    # Remover links absolutos file:///
    text = re.sub(r'\[([^\]]+)\]\(file:///[^)]+\)', r'\1', text)

    # Normalizar símbolos LaTeX/Markdown
    text = text.replace('$\\ge$', '>=').replace('\\ge', '>=')
    text = text.replace('$\\le$', '<=').replace('\\le', '<=')
    text = text.replace('$\\times$', 'x').replace('\\times', 'x')
    text = text.replace('$\\bar{x}$', 'x_medio')
    text = text.replace('\\Longrightarrow', '=>')
    text = text.replace('\\longrightarrow', '->')
    text = text.replace('\\iff', '<=>')
    text = text.replace('**', '')

    return text


def md_to_docx_via_pandoc(md_filename, title, subtitle=""):
    """Converte arquivo Markdown para DOCX via Pandoc e aplica padrão formal."""
    md_path = os.path.join(BASE, md_filename)
    if not os.path.exists(md_path):
        print(f"  [AVISO] Arquivo {md_filename} nao encontrado.")
        return None

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    cleaned_content = clean_markdown_text(content)

    temp_md = os.path.join(BASE, "_temp_clean.md")
    with open(temp_md, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)

    temp_docx = os.path.join(BASE, "_temp_output.docx")
    subprocess.run(["pandoc", "-s", temp_md, "-o", temp_docx], check=True, capture_output=True)

    doc = Document(temp_docx)
    setup_styles(doc)
    set_margins(doc)
    add_header_footer(doc, title)

    # Formatar todas as tabelas geradas pelo Pandoc
    for table in doc.tables:
        style_table(table)

    # Adicionar capa no início se o documento tiver mais de 2 páginas
    if len(doc.paragraphs) > 10:
        p0 = doc.paragraphs[0]
        # Inserir espaço para capa
        for _ in range(4):
            p0.insert_paragraph_before("")
        p_proj = p0.insert_paragraph_before("TEACHERMAKERS")
        p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_p = p_proj.runs[0]
        run_p.font.name = FONT_HEADING
        run_p.font.size = Pt(13)
        run_p.font.color.rgb = MID_GRAY
        run_p.font.bold = True

        p_tit = p0.insert_paragraph_before(title.upper())
        p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_t = p_tit.runs[0]
        run_t.font.name = FONT_HEADING
        run_t.font.size = Pt(22)
        run_t.font.color.rgb = NAVY
        run_t.font.bold = True

        if subtitle:
            p_sub = p0.insert_paragraph_before(subtitle)
            p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run_s = p_sub.runs[0]
            run_s.font.name = FONT_HEADING
            run_s.font.size = Pt(12)
            run_s.font.color.rgb = MID_GRAY

        p_line = p0.insert_paragraph_before("________________________________________________________")
        p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_line.runs[0].font.color.rgb = NAVY

        for info in ["Plataforma: TeacherMakers (v1.0)", "Data: Outubro de 2026", "Equipe de Avaliacao da Qualidade de Software"]:
            pi = p0.insert_paragraph_before(info)
            pi.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pi.runs[0].font.size = Pt(9.5)
            pi.runs[0].font.color.rgb = MID_GRAY

        p_brk = p0.insert_paragraph_before()
        p_brk.add_run().add_break(docx_enum_page_break())

    # Remover arquivos temporários
    if os.path.exists(temp_md):
        os.remove(temp_md)
    if os.path.exists(temp_docx):
        os.remove(temp_docx)

    return doc


def docx_enum_page_break():
    from docx.enum.text import WD_BREAK
    return WD_BREAK.PAGE


def docx_to_pdf(docx_path, pdf_path, word_app):
    """Converte DOCX para PDF nativo com alta fidelidade via Microsoft Word COM."""
    doc = word_app.Documents.Open(os.path.abspath(docx_path))
    # FileFormat=17 é wdFormatPDF
    doc.SaveAs(os.path.abspath(pdf_path), FileFormat=17)
    doc.Close()


# ═══════════════════════════════════════════════════
# CONSTRUTORES DE DOCUMENTOS ESPECÍFICOS
# ═══════════════════════════════════════════════════

def build_leiame():
    """Gera o documento 00_LEIA-ME."""
    doc = Document()
    setup_styles(doc)
    set_margins(doc)
    add_cover(doc, "Guia de Leitura e Organizacao", "Dossie de Avaliacao da Qualidade — TeacherMakers v1.0")
    add_header_footer(doc, "LEIA-ME — Guia de Leitura")

    doc.add_heading("1. Organizacao Geral do Material", level=1)
    doc.add_paragraph(
        "Este pacote reune o conjunto completo de artefatos tecnicos e pedagogicos produzidos durante "
        "o ciclo de avaliacao da qualidade do software TeacherMakers (v1.0 / Baseline). Os documentos "
        "foram consolidados, padronizados editorialmente e estruturados em pastas numeradas para "
        "facilitar a consulta sequencial e garantir total rastreabilidade entre planejamento, execucao, "
        "evidencias, analises e plano de acao."
    )

    doc.add_heading("2. Estrutura de Pastas e Conteudo", level=1)
    folders = [
        ["00_LEIA-ME", "Guia de navegacao, instrucoes de leitura, relacao de documentos e limitacoes metodologicas conhecidas."],
        ["01_DOSSIE_PRINCIPAL", "Dossie de Avaliacao da Qualidade: documento central integrado contendo a visao completa do trabalho."],
        ["02_PLANEJAMENTO_E_CRITERIOS", "Plano Mestre de Avaliacao, Fichas de Perguntas de Avaliacao e Matriz de Avaliacao (DOCX/XLSX)."],
        ["03_EXECUCAO_E_ANALISES", "Protocolos de aplicacao, Relatorio de Analises Realizadas, Respostas as Perguntas e Triangulacao."],
        ["04_EVIDENCIAS_E_PROBLEMAS", "Caderno de Evidencias de Qualidade e Matriz Consolidada de Problemas com Plano de Acao (DOCX/XLSX)."],
        ["05_FONTES_E_REFERENCIAS", "Fontes originais (planilhas de respostas brutas em XLSX) e Matriz de Rastreabilidade e Referencias."],
    ]
    add_table(doc, ["Diretorio", "Descricao e Finalidade"], folders, [6, 12])

    doc.add_heading("3. Sequencia Recomendada de Leitura", level=1)
    steps = [
        "Passo 1 — 01_DOSSIE_PRINCIPAL/Dossie_Avaliacao_da_Qualidade: Leitura recomendada como ponto de partida para obter a visao holistica, o sumario executivo e as conclusoes gerais.",
        "Passo 2 — 02_PLANEJAMENTO_E_CRITERIOS/Plano_Mestre_de_Avaliacao: Compreensao do enquadramento teorico, perguntas centrais, dimensoes e criterios de sucesso.",
        "Passo 3 — 02_PLANEJAMENTO_E_CRITERIOS/Matriz_de_Avaliacao: Visao tabular do alinhamento entre perguntas, metodos e status de atendimento.",
        "Passo 4 — 03_EXECUCAO_E_ANALISES/Protocolos: Detalhamento dos procedimentos passo a passo aplicados nas sessoes de teste.",
        "Passo 5 — 03_EXECUCAO_E_ANALISES/Analises_Realizadas: Processamento estatistico e qualitativo dos dados brutos coletados.",
        "Passo 6 — 03_EXECUCAO_E_ANALISES/Respostas_as_Perguntas_de_Avaliacao: Veredictos tecnicos fundamentados para cada uma das questoes investigativas.",
        "Passo 7 — 03_EXECUCAO_E_ANALISES/Triangulacao: Confronto convergente entre usabilidade observada, inspecao estrutural e percepcao subjetiva (UEQ-S).",
        "Passo 8 — 04_EVIDENCIAS_E_PROBLEMAS/Caderno_de_Evidencias_de_Qualidade: Catalogo detalhado de todos os registros brutos organizados por dimensao.",
        "Passo 9 — 04_EVIDENCIAS_E_PROBLEMAS/Matriz_Consolidada_de_Problemas: Levantamento exaustivo de vulnerabilidades e plano de correcao priorizado.",
        "Passo 10 — 05_FONTES_E_REFERENCIAS/Referencias_e_Rastreabilidade: Conferencia das planilhas originais e fundamentacao bibliografica."
    ]
    for s in steps:
        doc.add_paragraph(s, style='List Bullet')

    doc.add_heading("4. Limitacoes Metodologicas e Pendencias Documentadas", level=1)
    doc.add_paragraph(
        "Em cumprimento ao rigor cientifico e as diretrizes de avaliacao, registram-se com total "
        "transparencia as seguintes limitacoes encontradas nos dados coletados:"
    )
    lims = [
        "Avaliacao de Usabilidade (N=2): Amostra reduzida em relacao ao planejamento inicial (5 a 8 participantes). Os resultados sao altamente qualitativos e indicativos.",
        "Avaliacao Educacional (Pre/Pos-teste): Coletou-se apenas 1 submissao referente ao pos-teste (nota 9,0/10), sem o correspondente pre-teste pareado. Dessa forma, foi impossivel aplicar o Teste T de Student para calculo de ganho relativo.",
        "Auditoria de Performance: Registro unico via Lighthouse/DevTools em conexao simulada 4G, registrando Performance 84/100 e Acessibilidade 50/100.",
        "Evidencias Visuais: Nao foram registradas capturas de tela durante as sessoes com usuarios. As analises heuristicas basearam-se no walkthrough estruturado."
    ]
    for lim in lims:
        doc.add_paragraph(lim, style='List Bullet')

    doc.add_heading("5. Formatos de Arquivo", level=1)
    doc.add_paragraph(
        "Todos os documentos tecnicos estao disponibilizados em formatos duplos: Word (.docx) para "
        "edicao e evolucao continua, e PDF (.pdf) para leitura, impressao e apresentacao formal. "
        "As matrizes de dados e planilhas de respostas estao adicionalmente preservadas em formato Excel (.xlsx)."
    )

    return doc


def build_dossie_principal():
    """Gera o documento central 01_DOSSIE_PRINCIPAL/Dossie_Avaliacao_da_Qualidade."""
    doc = Document()
    setup_styles(doc)
    set_margins(doc)
    add_cover(
        doc,
        "Dossie de Avaliacao\nda Qualidade",
        "Plataforma TeacherMakers — Formacao Docente em Cultura Maker e Pensamento Computacional"
    )
    add_header_footer(doc, "Dossie de Avaliacao da Qualidade")

    doc.add_heading("1. Apresentacao e Contextualizacao", level=1)
    doc.add_paragraph(
        "O TeacherMakers e uma plataforma web voltada a formacao continuada de professores da educacao basica, "
        "focada na integracao pedagogica entre Cultura Maker e Pensamento Computacional, em estrita consonancia "
        "com a Base Nacional Comum Curricular (BNCC — Computacao, 2018). O sistema estrutura trilhas formativas "
        "que combinam videoaulas conceituais, quizzes formativos e atividades praticas aplicadas (\"mao na massa\"). "
        "O diferencial estrutural da plataforma reside na exigencia de evidencias fisicas reais: para alcancar a "
        "certificacao digital, o professor cursista deve realizar a pratica em sala de aula ou oficina, relatar a "
        "experiencia em um diario de bordo reflexivo e enviar uma fotografia comprobatoria."
    )
    doc.add_paragraph(
        "A arquitetura tecnologica do TeacherMakers e fundamentada em um backend Node.js (Express), banco de "
        "dados SQLite embutido, autenticacao stateless com JSON Web Tokens (JWT) e hashing bcrypt, e upload de "
        "arquivos multipart via Multer. O frontend consiste em uma aplicacao web responsiva servida diretamente "
        "ou via plataforma em nuvem (Render)."
    )

    doc.add_heading("2. Objetivos da Avaliacao de Qualidade", level=1)
    doc.add_paragraph(
        "A avaliacao de qualidade teve como proposito central investigar, com base em evidencias empiricas e "
        "inspecoes especializadas, se o TeacherMakers cumpre sua funcao educacional e atende a requisitos "
        "rigorosos de usabilidade, seguranca funcional, facilidade de aprendizado (learnability), ergonomia e "
        "desempenho tecnico. O trabalho foi desenhado para identificar barreiras criticas antes da liberacao do "
        "sistema para redes de ensino publicas e privadas."
    )

    doc.add_heading("3. Metodologia e Cadeia de Rastreabilidade", level=1)
    doc.add_paragraph(
        "A avaliacao foi conduzida de acordo com uma cadeia logica rigorosa: Sistema > Proposito > Funcionalidades "
        "> Usuarios > Riscos Tecnicos e Pedagogicos > Perguntas de Avaliacao (PA-01 a PA-07) > Metodos e Protocolos "
        "> Evidencias (EV-01 a EV-15) > Analises Estatistico-Qualitativas > Matriz de Problemas (PB-01 a PB-08). "
        "Essa articulacao garante que nenhuma conclusao seja tomada sem respaldo direto em dados coletados."
    )

    doc.add_heading("4. Sintese das Dimensoes Avaliadas e Criterios", level=1)
    dims = [
        ["PA-01", "Qualidade Funcional / Seguranca da API", "Injecao de requisicoes anomalas (Postman/cURL)", "100% de rejeicao de fraudes com HTTP 400/403"],
        ["PA-02", "Usabilidade Heuristica / Inspecao Visual", "Percurso Cognitivo com 2 especialistas em IHC", "Ausencia de problemas de severidade catastrofica"],
        ["PA-03", "Facilidade de Aprendizado (Learnability)", "Sessao de 1o acesso com 3 professores cursistas", "Minimo de 80% de autonomia e acerto conceitual"],
        ["PA-04", "Experiencia do Usuario (UX)", "Questionario padronizado UEQ-S (8 itens, N=9)", "Escores pragmatico e hedonico superiores a +0,80"],
        ["PA-05", "Qualidade Pedagogica e Conteudo", "Pos-teste conceitual (10 questoes)", "Aproveitamento igual ou superior a 80%"],
        ["PA-06", "Acessibilidade e Desempenho", "Auditoria Google Lighthouse e navegacao por teclado", "Pontuacao >= 90 em Performance e Acessibilidade (WCAG)"],
        ["PA-07", "Eficacia da Aprendizagem", "Delineamento pre/pos-teste pareado", "Ganho estatisticamente significativo (p < 0,05, Teste T)"],
    ]
    add_table(doc, ["ID", "Dimensao de Qualidade", "Metodologia / Instrumento", "Criterio de Sucesso Definido"], dims, [2, 4.5, 5.5, 6])

    doc.add_heading("5. Resumo Executivo dos Resultados e Veredictos", level=1)
    res_data = [
        ["PA-01", "Qualidade Funcional", "2 avaliadores tecnicos", "100% de bloqueio a fraudes; falha de persistencia parcial no banco em v1.0", "Parcialmente Atendido"],
        ["PA-02", "Usabilidade Heuristica", "2 avaliadores IHC", "CTA principal evidente; quebra severa de layout em tablets", "Atendido com Ressalvas"],
        ["PA-03", "Learnability", "3 professores", "100% de autonomia; 100% de compreensao imediata do proposito", "Totalmente Atendido"],
        ["PA-04", "Experiencia (UEQ-S)", "9 respondentes", "Qualidade Pragmatica = +1,19 (Excelente); Qualidade Hedonica = +0,31 (Neutra)", "Atendido na Pragmatica"],
        ["PA-05", "Qualidade Pedagogica", "1 cursista", "Nota 9,0/10,0 (90% de acerto nos pilares do Pensamento Computacional)", "Atendido no Conteudo"],
        ["PA-06", "Acessibilidade / Perf.", "1 auditoria Lighthouse", "Performance 84/100 (FCP 0,5s); Acessibilidade 50/100 (Contraste e ARIA)", "Nao Atendido em Acess."],
        ["PA-07", "Aprendizagem Efetiva", "1 cursista (pos-teste)", "Apenas 1 resposta sem pre-teste pareado; calculo inferencial inviavel", "Inconclusivo (Metodologico)"],
    ]
    add_table(doc, ["ID", "Dimensao", "Amostra / Fonte", "Resultado Sintetico", "Veredicto Consolidado"], res_data, [1.8, 3.5, 3.2, 5.5, 4])

    doc.add_heading("6. Respostas Consolidadas as Perguntas de Avaliacao", level=1)
    answers = [
        ["PA-01", "As travas pedagogicas impedem avanco indevido e blindam a API?", "Parcialmente Atendido",
         "A API bloqueia com sucesso payloads sem token JWT, uploads sem arquivo e submissoes com texto insuficiente (HTTP 400/403). Contudo, o avaliador Diedson Kenned comprovou que requisicoes com erro de validacao geraram registros orfaos no banco em ambiente local devido a falta de transacoes atomicas."],
        ["PA-02", "A interface apresenta falhas visuais ou ergonomicas que confundem o professor?", "Atendido com Ressalvas",
         "A localizacao do botao de submissao e evidente (nota 4,0/5). Contudo, ha excesso de elementos visuais no dashboard e quebra acentuada de interface em tablets (sessao de usabilidade demorou 30 min em tablet contra 1 min no desktop)."],
        ["PA-03", "Professores em primeiro acesso compreendem como iniciar sua formacao?", "Totalmente Atendido",
         "100% dos participantes (AC23, p01, DK29) identificaram com precisao a finalidade da plataforma nos primeiros segundos e iniciaram o percurso sem necessidade de suporte externo."],
        ["PA-04", "Como os docentes percebem a experiencia global de uso da plataforma?", "Atendido na Pragmatica",
         "A Qualidade Pragmatica alcancou escore elevado (+1,19), demonstrando facilidade e clareza de uso. A Qualidade Hedonica registrou +0,31 (zona de neutralidade), indicando percepcao convencional e baixa novidade."],
        ["PA-05", "Os conteudos e mecanismos de feedback estimulam a reflexao docente?", "Atendido no Conteudo",
         "O cursista demonstrou dominio solido dos conceitos (nota 9,0/10). No entanto, o feedback de sucesso de envio de tarefas e excessivamente sutil (toast temporario), gerando inseguranca se o material foi transmitido."],
        ["PA-06", "Existem barreiras severas de acessibilidade ou lentidao tecnica?", "Nao Atendido em Acessibilidade",
         "O carregamento tecnico e eficiente (score 84/100, FCP 0,5s, LCP 2,0s). Todavia, a acessibilidade apresentou score critico de 50/100, violando diretrizes da WCAG 2.1 AA em contraste de cor e navegacao exclusiva por teclado."],
        ["PA-07", "Ha evidencia empirica de ganho cognitivo antes e apos o curso?", "Inconclusivo Estatisticamente",
         "O cursista obteve excelente aproveitamento no pos-teste (90%). No entanto, a ausencia da coleta do pre-teste pareado inviabilizou a execucao do Teste T de Student para validacao inferencial de aprendizagem."],
    ]
    add_table(doc, ["ID", "Pergunta Investigativa", "Veredicto", "Fundamentacao Tecnica e Evidencias"], answers, [1.8, 4.2, 3.5, 8.5])

    doc.add_heading("7. Triangulacao Metodologica dos Achados", level=1)
    doc.add_paragraph(
        "A triangulacao cruzou tres vertentes metodologicas independentes: 1) o comportamento empirico dos "
        "usuarios em testes gravados; 2) o julgamento ergonomico de especialistas via Percurso Cognitivo; e "
        "3) a percepcao psicometrica consolidada no questionario UEQ-S. Essa abordagem permitiu identificar "
        "as seguintes convergencias:"
    )
    doc.add_heading("Ponto 1: Descoberta e inicio da trilha formativa", level=2)
    doc.add_paragraph(
        "No teste de usabilidade, os participantes demoraram a identificar por onde iniciar, hesitando na pagina "
        "inicial. A inspecao visual explicou a causa: ha sobrecarga visual de cards e falta de destaque no Modulo 1. "
        "No UEQ-S, o item Confuso vs. Claro obteve media de +1,11, demonstrando que, embora a interface seja "
        "compreensivel, a hierarquia inicial gera atrito desnecessario."
    )
    doc.add_heading("Ponto 2: Fluxo de envio de atividades e feedback de conclusao", level=2)
    doc.add_paragraph(
        "No teste com o participante lm, o upload do arquivo foi concluido com sucesso, porem o cursista "
        "permaneceu na tela com duvidas se a atividade havia sido gravada. A inspecao visual revelou que a mensagem "
        "de retorno e um toast discreto que desaparece rapidamente. No UEQ-S, o par Obstrutivo vs. Apoiador "
        "apresentou desvio padrao elevado (DP = 1,54), refletindo a dispersao gerada pela sutileza do feedback."
    )
    doc.add_heading("Ponto 3: Responsividade em dispositivos intermediarios (tablets)", level=2)
    doc.add_paragraph(
        "No teste de usabilidade, o participante operando via tablet levou 30 minutos para concluir a tarefa e "
        "registrou 2 erros de clique, enquanto o usuario de desktop executou em 1 minuto sem erros. A inspecao visual "
        "diagnosticou desalinhamento de componentes e corte de textos em telas de 768px a 1024px. Essa barreira "
        "impactou diretamente a escala Hedonica do UEQ-S (+0,31)."
    )

    doc.add_heading("8. Matriz Consolidada de Problemas e Plano de Acao", level=1)
    doc.add_paragraph(
        "Todos os problemas identificados foram unificados, classificados em quatro niveis de severidade "
        "(Critica, Alta, Media, Baixa) e associados a prazos de resolucao (P1 Imediata, P2 Curto Prazo, "
        "P3 Medio Prazo, P4 Evolutiva/Metodologica):"
    )
    probs = [
        ["PB-01", "Gravacao de dados parciais no banco apos erro de validacao", "Critica", "P1 (Imediata)", "Implementar transacoes atomicas no SQLite com ROLLBACK automatico"],
        ["PB-02", "Baixo indice de acessibilidade digital (Score 50/100)", "Alta", "P2 (Curto prazo)", "Adequar contraste para 4.5:1, incluir aria-label e foco por teclado"],
        ["PB-03", "Desalinhamento e quebra de usabilidade em telas de tablet", "Alta", "P2 (Curto prazo)", "Adicionar media queries para 768px–1024px e botoes de toque minimo 48px"],
        ["PB-04", "Sobrecarga de estimulos concorrentes no dashboard inicial", "Media", "P3 (Medio prazo)", "Inserir badge visual de destaque no proximo modulo a ser cursado"],
        ["PB-05", "Feedback de envio de atividades excessivamente sutil e efemero", "Media", "P3 (Medio prazo)", "Substituir toast por modal com protocolo de recebimento e status salvo"],
        ["PB-06", "Modulo introdutorio constando como concluido no primeiro login", "Media", "P3 (Medio prazo)", "Corrigir inicializacao do progresso do usuario no cadastro"],
        ["PB-07", "Percepcao estetica convencional e neutra (QH = +0,31)", "Baixa", "P4 (Evolutivo)", "Introduzir elementos visuais de aprendizagem criativa e microinteracoes"],
        ["PB-08", "Ausencia de pre-teste pareado para validacao inferencial", "Baixa", "P4 (Metodologico)", "Tornar o pre-teste etapa obrigatoria no primeiro acesso a plataforma"],
    ]
    add_table(doc, ["ID", "Descricao do Problema", "Severidade", "Prioridade", "Recomendacao Tecnica de Solucao"], probs, [1.8, 5.5, 2.2, 2.8, 5.7])

    doc.add_heading("9. Recomendacoes Priorizadas e Encaminhamentos", level=1)
    recs = [
        "Correcao Imediata de Transacionalidade (PB-01): O endpoint de envio de atividades (/api/submissions) deve envelopar a persistencia do arquivo e dos registros no banco dentro de transacao atomica. Requisicoes que falharem na validacao nao podem deixar rastros de dados no banco.",
        "Conformidade com Diretrizes de Acessibilidade (PB-02): Revisar as folhas de estilo para atender aos criterios da WCAG 2.1 nivel AA, garantindo que usuarios com baixa visao ou com limitacoes motoras consigam concluir as trilhas.",
        "Refinamento da Responsividade em Tablets (PB-03): Como professores utilizam frequentemente dispositivos moveis fornecidos por politicas publicas de educacao, a experiencia em tablet deve receber estilizacao dedicada.",
        "Evolucao do Mecanismo de Pre-teste (PB-08): Incorporar a aplicacao do instrumento de conhecimento previo como pre-requisito do modulo introdutorio, viabilizando futuros estudos de impacto pedagogico com amostras robustas.",
        "Elevacao da Qualidade Hedonica (PB-07): Implementar pequenas recompensas visuais (como selos e barras de progresso animadas) para dinamizar a experiencia do cursista."
    ]
    for r in recs:
        doc.add_paragraph(r, style='List Bullet')

    doc.add_heading("10. Conclusao e Parecer Tecnico", level=1)
    doc.add_paragraph(
        "A plataforma TeacherMakers apresenta solida proposta pedagogica e arquitetura base estavel, com "
        "tempos de resposta rapidos e excelente facilidade de compreensao inicial pelos professores cursistas. "
        "A exigencia de praticas reais com diario de bordo e comprovacao fotografica e um diferencial pedagogico "
        "valioso, alinhado aos principios da Cultura Maker."
    )
    doc.add_paragraph(
        "Sob a otica tecnica e de usabilidade, a plataforma classifica-se como APROVADA SOB CONDICIONANTES TECNICAS, "
        "estando apta para operacao em ambiente piloto controlado. A liberacao para escalabilidade aberta "
        "condiciona-se a correcao da transacionalidade da API (PB-01) e a adequacao dos criterios basicos de "
        "acessibilidade digital (PB-02)."
    )

    doc.add_heading("11. Referencias Bibliograficas", level=1)
    refs = [
        "ALMEIDA, K. K. S.; LINO, A. C. L.; VARGAS, S. R.; PINTO, V. P.; LACIO, L. M. S. Curriculo e Cidadania: Preparando Estudantes para o Seculo XXI. Missioneira, v. 27, n. 8, p. 309-320, 2025.",
        "ARAUJO, D.; RODRIGUES, A.; SILVA, C.; SOARES, L. O ensino de computacao na educacao basica apoiado por problemas: Praticas de licenciandos em computacao. In: Workshop sobre Educacao em Computacao (WEI), SBC, p. 130-139, 2015.",
        "BARIONI, M. C. N.; FARIA, E. R.; LIMA, M. A. V. Relato de experiencia sobre o ensino de Pensamento Computacional para professores da educacao basica. In: Simposio Brasileiro de Informatica na Educacao (SBIE), SBC, 2022.",
        "BLIKSTEIN, P. Digital Fabrication and 'Making' in Education: The Democratization of Invention. FabLabs: Of Machines, Makers and Inventors, 2013.",
        "BRASIL. Ministerio da Educacao. Base Nacional Comum Curricular (BNCC): Normas sobre Computacao na Educacao Basica. Brasilia: MEC, 2018.",
        "DENZIN, N. K. The Research Act: A Theoretical Introduction to Sociological Methods. New York: Routledge, 2012.",
        "LAUGWITZ, B.; HELD, T.; SCHREPP, M. Construction and evaluation of a user experience questionnaire. In: Symposium of the Austrian HCI and Usability Engineering Group. Berlin: Springer, 2008. p. 63-76.",
        "NIELSEN, J. Usability Engineering. Boston: Academic Press, 1993.",
        "PAPERT, S. Mindstorms: Children, Computers, and Powerful Ideas. New York: Basic Books, 1980.",
        "RESNICK, M. Lifelong Kindergarten: Cultivating Creativity through Projects, Passion, Peerrs, and Play. MIT Press, 2017.",
        "SCHREPP, M.; HINDERKS, A.; THOMASCHEWSKI, J. Design and Evaluation of a Short Version of the User Experience Questionnaire (UEQ-S). IJIMAI, v. 4, n. 6, p. 103-108, 2017.",
        "W3C. Web Content Accessibility Guidelines (WCAG) 2.1. World Wide Web Consortium Recommendation, 2018.",
        "WING, J. M. Computational thinking. Communications of the ACM, v. 49, n. 3, p. 33-35, 2006."
    ]
    for ref in refs:
        doc.add_paragraph(ref, style='List Number')

    return doc


def build_matriz_avaliacao_doc():
    """Gera o documento formal da Matriz de Avaliação."""
    doc = Document()
    setup_styles(doc)
    set_margins(doc)
    add_cover(doc, "Matriz de Avaliacao da Qualidade", "Mapeamento Completo de Dimensoes, Criterios, Metodos e Resultados")
    add_header_footer(doc, "Matriz de Avaliacao")

    doc.add_heading("1. Apresentacao da Matriz de Avaliacao", level=1)
    doc.add_paragraph(
        "A Matriz de Avaliacao estabelece o alinhamento metodologico e a rastreabilidade entre as perguntas "
        "investigativas formuladas no planejamento, as dimensoes de qualidade do software, os criterios "
        "especificos de aprovacao, os metodos e instrumentos de inspecao e os veredictos alcancados a partir "
        "das evidencias coletadas. Este documento sintetiza o referencial que orientou todos os testes realizados."
    )

    doc.add_heading("2. Escala de Julgamento dos Veredictos", level=1)
    scale = [
        ["Totalmente Atendido", "O criterio foi atendido integralmente e comprovado por evidencias empiricas sem divergencias."],
        ["Atendido na Pragmatica / no Conteudo", "O aspecto essencial foi satisfeito com sucesso, embora dimensoes secundarias tenham ficado na neutralidade."],
        ["Atendido com Ressalvas", "A funcionalidade opera, porem foram identificadas barreiras ergonomicas ou visuais que geram atrito moderado."],
        ["Parcialmente Atendido", "Houve cumprimento na maioria das verificacoes, mas identificou-se falha pontual de severidade critica."],
        ["Nao Atendido", "A dimensao avaliada violou criterios normativos essenciais estabelecidos previamente no planejamento."],
        ["Inconclusivo (Metodologico)", "A amostra coletada foi insuficiente para aplicacao do teste estatistico inferencial planejado."],
    ]
    add_table(doc, ["Status de Atendimento", "Definicao e Criterio de Enquadramento"], scale, [6, 12])

    doc.add_heading("3. Matriz Consolidada de Avaliacao", level=1)
    matrix_rows = [
        ["PA-01", "Qualidade Funcional / Seguranca da API", "Travas pedagogicas e blindagem de requisicoes anomalas",
         "Injecao de payloads invalidos (Postman)", "100% de recusa de fraudes; registros parciais no banco local", "Parcialmente Atendido", "EV-01, EV-02", "PB-01"],
        ["PA-02", "Usabilidade Heuristica", "Interface livre de erros ergonomicos que confundam o cursista",
         "Percurso Cognitivo com especialistas", "CTA evidente; incoerencia severa em telas de tablet", "Atendido com Ressalvas", "EV-05, EV-06", "PB-02, PB-03"],
        ["PA-03", "Learnability (Facilidade de Aprendizado)", "Compreensao imediata do proposito no 1o acesso",
         "Questionario de 1o acesso (N=3)", "100% de compreensao e autonomia na navegacao inicial", "Totalmente Atendido", "EV-03", "Nenhum"],
        ["PA-04", "Experiencia do Usuario (UX)", "Satisfacao global e percepcao de valor do professor",
         "Questionario padronizado UEQ-S (N=9)", "Qualidade Pragmatica +1,19; Qualidade Hedonica +0,31", "Atendido na Pragmatica", "EV-04", "PB-07"],
        ["PA-05", "Qualidade Pedagogica", "Coerencia teorica com Pensamento Computacional",
         "Pos-teste conceitual (N=1)", "Nota 9,0/10,0; feedback de envio sutil demais", "Atendido no Conteudo", "EV-08, EV-09", "PB-05"],
        ["PA-06", "Acessibilidade e Desempenho", "Conformidade tecnica e ausencia de barreiras de acesso",
         "Lighthouse e navegacao por teclado", "Performance 84/100; Acessibilidade 50/100 (critica)", "Nao Atendido", "EV-07", "PB-02"],
        ["PA-07", "Eficacia da Aprendizagem", "Comprovacao de evolucao conceitual pre/pos-teste",
         "Pre/pos-teste pareado (Teste T)", "Apenas 1 pos-teste coletado; sem pre-teste pareado", "Inconclusivo", "EV-08", "PB-08"],
    ]
    add_table(doc, ["ID", "Dimensao", "Criterio de Avaliacao", "Metodo / Instrumento", "Resultado Empirico", "Veredicto", "Evidencias", "Problema"], matrix_rows, [1.5, 2.5, 3.0, 2.5, 3.5, 2.0, 1.5, 1.5])

    doc.add_heading("4. Rastreabilidade com a Planilha Eletronica", level=1)
    doc.add_paragraph(
        "A versao em formato de planilha de calculo, contendo as formulas de pontuacao e os registros "
        "brutos de cada criterio, encontra-se arquivada no mesmo diretorio sob a denominacao Matriz_de_Avaliacao.xlsx."
    )

    return doc


def build_referencias_e_rastreabilidade_doc():
    """Gera o documento 05_FONTES_E_REFERENCIAS/Referencias_e_Rastreabilidade."""
    doc = Document()
    setup_styles(doc)
    set_margins(doc)
    add_cover(doc, "Referencias e Rastreabilidade", "Fontes Primarias, Mapeamento Cruzado de Evidencias e Referencial Normativo")
    add_header_footer(doc, "Referencias e Rastreabilidade")

    doc.add_heading("1. Mapeamento Geral de Rastreabilidade", level=1)
    doc.add_paragraph(
        "A tabela a seguir estabelece a rastreabilidade bidirecional entre todas as entidades de avaliacao "
        "do projeto TeacherMakers, conectando as Perguntas de Avaliacao (PA), Protocolos (PT), Evidencias (EV), "
        "Analises Conduzidas (AN), Problemas Identificados (PB) e Veredictos:"
    )

    rastreab_data = [
        ["PA-01", "Qualidade Funcional", "PT-04", "EV-01, EV-02", "AN-04 (API e BD)", "PB-01", "Parcialmente Atendido"],
        ["PA-02", "Usabilidade Heuristica", "PT-02, PT-05", "EV-05, EV-06", "AN-03, AN-05 (Ergonomia)", "PB-02, PB-03, PB-04", "Atendido com Ressalvas"],
        ["PA-03", "Learnability", "PT-01", "EV-03", "AN-02 (Primeiro Acesso)", "Nenhum", "Totalmente Atendido"],
        ["PA-04", "Experiencia (UEQ-S)", "PT-03", "EV-04", "AN-01 (Psicometria UX)", "PB-07", "Atendido na Pragmatica"],
        ["PA-05", "Qualidade Pedagogica", "PT-07", "EV-08, EV-09", "AN-07 (Pilares BNCC)", "PB-05", "Atendido no Conteudo"],
        ["PA-06", "Acessibilidade e Perf.", "PT-06", "EV-07", "AN-06 (Lighthouse)", "PB-02", "Nao Atendido em Acess."],
        ["PA-07", "Eficacia da Aprendizagem", "PT-07", "EV-08", "AN-07 (Pre/Pos-teste)", "PB-08", "Inconclusivo (Metodologico)"],
    ]
    add_table(doc, ["Pergunta", "Dimensao de Qualidade", "Protocolo", "Evidencias", "Analise Realizada", "Problema Gerado", "Veredicto"], rastreab_data, [1.8, 3.5, 2.0, 2.5, 3.5, 2.5, 2.2])

    doc.add_heading("2. Inventario de Fontes Primarias de Dados (Planilhas Originais)", level=1)
    doc.add_paragraph(
        "Todos os dados empiricos foram coletados entre setembro e outubro de 2026 e encontram-se preservados "
        "em formato Excel (.xlsx) na subpasta Fontes_Originais deste diretorio:"
    )

    sheets_data = [
        ["Avaliação de Primeiro Acesso e Aprendizagem Inicial (Learnability)", "Learnability.xlsx", "3 respostas", "AC23, p01, DK29", "Medicao de compreensao inicial e autonomia"],
        ["Ficha de Teste de Usabilidade — Tarefa Crítica", "Usabilidade.xlsx", "2 respostas", "lm, DK29", "Medicao de tempo, erros e taxa de conclusao"],
        ["Questionário de Experiência do Usuário (UEQ-S)", "UEQ-S.xlsx", "9 respostas", "Docentes voluntários", "Calculo de Qualidade Pragmatica e Hedonica"],
        ["Checklist de Avaliação Técnica e Segurança da API", "Seguranca_API.xlsx", "2 avaliadores", "lm, Diedson Kenned", "Testes de caixa preta com payloads anomalos"],
        ["Ficha de Inspeção Visual e Percurso Cognitivo", "Inspecao_Visual.xlsx", "2 avaliadores", "lm, Matheus Dos Anjos", "Avaliacao heuristica e walkthrough cognitivo"],
        ["Registro de Auditoria de Desempenho (Performance)", "Performance.xlsx", "1 auditoria", "Lighthouse / DevTools", "Metricas FCP, LCP, CLS, Performance e Acessibilidade"],
        ["Avaliação de Conhecimento — Pré-teste / Pós-teste", "Pre_Pos_Teste.xlsx", "1 resposta", "Participante lm", "Pós-teste conceitual sobre Pensamento Computacional"],
    ]
    add_table(doc, ["Nome da Planilha Original", "Identificador Curto", "Amostra", "Responsaveis / Sujeitos", "Objetivo da Coleta"], sheets_data, [4.5, 2.5, 2.2, 3.5, 5.3])

    doc.add_heading("3. Referencial Normativo e Bibliografico Completo", level=1)
    doc.add_paragraph(
        "A fundamentacao conceitual do dossie ancora-se em normas tecnicas internacionais e na literatura "
        "especializada em Engenharia de Software, Interacao Humano-Computador e Educacao em Computacao:"
    )

    refs_bib = [
        "ALMEIDA, K. K. S.; LINO, A. C. L.; VARGAS, S. R.; PINTO, V. P.; LACIO, L. M. S. Curriculo e Cidadania: Preparando Estudantes para o Seculo XXI. Missioneira, v. 27, n. 8, p. 309-320, 2025.",
        "ARAUJO, D.; RODRIGUES, A.; SILVA, C.; SOARES, L. O ensino de computacao na educacao basica apoiado por problemas: Praticas de licenciandos em computacao. In: Workshop sobre Educacao em Computacao (WEI), SBC, p. 130-139, 2015.",
        "BARIONI, M. C. N.; FARIA, E. R.; LIMA, M. A. V. Relato de experiencia sobre o ensino de Pensamento Computacional para professores da educacao basica. In: Simposio Brasileiro de Informatica na Educacao (SBIE), SBC, 2022.",
        "BLIKSTEIN, P. Digital Fabrication and 'Making' in Education: The Democratization of Invention. FabLabs: Of Machines, Makers and Inventors, 2013.",
        "BRASIL. Ministerio da Educacao. Base Nacional Comum Curricular (BNCC): Computacao na Educacao Basica. Brasilia: MEC, 2018.",
        "DENZIN, N. K. The Research Act: A Theoretical Introduction to Sociological Methods. New York: Routledge, 2012.",
        "ISO/IEC 25010:2011. Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models. International Organization for Standardization, 2011.",
        "LAUGWITZ, B.; HELD, T.; SCHREPP, M. Construction and evaluation of a user experience questionnaire. In: Symposium of the Austrian HCI and Usability Engineering Group. Berlin: Springer, 2008. p. 63-76.",
        "NIELSEN, J. Usability Engineering. Boston: Academic Press, 1993.",
        "PAPERT, S. Mindstorms: Children, Computers, and Powerful Ideas. New York: Basic Books, 1980.",
        "RESNICK, M. Lifelong Kindergarten: Cultivating Creativity through Projects, Passion, Peers, and Play. MIT Press, 2017.",
        "SCHREPP, M.; HINDERKS, A.; THOMASCHEWSKI, J. Design and Evaluation of a Short Version of the User Experience Questionnaire (UEQ-S). IJIMAI, v. 4, n. 6, p. 103-108, 2017.",
        "W3C. Web Content Accessibility Guidelines (WCAG) 2.1. World Wide Web Consortium Recommendation, 2018.",
        "WING, J. M. Computational thinking. Communications of the ACM, v. 49, n. 3, p. 33-35, 2006."
    ]
    for rb in refs_bib:
        doc.add_paragraph(rb, style='List Number')

    return doc


def style_existing_docx(docx_path, title, subtitle=""):
    """Padroniza arquivos DOCX existentes para seguir a mesma identidade visual."""
    doc = Document(docx_path)
    setup_styles(doc)
    set_margins(doc)
    add_header_footer(doc, title)

    for table in doc.tables:
        style_table(table)

    doc.save(docx_path)


# ═══════════════════════════════════════════════════
# EXECUÇÃO PRINCIPAL DO PIPELINE
# ═══════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("DOSSIE DE AVALIACAO DA QUALIDADE — TEACHERMAKERS (v1.0)")
    print("Pipeline de Consolidacao, Diagramacao e Exportacao Profissional")
    print("=" * 70)

    # 1. Limpeza de diretórios anteriores
    if os.path.exists(OUT):
        shutil.rmtree(OUT)

    # 2. Criação da estrutura de pastas padronizada
    folders = {
        "00": os.path.join(OUT, "00_LEIA-ME"),
        "01": os.path.join(OUT, "01_DOSSIE_PRINCIPAL"),
        "02": os.path.join(OUT, "02_PLANEJAMENTO_E_CRITERIOS"),
        "03": os.path.join(OUT, "03_EXECUCAO_E_ANALISES"),
        "04": os.path.join(OUT, "04_EVIDENCIAS_E_PROBLEMAS"),
        "05": os.path.join(OUT, "05_FONTES_E_REFERENCIAS"),
        "05_orig": os.path.join(OUT, "05_FONTES_E_REFERENCIAS", "Fontes_Originais"),
    }
    for path in folders.values():
        os.makedirs(path, exist_ok=True)

    print("\n[Etapa 1/12] Gerando 00_LEIA-ME...")
    leiame = build_leiame()
    leiame.save(os.path.join(folders["00"], "LEIA-ME.docx"))

    print("[Etapa 2/12] Gerando 01_DOSSIE_PRINCIPAL/Dossie_Avaliacao_da_Qualidade...")
    dossie = build_dossie_principal()
    dossie.save(os.path.join(folders["01"], "Dossie_Avaliacao_da_Qualidade.docx"))

    print("[Etapa 3/12] Processando 02_PLANEJAMENTO_E_CRITERIOS/Plano_Mestre_de_Avaliacao...")
    doc_pm = md_to_docx_via_pandoc("Relatorio_Mestre _Avaliacao_Qualidade.md", "Plano Mestre de Avaliacao da Qualidade")
    if doc_pm:
        doc_pm.save(os.path.join(folders["02"], "Plano_Mestre_de_Avaliacao.docx"))

    print("[Etapa 4/12] Processando 02_PLANEJAMENTO_E_CRITERIOS/Perguntas_de_Avaliacao...")
    fichas_src = os.path.join(BASE, "Fichas_de_Avaliacao.docx")
    fichas_dst = os.path.join(folders["02"], "Perguntas_de_Avaliacao.docx")
    if os.path.exists(fichas_src):
        shutil.copy2(fichas_src, fichas_dst)
        style_existing_docx(fichas_dst, "Perguntas e Fichas de Avaliacao")

    print("[Etapa 5/12] Gerando 02_PLANEJAMENTO_E_CRITERIOS/Matriz_de_Avaliacao...")
    doc_mat = build_matriz_avaliacao_doc()
    doc_mat.save(os.path.join(folders["02"], "Matriz_de_Avaliacao.docx"))
    mat_xlsx = os.path.join(BASE, "Matriz_de_Avaliacao.xlsx")
    if os.path.exists(mat_xlsx):
        shutil.copy2(mat_xlsx, os.path.join(folders["02"], "Matriz_de_Avaliacao.xlsx"))

    print("[Etapa 6/12] Processando 03_EXECUCAO_E_ANALISES/Protocolos...")
    prot_src = os.path.join(BASE, "protocolo de avaliações.docx")
    prot_dst = os.path.join(folders["03"], "Protocolos.docx")
    if os.path.exists(prot_src):
        shutil.copy2(prot_src, prot_dst)
        style_existing_docx(prot_dst, "Protocolos de Avaliacao")

    print("[Etapa 7/12] Processando 03_EXECUCAO_E_ANALISES/Analises_Realizadas...")
    doc_an = md_to_docx_via_pandoc("Analises_Realizadas.md", "Relatorio de Analises Realizadas")
    if doc_an:
        doc_an.save(os.path.join(folders["03"], "Analises_Realizadas.docx"))

    print("[Etapa 8/12] Processando 03_EXECUCAO_E_ANALISES/Respostas_as_Perguntas e Triangulacao...")
    doc_resp = md_to_docx_via_pandoc("Respostas_as_Perguntas_de_Avaliacao.md", "Respostas as Perguntas de Avaliacao")
    if doc_resp:
        doc_resp.save(os.path.join(folders["03"], "Respostas_as_Perguntas_de_Avaliacao.docx"))

    doc_tri = md_to_docx_via_pandoc("Triangulacao_de_Resultados.md", "Triangulacao de Resultados")
    if doc_tri:
        doc_tri.save(os.path.join(folders["03"], "Triangulacao.docx"))

    print("[Etapa 9/12] Processando 04_EVIDENCIAS_E_PROBLEMAS/Caderno e Matriz Consolidada...")
    doc_ev = md_to_docx_via_pandoc("Caderno_de_Evidencias_de_Qualidade.md", "Caderno de Evidencias de Qualidade")
    if doc_ev:
        doc_ev.save(os.path.join(folders["04"], "Caderno_de_Evidencias_de_Qualidade.docx"))

    doc_mp = md_to_docx_via_pandoc("Matriz_Consolidada_de_Problemas.md", "Matriz Consolidada de Problemas")
    if doc_mp:
        doc_mp.save(os.path.join(folders["04"], "Matriz_Consolidada_de_Problemas.docx"))

    mp_xlsx = os.path.join(BASE, "Matriz_Consolidada_de_Problemas.xlsx")
    if os.path.exists(mp_xlsx):
        shutil.copy2(mp_xlsx, os.path.join(folders["04"], "Matriz_Consolidada_de_Problemas.xlsx"))

    print("[Etapa 10/12] Gerando 05_FONTES_E_REFERENCIAS e copiando dados brutos...")
    doc_ref = build_referencias_e_rastreabilidade_doc()
    doc_ref.save(os.path.join(folders["05"], "Referencias_e_Rastreabilidade.docx"))

    raw_sheets = [
        "Avaliação de Primeiro Acesso e Aprendizagem Inicial (Learnability) — TeacherMakers (respostas).xlsx",
        "Ficha de Teste de Usabilidade — Tarefa Crítica (Módulo de Atividades) (respostas).xlsx",
        "Questionário de Experiência do Usuário (UEQ-S) (respostas).xlsx",
        "Checklist de Avaliação Técnica e Segurança da API — TeacherMakers (respostas).xlsx",
        "Ficha de Inspeção Visual e Percurso Cognitivo — TeacherMakers (respostas).xlsx",
        "Registro de Auditoria de Desempenho (Performance) — TeacherMakers (respostas).xlsx",
        "Avaliação de Conhecimento em Cultura Maker e Pensamento Computacional — Pré-teste (respostas).xlsx"
    ]
    for sheet in raw_sheets:
        src = os.path.join(BASE, sheet)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(folders["05_orig"], sheet))

    print("\n[Etapa 11/12] Convertendo todos os documentos Word (.docx) para PDF via Microsoft Word COM...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    pdf_count = 0
    try:
        for root, dirs, files in os.walk(OUT):
            for fname in files:
                if fname.endswith(".docx"):
                    docx_fp = os.path.join(root, fname)
                    pdf_fp = docx_fp.replace(".docx", ".pdf")
                    try:
                        docx_to_pdf(docx_fp, pdf_fp, word)
                        pdf_count += 1
                        rel_pdf = os.path.relpath(pdf_fp, OUT)
                        print(f"  [PDF OK] {rel_pdf}")
                    except Exception as e:
                        print(f"  [ERRO PDF] Falha em {fname}: {e}")
    finally:
        word.Quit()

    print(f"\n[Etapa 12/12] Empacotando {pdf_count} PDFs, DOCXs e planilhas em {ZIP_PATH}...")
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)

    total_files = 0
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(OUT):
            for f in files:
                fp = os.path.join(root, f)
                # O caminho dentro do zip deve ser relativo ao diretório OUT (isto é, pasta raiz Dossie_Avaliacao_Qualidade)
                arcname = os.path.join("Dossie_Avaliacao_Qualidade", os.path.relpath(fp, OUT))
                zf.write(fp, arcname)
                total_files += 1

    size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print("\n" + "=" * 70)
    print("PROCESSO CONCLUIDO COM TOTAL SUCESSO!")
    print(f"Arquivo gerado: {ZIP_PATH}")
    print(f"Tamanho total:  {size_mb:.2f} MB")
    print(f"Total de itens no ZIP: {total_files}")
    print("=" * 70)

    print("\nInventario detalhado do arquivo ZIP:")
    with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
        for item in zf.infolist():
            print(f"  - {item.filename} ({item.file_size:,} bytes)")


if __name__ == "__main__":
    main()
