function initDashboardIcons() {
  if (typeof icons === 'undefined') return;

  injectIcon('menu-icon', icons.menu);
  injectIcon('chevron-icon', icons.chevronDown);
  injectIcon('di-icon-user', icons.user);
  injectIcon('di-icon-settings', icons.settings);
  injectIcon('di-icon-moon', icons.moon);
  injectIcon('di-icon-logout', icons.logOut);
  injectIcon('icon-play-continue', icons.play);
  injectIcon('icon-book-visual', icons.book);
  
  
  injectIcon('empty-icon-app', icons.clipboard);
  injectIcon('empty-icon-cert', icons.lock);

  
  injectIcon('req-icon-1', icons.check);
  injectIcon('req-icon-2', icons.check);

  
  injectIcon('trail-icon-mod0', icons.check);
  injectIcon('trail-icon-mod1', icons.play);
  for (let i = 2; i <= 28; i++) {
    injectIcon('trail-icon-' + i, icons.lock);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
    initDashboardIcons();

    
    const user = JSON.parse(localStorage.getItem('tm_user'));
    if (!user || !TeacherMakersApi.getToken()) {
        window.location.href = 'Login.html';
        return;
    }

    
    const greetingTitle = document.querySelector('.dash-greeting-title');
    const avatarName = document.querySelector('.dash-header-user-name');
    const avatarCircle = document.querySelector('.user-avatar');

    const firstName = user.nome.split(' ')[0];
    if (greetingTitle) greetingTitle.textContent = `Olá, ${firstName}!`;
    
    if (avatarName) avatarName.textContent = user.nome;
    if (avatarCircle) avatarCircle.textContent = firstName.charAt(0).toUpperCase();

    
    try {
        const modulos = await TeacherMakersApi.getModulos();
        renderStats(modulos);
        renderHomeModulesGrid(modulos);
        updateContinueLearning(modulos);
    } catch (erro) {
        console.error("Erro no dashboard:", erro);
        alert("Ocorreu um erro no carregamento do painel: " + erro.message);
    }
});

function renderStats(modulos) {
    const user = JSON.parse(localStorage.getItem('tm_user')) || {};
    const totalModulos = modulos.length;
    
    let totalAulas = 0;
    let aulasConcluidas = 0;
    let totalPraticas = 0;
    let praticasConcluidas = 0;

    modulos.forEach(m => {
        const ehIntro = m.isIntro;
        
        const aulasNaTrilha = m.trilha.filter(item => item.tipo === 'aula');
        const totalAulasModulo = aulasNaTrilha.length;
        const aulasConcluidasModulo = (ehIntro && user.onboarding_concluido) ? totalAulasModulo : aulasNaTrilha.filter(item => item.status === 'concluido').length;
        
        totalAulas += totalAulasModulo;
        aulasConcluidas += aulasConcluidasModulo;

        const praticasNaTrilha = m.trilha.filter(item => item.tipo === 'pratica');
        totalPraticas += praticasNaTrilha.length;
        praticasConcluidas += praticasNaTrilha.filter(item => item.status === 'concluido').length;
    });

    const modulosConcluidos = modulos.filter(m => {
        const ehIntro = m.isIntro;
        return m.status === 'concluido' || (ehIntro && user.onboarding_concluido);
    }).length;
    
    
    const totalItensGlobal = modulos.reduce((acc, m) => acc + (m.totalItens || 0), 0);
    const itensConcluidosGlobal = modulos.reduce((acc, m) => {
        const ehIntro = m.isIntro;
        return acc + ((ehIntro && user.onboarding_concluido) ? (m.totalItens || 0) : (m.itensConcluidos || 0));
    }, 0);

    const progressoGlobal = totalItensGlobal > 0 ? Math.round((itensConcluidosGlobal / totalItensGlobal) * 100) : 0;

    
    const statAulas = document.getElementById('stat-aulas');
    const statAulasFill = document.getElementById('stat-aulas-fill');
    const statPraticas = document.getElementById('stat-praticas');
    const statPraticasFill = document.getElementById('stat-praticas-fill');
    const statModulos = document.getElementById('stat-modulos');
    const statModulosFill = document.getElementById('stat-modulos-fill');
    const globalProgressPct = document.getElementById('global-progress-pct');
    const globalProgressFill = document.getElementById('global-progress-fill');

    if (statAulas) statAulas.textContent = aulasConcluidas;
    const aulasDeText = document.querySelector('#stat-aulas + .stat-of');
    if (aulasDeText) aulasDeText.textContent = `de ${totalAulas}`;
    if (statAulasFill) statAulasFill.style.width = `${totalAulas > 0 ? (aulasConcluidas / totalAulas) * 100 : 0}%`;

    if (statPraticas) statPraticas.textContent = praticasConcluidas;
    const praticasDeText = document.querySelector('#stat-praticas + .stat-of');
    if (praticasDeText) praticasDeText.textContent = `de ${totalPraticas}`;
    if (statPraticasFill) statPraticasFill.style.width = `${totalPraticas > 0 ? (praticasConcluidas / totalPraticas) * 100 : 0}%`;

    if (statModulos) statModulos.textContent = modulosConcluidos;
    if (statModulosFill) statModulosFill.style.width = `${(modulosConcluidos / totalModulos) * 100}%`;
    
    if (globalProgressPct) globalProgressPct.textContent = `${progressoGlobal}%`;
    if (globalProgressFill) globalProgressFill.style.width = `${progressoGlobal}%`;

    if (typeof window.setSidebarProgress === 'function') {
        window.setSidebarProgress(progressoGlobal);
    }
}

