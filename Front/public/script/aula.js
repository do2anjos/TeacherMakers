let dadosAulaAtual = null;
let indiceQuestaoAtual = 0;
let indiceRespostaSelecionada = -1;
let estadoEtapaAula = {
    videoConcluido: false,
    resumoConcluido: false,
    quizConcluido: false
};

function initAulaIcons() {
    if (typeof icons === 'undefined') return;

    injectIcon('chevron-icon', icons.chevronDown);
    injectIcon('di-icon-user', icons.user);
    injectIcon('di-icon-settings', icons.settings);
    injectIcon('di-icon-moon', icons.moon);
    injectIcon('di-icon-logout', icons.logOut);
    injectIcon('icon-back', icons.arrowLeft);
    injectIcon('icon-step-video', icons.video);
    injectIcon('icon-step-resumo', icons.book);
    injectIcon('icon-step-quiz', icons.checkCircle);
    injectIcon('icon-submit-quiz', icons.checkCircle);
    injectIcon('icon-video-play', icons.play);
    injectIcon('icon-complete-video', icons.check);
    injectIcon('icon-complete-resumo', icons.check);
}

document.addEventListener('DOMContentLoaded', async () => {
    initAulaIcons();

    const user = JSON.parse(localStorage.getItem('tm_user'));
    if (!user || !TeacherMakersApi.getToken()) {
        window.location.href = 'Login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let aulaId = urlParams.get('id');

    if (!aulaId) {
        aulaId = sessionStorage.getItem('tm_current_aula_id');
    }

    if (!aulaId) {
        alert('ID da aula não encontrado. Por favor, tente acessar novamente a partir da página inicial.');
        window.location.href = 'home.html';
        return;
    }

    try {
        dadosAulaAtual = await TeacherMakersApi.getAulaDetalhes(aulaId);

        if (!dadosAulaAtual) {
            throw new Error('API retornou vazio para o ID: ' + aulaId);
        }

        renderAula(dadosAulaAtual);
        loadAulaStepState();
        updateAulaStepSidebar();
        initQuiz();
    } catch (erro) {
        alert('Erro ao carregar a aula. Por favor, tente novamente mais tarde.');
        return;
    }

    setupAulaUI();
});

function renderAula(aula) {
    document.title = `Aula ${aula.ordem}: ${aula.titulo} - TeacherMakers`;

    const greetingTitle = document.querySelector('.dash-greeting-title');
    const headerModulo = document.getElementById('header-modulo');

    if (greetingTitle) greetingTitle.textContent = aula.modulo_titulo || 'Módulo';
    if (headerModulo) headerModulo.textContent = aula.titulo || 'Aula';

    const titleEl = document.getElementById('aula-title');
    const subtitleEl = document.getElementById('aula-subtitle');

    if (titleEl) titleEl.textContent = `Aula ${aula.ordem}: ${aula.titulo}`;
    if (subtitleEl) subtitleEl.textContent = aula.subtitulo;

    const videoTitle = document.getElementById('video-title');
    const videoDesc = document.getElementById('video-desc');
    const resumoContent = document.getElementById('resumo-content');

    if (videoTitle) videoTitle.textContent = aula.video_titulo || aula.titulo;
    if (videoDesc) videoDesc.textContent = aula.descricao;
    if (resumoContent) resumoContent.innerHTML = aula.resumo || `<p>${aula.descricao || 'Resumo em preparação.'}</p>`;
}

function getAulaStepKey(etapa) {
    return `tm_aula_${dadosAulaAtual.id}_${etapa}_done`;
}

function loadAulaStepState() {
    
    if (dadosAulaAtual && dadosAulaAtual.status === 'concluido') {
        estadoEtapaAula.videoConcluido = true;
        estadoEtapaAula.resumoConcluido = true;
        estadoEtapaAula.quizConcluido = true;
    } else {
        
        estadoEtapaAula.videoConcluido = !!dadosAulaAtual?.video_assistido;
        estadoEtapaAula.resumoConcluido = false;
        estadoEtapaAula.quizConcluido = false;
    }
}

function saveAulaStepState(etapa) {
    if (etapa === 'video') estadoEtapaAula.videoConcluido = true;
    if (etapa === 'resumo') estadoEtapaAula.resumoConcluido = true;
    updateAulaStepSidebar();
}

function setActiveAulaStep(etapa) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`pane-${etapa}`)?.classList.add('active');

    document.querySelectorAll('.aula-step-link').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-step="${etapa}"]`)?.classList.add('active');
}

function updateAulaStepSidebar() {
    const videoBtn = document.getElementById('step-video-btn');
    const resumoBtn = document.getElementById('step-resumo-btn');
    const quizBtn = document.getElementById('step-quiz-btn');

    videoBtn?.classList.toggle('done', estadoEtapaAula.videoConcluido);

    if (resumoBtn) {
        resumoBtn.disabled = !estadoEtapaAula.videoConcluido;
        resumoBtn.classList.toggle('locked', !estadoEtapaAula.videoConcluido);
        resumoBtn.classList.toggle('done', estadoEtapaAula.resumoConcluido);
    }

    if (quizBtn) {
        quizBtn.disabled = !estadoEtapaAula.resumoConcluido;
        quizBtn.classList.toggle('locked', !estadoEtapaAula.resumoConcluido);
        quizBtn.classList.toggle('done', estadoEtapaAula.quizConcluido);
    }
}

function openQuizModal() {
    if (!estadoEtapaAula.resumoConcluido) return;
    document.getElementById('quiz-modal-wrapper').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function initQuiz() {
    if (!dadosAulaAtual.quiz || dadosAulaAtual.quiz.length === 0) return;
    indiceQuestaoAtual = 0;
    showQuestion();
}

function showQuestion() {
    const container = document.getElementById('quiz-container');
    const questions = dadosAulaAtual.quiz;
    const q = questions[indiceQuestaoAtual];
    const total = questions.length;

    const progText = document.getElementById('quiz-progress-text');
    const progFill = document.getElementById('quiz-progress-fill');

    if (progText) progText.textContent = `Questão ${indiceQuestaoAtual + 1} de ${total}`;
    if (progFill) {
        progFill.style.width = `${((indiceQuestaoAtual + 1) / total) * 100}%`;
    }

    document.getElementById('btn-verificar').style.display = 'inline-flex';
    document.getElementById('btn-verificar').disabled = true;
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-concluir').style.display = 'none';
    indiceRespostaSelecionada = -1;

    const htmlOpcoes = q.opcoes.map((opt) => `
        <label class="quiz-opt" onclick="selectOption(${opt.id}, this)">
          <input type="radio" name="quiz_q" value="${opt.id}">
          <span class="quiz-opt-marker"></span>
          ${opt.texto}
        </label>
    `).join('');

    container.innerHTML = `
        <div class="quiz-question animate-fade-in-up">
            <h4>${indiceQuestaoAtual + 1}. ${q.pergunta}</h4>
            <div class="quiz-options">
                ${htmlOpcoes}
            </div>
        </div>
    `;
}

window.selectOption = (opcaoId, el) => {
    const allOpts = document.querySelectorAll('.quiz-opt');
    allOpts.forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    indiceRespostaSelecionada = opcaoId;
    document.getElementById('btn-verificar').disabled = false;
};

async function handleCheckAnswer() {
    const question = dadosAulaAtual.quiz[indiceQuestaoAtual];
    const btn = document.getElementById('btn-verificar');

    btn.disabled = true;

    try {
        const resultado = await TeacherMakersApi.submeterQuiz(question.id, indiceRespostaSelecionada);
        const sobreposicao = showFeedbackToast(resultado.acertou);

        setTimeout(() => {
            dismissToast(sobreposicao);
            if (resultado.acertou) {
                if (indiceQuestaoAtual < dadosAulaAtual.quiz.length - 1) {
                    indiceQuestaoAtual++;
                    showQuestion();
                } else {
                    document.getElementById('btn-verificar').style.display = 'none';
                    document.getElementById('btn-concluir').style.display = 'inline-flex';
                }
            } else {
                btn.disabled = false;
            }
        }, 1500);
    } catch (erro) {
        alert(erro.message);
        btn.disabled = false;
    }
}

async function handleFinishAula() {
    try {
        await TeacherMakersApi.concluirAula(dadosAulaAtual.id);

        if (dadosAulaAtual && typeof dadosAulaAtual.ordem !== 'undefined') {
            sessionStorage.setItem(`aula${dadosAulaAtual.ordem}_concluida`, 'true');
        }

        try { window.dispatchEvent(new Event('tm:progress-updated')); } catch (e) {}
        if (typeof window.updateSidebarProgress === 'function') window.updateSidebarProgress();

        sessionStorage.setItem('tm_return_module_id', dadosAulaAtual.modulo_id);
        sessionStorage.setItem('tm_return_aula_id', dadosAulaAtual.id);
        window.location.href = 'home.html';
    } catch (erro) {
        alert('Erro ao salvar progresso: ' + erro.message);
    }
}

function setupAulaUI() {
    document.getElementById('btn-verificar')?.addEventListener('click', handleCheckAnswer);
    document.getElementById('btn-next')?.addEventListener('click', () => {
        indiceQuestaoAtual++;
        showQuestion();
    });
    document.getElementById('btn-concluir')?.addEventListener('click', handleFinishAula);

    document.getElementById('step-video-btn')?.addEventListener('click', () => setActiveAulaStep('video'));
    document.getElementById('step-resumo-btn')?.addEventListener('click', () => {
        if (estadoEtapaAula.videoConcluido) setActiveAulaStep('resumo');
    });
    document.getElementById('step-quiz-btn')?.addEventListener('click', openQuizModal);

    document.getElementById('complete-video-btn')?.addEventListener('click', () => {
        saveAulaStepState('video');
        setActiveAulaStep('resumo');
    });

    document.getElementById('complete-resumo-btn')?.addEventListener('click', () => {
        saveAulaStepState('resumo');
        openQuizModal();
    });

    document.getElementById('back-to-video-btn')?.addEventListener('click', () => setActiveAulaStep('video'));

    document.getElementById('close-quiz-btn')?.addEventListener('click', () => {
        document.getElementById('quiz-modal-wrapper').style.display = 'none';
        document.body.style.overflow = '';
    });
}

function showFeedbackToast(estaCorreto) {
    const sobreposicao = document.createElement('div');
    sobreposicao.className = 'toast-overlay active';
    const toast = document.createElement('div');
    toast.className = 'toast-card';

    const bg = estaCorreto ? '#ecfdf5' : '#fef2f2';
    const border = estaCorreto ? '#10b981' : '#ef4444';
    const color = estaCorreto ? '#065f46' : '#b91c1c';

    Object.assign(toast.style, { background: bg, border: `2px solid ${border}`, color: color });

    toast.innerHTML = `
        <h3 style="margin-bottom: 0.5rem;">${estaCorreto ? 'Correto!' : 'Ops, tente novamente'}</h3>
        <p>${estaCorreto ? 'Excelente! Você domina o assunto.' : 'Essa não era a resposta certa. Leia o texto novamente!'}</p>
    `;

    sobreposicao.appendChild(toast);
    document.body.appendChild(sobreposicao);
    return sobreposicao;
}

function dismissToast(sobreposicao) {
    sobreposicao.classList.remove('active');
    setTimeout(() => sobreposicao.remove(), 300);
}
