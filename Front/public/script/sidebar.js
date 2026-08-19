function calculateGlobalCourseProgress(modulos) {
  if (!Array.isArray(modulos) || !modulos.length) return 0;
  
  const user = typeof TeacherMakersApi !== 'undefined' ? TeacherMakersApi.getUser() : {};
  let totalItens = 0;
  let itensConcluidos = 0;

  modulos.forEach((modulo) => {
    const isIntro = modulo.isIntro;
    const trilha = Array.isArray(modulo.trilha) ? modulo.trilha : [];

    if (trilha.length) {
      totalItens += trilha.length;
      if (isIntro && user.onboarding_concluido) {
        itensConcluidos += trilha.length;
      } else {
        itensConcluidos += trilha.filter(item => item.status === 'concluido').length;
      }
      return;
    }

    if (typeof modulo.totalItens === 'number') {
      totalItens += modulo.totalItens;
      if (isIntro && user.onboarding_concluido) {
        itensConcluidos += modulo.totalItens;
      } else {
        itensConcluidos += Number(modulo.itensConcluidos) || 0;
      }
    }
  });

  return totalItens ? Math.round((itensConcluidos / totalItens) * 100) : 0;
}

function redirectToLogin() {
  window.location.href = 'Login.html';
}

function hydrateHeaderUser() {
  if (typeof TeacherMakersApi === 'undefined') return;

  const user = TeacherMakersApi.getUser();
  if (!user?.nome) return;

  const nameEls = document.querySelectorAll('.dash-header-user-name');
  nameEls.forEach((el) => {
    el.textContent = user.nome;
  });

  const avatarEls = document.querySelectorAll('.user-avatar');
  avatarEls.forEach((el) => {
    el.textContent = user.nome.charAt(0).toUpperCase();
  });

  const greetingTitle = document.querySelector('.dash-greeting-title');
  if (greetingTitle && greetingTitle.textContent.includes('Matheus')) {
    greetingTitle.textContent = `Olá, ${user.nome.split(' ')[0]}!`;
  }
}

function injectSidebar(activeId) {
  if (typeof TeacherMakersApi !== 'undefined' && !TeacherMakersApi.isAuthenticated()) {
    redirectToLogin();
    return;
  }

  hydrateHeaderUser();

  const dashHeader = document.querySelector('.dash-header');
  if (dashHeader) {
      const toggle = dashHeader.querySelector('.sidebar-toggle');
      if (toggle) toggle.style.display = 'none'; 
  }

  
  if (typeof icons !== 'undefined') {
    injectIcon('di-icon-certificado', icons.award);
  }

  updateSidebarProgress();
  
  (async function trySyncProgressFromApi() {
    if (typeof TeacherMakersApi !== 'undefined' && typeof TeacherMakersApi.getModulos === 'function') {
      try {
        const modulos = await TeacherMakersApi.getModulos();
        if (Array.isArray(modulos) && modulos.length) {
          const progressoGlobal = calculateGlobalCourseProgress(modulos);
          if (typeof window.setSidebarProgress === 'function') window.setSidebarProgress(progressoGlobal);
          return;
        }
      } catch (e) {
        
      }
    }
    
    try { updateSidebarProgress(); } catch (e) {  }
  })();
}

function updateSidebarProgress() {
    let completed = 0;
    
    const TOTAL_AULAS = 14;
    for (let i = 1; i <= TOTAL_AULAS; i++) {
        if (sessionStorage.getItem(`aula${i}_concluida`) === 'true') {
            completed++;
        }
    }
    const percent = Math.round((completed / TOTAL_AULAS) * 100);
    
    const pctEl = document.querySelector('.sidebar-progress-pct');
    const fillEl = document.querySelector('.sidebar-progress-fill');
    
  
  if (typeof window.setSidebarProgress === 'function') {
    window.setSidebarProgress(percent);
    return;
  }

  if (pctEl) pctEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
}

function setSidebarProgress(percent) {
  const pct = Math.round(Math.min(Math.max(Number(percent) || 0, 0), 100));
  const pctEl = document.querySelector('.sidebar-progress-pct');
  const fillEl = document.querySelector('.sidebar-progress-fill');

  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

window.calculateGlobalCourseProgress = calculateGlobalCourseProgress;
window.setSidebarProgress = setSidebarProgress;

window.updateSidebarProgress = updateSidebarProgress;

window.addEventListener('tm:progress-updated', () => {
  try { updateSidebarProgress(); } catch (e) {  }
});

window.addEventListener('storage', (e) => {
  if (!e.key) return;
  if (e.key.startsWith('aula') || e.key === 'tm_user' || e.key === 'teachermakers_token') {
    try { updateSidebarProgress(); } catch (err) {  }
  }
});

(function initGlobalHeader() {
    
    const avatarWrap = document.getElementById('avatar-wrap');
    const avatarBtn = document.getElementById('avatar-btn');

    if (avatarBtn && avatarWrap) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            avatarWrap.classList.toggle('open');
            avatarBtn.setAttribute('aria-expanded', avatarWrap.classList.contains('open'));
        });

        document.addEventListener('click', () => {
            avatarWrap.classList.remove('open');
            avatarBtn.setAttribute('aria-expanded', 'false');
        });
    }

    
    const diLogout = document.getElementById('di-logout');
    if (diLogout) {
        diLogout.addEventListener('click', () => {
            if (typeof TeacherMakersApi !== 'undefined') {
                TeacherMakersApi.logout();
            } else {
                localStorage.removeItem('teachermakers_token');
                localStorage.removeItem('teachermakers_user');
            }
            window.location.href = 'Login.html';
        });
    }

    
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
        
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
            darkToggle.checked = true;
        }
        
        darkToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark', darkToggle.checked);
            localStorage.setItem('theme', darkToggle.checked ? 'dark' : 'light');
        });
    }
})();