function updateContinueLearning(modulos) {
    const user = JSON.parse(localStorage.getItem('tm_user')) || {};
    
    let trilhaPlana = [];
    modulos.forEach(modulo => {
        const ehIntro = modulo.isIntro;
        modulo.trilha.forEach(item => {
            
            const status = (ehIntro && user.onboarding_concluido) ? 'concluido' : item.status;
            trilhaPlana.push({
                ...item,
                status,
                moduloId: modulo.id,
                moduloTitulo: modulo.titulo
            });
        });
    });

    const itemAtual = trilhaPlana.find(i => i.status !== 'concluido') || trilhaPlana[trilhaPlana.length - 1];
    
    const titleEl = document.getElementById('continue-mod-title');
    const subEl = document.getElementById('continue-aula-title');
    const btnContinue = document.getElementById('btn-continue');

    if (itemAtual) {
        if (titleEl) titleEl.textContent = itemAtual.moduloTitulo;
        if (subEl) subEl.textContent = itemAtual.titulo;
        
        if (btnContinue) {
            
            btnContinue.onclick = (e) => {
                e.preventDefault();
                handleItemClick(itemAtual);
            };
        }
    }
}

function ensureModuleContentModal() {
    let overlay = document.getElementById('module-content-modal');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'module-content-modal';
    overlay.className = 'modal-overlay content-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="modal content-modal" role="dialog" aria-modal="true" aria-labelledby="module-content-title">
            <div class="content-modal-header">
                <div>
                    <span class="content-modal-kicker">Conteúdos do módulo</span>
                    <h2 class="content-modal-title" id="module-content-title"></h2>
                    <p class="content-modal-desc" id="module-content-desc"></p>
                </div>
                <button class="content-modal-close" type="button" aria-label="Fechar modal">
                    ${window.icons && icons.x ? icons.x : '&times;'}
                </button>
            </div>
            <div class="content-modal-progress">
                <p><span>Progresso</span> <strong id="module-content-progress-text">0%</strong></p>
                <div class="s-progress-bar">
                    <div class="s-progress-fill" id="module-content-progress-fill" style="width:0%;"></div>
                </div>
            </div>
            <div class="content-modal-list" id="module-content-list"></div>
        </div>
    `;

    const closeModal = () => {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
    });
    overlay.querySelector('.content-modal-close')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    document.body.appendChild(overlay);
    return overlay;
}

function openModuleContentModal({ title, description, progress, color, aulasHTML }) {
    const overlay = ensureModuleContentModal();
    const titleEl = overlay.querySelector('#module-content-title');
    const descEl = overlay.querySelector('#module-content-desc');
    const progressText = overlay.querySelector('#module-content-progress-text');
    const progressFill = overlay.querySelector('#module-content-progress-fill');
    const listEl = overlay.querySelector('#module-content-list');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description || 'Conteúdos da formação.';
    if (progressText) progressText.textContent = `${progress}%`;
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
        progressFill.style.background = color || 'var(--primary)';
    }
    if (listEl) listEl.innerHTML = aulasHTML;

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    overlay.querySelector('.content-modal-close')?.focus();
}

function getContentTopicTitle(item) {
    if (item.tipo === 'aula') return item.titulo;
    return item.titulo.replace(/^Prática\s+[^:]+:\s*/i, '');
}

function getContentItemLabel(item, isIntro) {
    if (item.tipo === 'aula') {
        return isIntro ? 'Introdução' : `Aula ${item.ordem}`;
    }

    const match = item.titulo.match(/^(Prática\s+[^:]+)/i);
    return match ? match[1] : 'Prática';
}

function buildContentActionHtml(item, isItemLocked, isItemDone, isIntro) {
    let btnText = 'Iniciar';
    let btnClass = 'btn-primary';
    let btnAttr = '';

    if (isItemDone) {
        btnText = item.tipo === 'pratica' ? 'Fazer novamente' : 'Assistir novamente';
        btnClass = 'btn-outline';
    } else if (isItemLocked) {
        const lockIcon = window.icons ? icons.lock.replace(/width="24"/, 'width="14"').replace(/height="24"/, 'height="14"') : '';
        btnText = `Bloqueado <span style="margin-left: 0.35rem; display: inline-flex; align-items: center; vertical-align: middle;">${lockIcon}</span>`;
        btnClass = 'btn-locked';
        btnAttr = 'disabled';
    }

    const isPratica = item.tipo === 'pratica';
    let link;
    if (isPratica) {
        link = `praticas.html?id=${item.id}`;
    } else if (isIntro) {
        link = 'introducao.html';
    } else {
        link = `aula.html?id=${item.id}`;
    }
    const storageKey = isPratica ? 'tm_current_pratica_id' : 'tm_current_aula_id';
    return isItemLocked
        ? `<button class="btn ${btnClass} btn-sm" ${btnAttr} style="opacity: 0.6; background: transparent; border: 1px solid var(--border); color: var(--text-muted); cursor: not-allowed;">${btnText}</button>`
        : `<a href="${link}" class="btn ${btnClass} btn-sm" onclick="sessionStorage.setItem('${storageKey}', '${item.id}')">${btnText}</a>`;
}

function renderHomeModulesGrid(modulos) {
    const gridEl = document.getElementById('home-modules-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';
    
    let currentFound = false;
    let pendingReturnModal = null;
    const returnModuleId = sessionStorage.getItem('tm_return_module_id');
    const returnAulaId = sessionStorage.getItem('tm_return_aula_id');

    modulos.forEach(mod => {
        const ehIntro = mod.isIntro;
        const user = typeof TeacherMakersApi !== 'undefined' ? TeacherMakersApi.getUser() : {};
        const forcarModuloConcluido = ehIntro && user.onboarding_concluido;

        
        const cleanTitle = ehIntro ? 'Introdução' : 'Módulo ' + mod.id + ': ' + mod.titulo.replace(/^Módulo\s+\d+:\s*/i, '');
        
        
        const trilha = mod.trilha || [];
        const totalItens = trilha.length;
        const itensConcluidos = forcarModuloConcluido ? totalItens : trilha.filter(item => item.status === 'concluido').length;
        const progresso = totalItens ? Math.round((itensConcluidos / totalItens) * 100) : (forcarModuloConcluido ? 100 : 0);
        
        const moduloConcluido = forcarModuloConcluido || progresso === 100;
        const moduloAtual = !moduloConcluido && (progresso > 0 || trilha.some(item => item.status !== 'concluido') && !currentFound);
        
        
        const el = document.createElement('div');
        el.className = 'syllabus-card';
        
        
        let aulasHTML = '<div class="module-modal-drawers">';
        
        for (let i = 0; i < trilha.length; i++) {
            const item = trilha[i];
            const groupItems = [item];

            if (item.tipo === 'aula' && trilha[i + 1]?.tipo === 'pratica') {
                groupItems.push(trilha[i + 1]);
                i++;
            }

            let grupoTemAtual = false;
            let grupoConcluido = true;
            const groupRows = groupItems.map(groupItem => {
                const itemConcluido = forcarModuloConcluido || groupItem.status === 'concluido';
                const itemAtualCheck = !forcarModuloConcluido && !currentFound && groupItem.status !== 'concluido';
                if (itemAtualCheck) currentFound = true;

                const itemBloqueado = !itemConcluido && !itemAtualCheck;
                const actionHtml = buildContentActionHtml(groupItem, itemBloqueado, itemConcluido, ehIntro);
                grupoTemAtual = grupoTemAtual || itemAtualCheck;
                grupoConcluido = grupoConcluido && itemConcluido;

                return `
                    <div class="module-drawer-row ${itemConcluido ? 'done' : ''} ${itemAtualCheck ? 'current' : ''}">
                        <div class="module-drawer-info">
                            <span class="aula-module-tag">${groupItem.tipo === 'pratica' ? 'Prática' : 'Aula'}</span>
                            <p class="aula-title">${getContentItemLabel(groupItem, ehIntro)}</p>
                        </div>
                        <div class="aula-action">
                            ${actionHtml}
                        </div>
                    </div>
                `;
            }).join('');

            const topicTitle = getContentTopicTitle(item);
            const statusTopico = grupoConcluido ? 'Concluído' : (grupoTemAtual ? 'Em andamento' : '');
            const drawerIcon = window.icons ? icons.chevronDown : '';
            const shouldOpenOnReturn = returnAulaId && groupItems.some(groupItem => groupItem.tipo === 'aula' && String(groupItem.id) === String(returnAulaId));

            aulasHTML += `
                <details class="module-content-drawer ${grupoConcluido ? 'done' : ''} ${grupoTemAtual ? 'current' : ''}" ${shouldOpenOnReturn ? 'open' : ''}>
                    <summary>
                        <span class="module-drawer-title">${topicTitle}</span>
                        <span class="module-drawer-status">${statusTopico}</span>
                        <span class="module-drawer-icon">${drawerIcon}</span>
                    </summary>
                    <div class="module-drawer-body">
                        ${groupRows}
                    </div>
                </details>
            `;
        }
        aulasHTML += '</div>';

        
        let statusBadge = '';
        if (moduloConcluido) statusBadge = '<span class="syllabus-badge badge-done">Concluído</span>';
        else if (moduloAtual) statusBadge = '<span class="syllabus-badge badge-current">Em Andamento</span>';

        const moduloBloqueado = !moduloConcluido && !moduloAtual && !ehIntro;

        
        let modBtnText = 'Iniciar';
        let modBtnClass = 'btn-primary';
        let modBtnAttr = '';

        if (moduloConcluido) {
            modBtnText = 'Ver conteúdos';
            modBtnClass = 'btn-outline';
        } else if (moduloBloqueado) {
            const lockIcon = window.icons ? icons.lock.replace(/width="24"/, 'width="14"').replace(/height="24"/, 'height="14"') : '';
            modBtnText = `Bloqueado <span style="margin-left: 0.35rem; display: inline-flex; align-items: center; vertical-align: middle;">${lockIcon}</span>`;
            modBtnClass = 'btn-locked';
            modBtnAttr = 'disabled';
        }

        if (!moduloBloqueado && !moduloConcluido) {
            modBtnText = moduloAtual ? 'Continuar' : 'Ver conteúdos';
        }

        const openIcon = window.icons && icons.arrowRight ? icons.arrowRight : '';
        
        el.innerHTML = `
            <div class="syllabus-header" style="align-items:flex-start; flex-direction:column; gap:1.2rem;">
                <div class="syllabus-info" style="width: 100%;">
                    <div class="syllabus-badge-row">
                        ${statusBadge}
                    </div>
                    <h3 class="syllabus-title">${cleanTitle}</h3>
                    <p class="syllabus-desc" style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">${mod.descricao || 'Conteúdos da formação.'}</p>
                </div>
                
                <div class="syllabus-progress" style="width: 100%;">
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.35rem; display:flex; justify-content:space-between;"><span>Progresso</span> <span>${progresso}%</span></p>
                    <div class="s-progress-bar" style="width: 100%; display: block; height: 8px;">
                        <div class="s-progress-fill" style="width:${progresso}%; background:${mod.cor || 'var(--primary)'}; height: 100%;"></div>
                    </div>
                </div>

                <div class="aula-action" style="width: 100%;">
                    <button class="btn ${modBtnClass} btn-sm module-action-btn" ${modBtnAttr} style="display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; ${moduloBloqueado ? 'opacity:0.6; cursor:not-allowed;' : ''}">${modBtnText} ${!moduloBloqueado ? openIcon : ''}</button>
                </div>
            </div>
        `;

        const header = el.querySelector('.syllabus-header');
        const modBtn = el.querySelector('.module-action-btn');
        
        const openModal = (e) => {
            if (e) e.stopPropagation();
            if (!moduloBloqueado) {
                openModuleContentModal({
                    title: cleanTitle,
                    description: mod.descricao,
                    progress: progresso,
                    color: mod.cor,
                    aulasHTML
                });
            }
        };

        header.style.cursor = moduloBloqueado ? 'default' : 'pointer';
        header.addEventListener('click', openModal);
        modBtn?.addEventListener('click', openModal);
        
        gridEl.appendChild(el);

        if (returnModuleId && String(mod.id) === String(returnModuleId)) {
            pendingReturnModal = {
                title: cleanTitle,
                description: mod.descricao,
                progress: progresso,
                color: mod.cor,
                aulasHTML
            };
        }
    });

    if (pendingReturnModal) {
        openModuleContentModal(pendingReturnModal);
        sessionStorage.removeItem('tm_return_module_id');
        sessionStorage.removeItem('tm_return_aula_id');
    }
}

function handleItemClick(item) {

    
    if (item.id === undefined || item.id === null) {
        alert('Erro: Este item não possui um ID válido no banco de dados.');
        return;
    }

    if (item.tipo === 'aula') {
        sessionStorage.setItem('tm_current_aula_id', item.id);
        window.location.href = `aula.html?id=${item.id}`;
    } else {
        sessionStorage.setItem('tm_current_pratica_id', item.id);
        window.location.href = `praticas.html?id=${item.id}`;
    }
}
