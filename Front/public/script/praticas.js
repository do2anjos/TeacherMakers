document.addEventListener('DOMContentLoaded', async () => {
    
    if (!TeacherMakersApi.isAuthenticated()) {
        window.location.href = 'Login.html';
        return;
    }

    
    const urlParams = new URLSearchParams(window.location.search);
    let praticaId = urlParams.get('id');
    
    if (!praticaId) {
        praticaId = sessionStorage.getItem('tm_current_pratica_id');
    }

    if (!praticaId) {
        alert('ID da prática não encontrado. Retornando ao dashboard.');
        window.location.href = 'home.html';
        return;
    }

    
    try {
        
        
        
        
        
        
        const pratica = await TeacherMakersApi.getPraticaDetalhes(praticaId);
        renderPratica(pratica);
    } catch (erro) {
        alert('Erro ao carregar dados da prática: ' + erro.message);
        window.location.href = 'home.html';
    }
});

function renderPratica(pratica) {
    
    const greetingTitle = document.querySelector('.dash-greeting-title');
    const headerModulo = document.getElementById('header-modulo');

    if (greetingTitle) greetingTitle.textContent = pratica.modulo_titulo || 'Módulo';
    if (headerModulo) headerModulo.textContent = pratica.titulo || 'Prática';

    
    const container = document.getElementById('slides-container');
    const dotsContainer = document.getElementById('dots-container');
    
    if (!container || !pratica.etapas) return;

    container.innerHTML = '';
    dotsContainer.innerHTML = '';

    let linkProjeto = null;
    let tituloProjeto = null;
    const tituloMinusculo = pratica.titulo ? pratica.titulo.toLowerCase() : '';
    
    if (tituloMinusculo.includes('decomposição')) {
        linkProjeto = "https://drive.google.com/drive/folders/1cjwfiNIGM6LdWiQvbQnqyrg-0UACRi87?usp=sharing";
        tituloProjeto = "Decomposição";
    } else if (tituloMinusculo.includes('padrões')) {
        linkProjeto = "https://drive.google.com/drive/folders/1vmkjEu8Xfs2qjIC9bfsGAguVhzNrDG1k?usp=sharing";
        tituloProjeto = "Reconhecimento de Padrões";
    } else if (tituloMinusculo.includes('algoritmos')) {
        linkProjeto = "https://drive.google.com/drive/folders/1qyV8_USilGjkNOM-85XY1KjcoXCfHgGJ?usp=sharing";
        tituloProjeto = "Algoritmos";
    } else if (tituloMinusculo.includes('abstração')) {
        linkProjeto = "https://drive.google.com/drive/folders/1jwLdL6lOKhb8ppf1_11cKPQINwDlu-Tu?usp=sharing";
        tituloProjeto = "Abstração";
    } else if (tituloMinusculo.includes('integradora 1')) {
        linkProjeto = "https://drive.google.com/drive/folders/1BHRiVmJF680HciCTW-S3srbNQe8ImmAW?usp=sharing";
        tituloProjeto = "Prática Integradora 1";
    } else if (tituloMinusculo.includes('imaginar')) {
        linkProjeto = "https://drive.google.com/drive/folders/1_RSszUVmBgXKAaw-8qY5FJGuVyOzo9IR?usp=sharing";
        tituloProjeto = "Imaginar";
    } else if (tituloMinusculo.includes('planejar')) {
        linkProjeto = "https://drive.google.com/drive/folders/1HRqeFzPESFOOduV3IhSROv6pW1RpK0gy?usp=sharing";
        tituloProjeto = "Planejar";
    } else if (tituloMinusculo.includes('criar')) {
        linkProjeto = "https://drive.google.com/drive/folders/1ImEicvmGd35FSOr3zOCUFFru1t8ePsd6?usp=sharing";
        tituloProjeto = "Criar";
    } else if (tituloMinusculo.includes('testar')) {
        linkProjeto = "https://drive.google.com/drive/folders/1fVktmNQFOeuAUQdLBbzCIjQOcRz6_mvJ?usp=sharing";
        tituloProjeto = "Testar";
    }

    if (linkProjeto) {
        const linksStep = {
            titulo: 'Ideias de Projetos Práticos',
            texto_instrucao: `
                <p style="margin-bottom: 1.5rem; font-size: 1.05rem;">Aqui estão algumas ideias de projetos práticos fantásticos para você aplicar sobre <strong>${tituloProjeto}</strong> com seus alunos!</p>
                <div style="text-align: center; margin-top: 2rem; margin-bottom: 2.5rem;">
                    <a href="${linkProjeto}" target="_blank" style="display: inline-flex; align-items: center; justify-content: center; background-color: #4f46e5; color: white; padding: 0.875rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s ease;">
                        Acessar Ideias de ${tituloProjeto}
                    </a>
                </div>
            `
        };
        pratica.etapas.splice(3, 0, linksStep);
    }

    pratica.etapas.forEach((etapa, index) => {
        const isLast = index === pratica.etapas.length - 1;
        
        
        const dot = document.createElement('div');
        dot.className = `intro-dot ${index === 0 ? 'active' : ''}`;
        dotsContainer.appendChild(dot);

        
        const slide = document.createElement('div');
        slide.className = `intro-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <div style="text-align: left; width: 100%; max-width: 480px; margin: 0 auto;">
              <span class="etapa-label">ETAPA ${index + 1}</span>
              <h2 class="intro-title">${etapa.titulo}</h2>
            </div>
            <div class="pratica-dialog-box">
              ${etapa.texto_instrucao}
              
              ${isLast ? `
                <div style="margin-top: 1.5rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                  <label for="diario-bordo" style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Diário de Bordo <span aria-hidden="true">*</span></label>
                  <textarea id="diario-bordo" aria-describedby="diario-ajuda" minlength="100" placeholder="Descreva detalhadamente como foi aplicar essa atividade..." style="width: 100%; min-height: 100px; padding: 0.75rem; border-radius: 8px; border: 1px solid #ddd; font-family: inherit; margin-bottom: 0.25rem;" required></textarea>
                  <small id="diario-ajuda">Obrigatório. Escreva pelo menos 100 caracteres.</small>
                  
                  <label for="foto-evidencia" style="display: block; font-weight: 600; margin: 1rem 0 0.5rem;">Foto da Atividade <span aria-hidden="true">*</span></label>
                  <input type="file" id="foto-evidencia" accept="image/jpeg,image/png,image/webp" aria-describedby="foto-ajuda" style="width: 100%; min-height: 48px; padding: 0.5rem; border: 1px dashed #64748b; border-radius: 8px; background: #fafafa;" required>
                  <small id="foto-ajuda">Formatos aceitos: JPG, PNG e WEBP. Tamanho máximo: 10 MB.</small>
                </div>
              ` : ''}
            </div>
        `;
        container.appendChild(slide);
    });

    setupNavigation(pratica.etapas.length, pratica.id);
}

