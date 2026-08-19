document.addEventListener('DOMContentLoaded', () => {
  if (typeof icons !== 'undefined') {
    injectIcon('icon-waving', icons.waving);
    injectIcon('icon-target', icons.target);
    injectIcon('icon-map', icons.map);
    injectIcon('icon-settings', icons.settings);
    injectIcon('icon-award', icons.award);

    for (let i = 1; i <= 8; i++) {
      injectIcon('icon-chk-' + i, icons.check);
    }
  }

  
  const slides = document.querySelectorAll('.intro-slide');
  const dots = document.querySelectorAll('.intro-dot');
  const btnAnterior = document.getElementById('btn-prev');
  const btnProximo = document.getElementById('btn-next');

  if (!slides.length) return;

  let etapaAtual = 0;
  const maxEtapas = slides.length - 1;

  function updateSlides() {
    
    slides.forEach((sl, idx) => {
      sl.classList.remove('active', 'exit-left');
      if (idx < etapaAtual) sl.classList.add('exit-left');
    });

    
    slides[etapaAtual].classList.add('active');

    
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === etapaAtual);
    });

    
    if (btnAnterior) btnAnterior.disabled = etapaAtual === 0;

    if (btnProximo) {
      if (etapaAtual === maxEtapas) {
        btnProximo.textContent = 'Concluir';
      } else {
        btnProximo.textContent = 'Próximo';
      }
    }
  }

  if (btnProximo) {
    btnProximo.addEventListener('click', async () => {
      if (etapaAtual < maxEtapas) {
        etapaAtual++;
        updateSlides();
      } else {
        
        try {
          if (window.TeacherMakersApi) {
            await TeacherMakersApi.completeOnboarding();
            const user = TeacherMakersApi.getUser();
            if (user) {
              user.onboarding_concluido = 1;
              localStorage.setItem('tm_user', JSON.stringify(user));
            }
          }
          window.location.href = 'home.html';
        } catch (erro) {
          window.location.href = 'home.html';
        }
      }
    });
  }

  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      if (etapaAtual > 0) {
        etapaAtual--;
        updateSlides();
      }
    });
  }
  
  
  updateSlides();
});
