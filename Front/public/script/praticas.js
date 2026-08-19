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
                  <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Diário de Bordo <span style="color: #ef4444;">*</span></label>
                  <textarea id="diario-bordo" placeholder="Descreva detalhadamente como foi aplicar essa atividade..." style="width: 100%; min-height: 100px; padding: 0.75rem; border-radius: 8px; border: 1px solid #ddd; font-family: inherit; margin-bottom: 1rem;" required></textarea>
                  
                  <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Foto da Atividade <span style="color: #ef4444;">*</span></label>
                  <input type="file" id="foto-evidencia" accept="image/*" style="width: 100%; padding: 0.5rem; border: 1px dashed #ccc; border-radius: 8px; background: #fafafa;" required>
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

                if (!diario) {
                    alert('Por favor, preencha o Diário de Bordo.');
                    return;
                }

                if (!fotoFile) {
                    alert('Por favor, envie uma Foto da Atividade.');
                    return;
                }

                btnProximo.disabled = true;
                btnProximo.textContent = 'Salvando...';
                
                await TeacherMakersApi.finalizarPratica(praticaId, diario, fotoFile);
                try { window.dispatchEvent(new Event('tm:progress-updated')); } catch (e) {}

                showSuccessToast();
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 2500);
            } catch (erro) {
                alert('Erro ao salvar progresso: ' + erro.message);
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

function showSuccessToast() {
    const overlay = document.createElement('div');
    overlay.className = 'toast-overlay active';
    const toast = document.createElement('div');
    toast.className = 'toast-card';
    
    
    Object.assign(toast.style, { 
        background: '#ecfdf5', 
        border: `2px solid #10b981`, 
        color: '#065f46',
        textAlign: 'center',
        padding: '2rem'
    });
    
    toast.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;"></div>
        <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">Prática Concluída!</h3>
        <p>Excelente trabalho! Seu progresso foi salvo e você está mais perto da sua certificação.</p>
    `;
    
    overlay.appendChild(toast);
    document.body.appendChild(overlay);
}