function setupNavigation(totalEtapas, praticaId) {
    const slides = document.querySelectorAll('.intro-slide');
    const dots = document.querySelectorAll('.intro-dot');
    const btnAnterior = document.getElementById('btn-prev');
    const btnProximo = document.getElementById('btn-next');

    let etapaAtual = 0;
    const feedback = document.getElementById('practice-feedback');

    function showError(message) {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.hidden = false;
        feedback.focus();
    }

    function update() {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === etapaAtual);
            s.classList.toggle('exit-left', i < etapaAtual);
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === etapaAtual));
        
        btnAnterior.disabled = etapaAtual === 0;
        btnProximo.textContent = etapaAtual === totalEtapas - 1 ? 'Concluir Prática' : 'Próximo';
    }

    btnProximo.onclick = async () => {
        if (etapaAtual < totalEtapas - 1) {
            etapaAtual++;
            update();
        } else {
            try {
                const diario = document.getElementById('diario-bordo')?.value.trim() || '';
                const fotoInput = document.getElementById('foto-evidencia');
                const fotoFile = fotoInput?.files[0] || null;

                if (Array.from(diario).length < 100) {
                    showError('O Diário de Bordo deve conter pelo menos 100 caracteres.');
                    return;
                }

                if (!fotoFile) {
                    showError('Por favor, envie uma Foto da Atividade.');
                    return;
                }

                if (feedback) feedback.hidden = true;

                btnProximo.disabled = true;
                btnProximo.textContent = 'Salvando...';
                
                const resultado = await TeacherMakersApi.finalizarPratica(praticaId, diario, fotoFile);
                if (!resultado?.protocolo || !resultado?.dataEnvio) {
                    throw new Error('O servidor não retornou a confirmação completa da evidência.');
                }
                try { window.dispatchEvent(new Event('tm:progress-updated')); } catch (e) {}

                showSuccessModal(resultado, btnProximo);
            } catch (erro) {
                showError('Não foi possível salvar a prática: ' + erro.message);
                btnProximo.disabled = false;
                btnProximo.textContent = 'Concluir Prática';
            }
        }
    };

    btnAnterior.onclick = () => {
        if (etapaAtual > 0) {
            etapaAtual--;
            update();
        }
    };
}

function showSuccessModal(result, origin) {
    const dialog = document.createElement('dialog');
    dialog.className = 'practice-success-dialog';
    dialog.setAttribute('aria-labelledby', 'practice-success-title');
    dialog.setAttribute('aria-describedby', 'practice-success-summary');

    const title = document.createElement('h2');
    title.id = 'practice-success-title';
    title.textContent = 'Prática concluída';
    const summary = document.createElement('p');
    summary.id = 'practice-success-summary';
    summary.textContent = 'A evidência foi registrada com sucesso.';
    const protocol = document.createElement('p');
    protocol.textContent = `Protocolo: ${result.protocolo}`;
    const date = document.createElement('p');
    date.textContent = `Registrada em: ${new Date(result.dataEnvio).toLocaleString('pt-BR')}`;
    const progress = document.createElement('p');
    const moduleProgress = result.progressoModulo || {};
    progress.textContent = `Progresso do módulo: ${Number(moduleProgress.percentual) || 0}%`;
    const nextStep = document.createElement('p');
    nextStep.textContent = result.proximoPasso?.titulo ? `Próximo passo: ${result.proximoPasso.titulo}` : 'Você chegou ao último módulo disponível.';
    const achievements = document.createElement('ul');
    achievements.className = 'practice-achievements';
    (result.novasConquistas || []).forEach((badge) => {
        const item = document.createElement('li');
        item.textContent = `Conquista desbloqueada: ${badge.name}`;
        achievements.appendChild(item);
    });
    const continueButton = document.createElement('button');
    continueButton.type = 'button';
    continueButton.className = 'btn btn-primary';
    continueButton.textContent = result.proximoPasso?.continuarNoModulo
        ? 'Continuar no Módulo'
        : (result.proximoPasso ? 'Avançar para o Próximo Módulo' : 'Voltar ao Painel');
    continueButton.addEventListener('click', () => {
        if (result.proximoPasso) sessionStorage.setItem('tm_return_module_id', result.proximoPasso.moduloId);
        dialog.close();
        window.location.href = 'home.html';
    });

    dialog.append(title, summary, protocol, date, progress, nextStep);
    if (achievements.childElementCount) dialog.appendChild(achievements);
    dialog.appendChild(continueButton);
    dialog.addEventListener('close', () => {
        if (origin) {
            origin.disabled = false;
            origin.textContent = 'Concluir Prática';
        }
        dialog.remove();
        origin?.focus();
    });
    document.body.appendChild(dialog);
    dialog.showModal();
    continueButton.focus();
}
