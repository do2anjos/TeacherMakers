document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const cadastroForm = document.getElementById('cadastro-form');

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  
  const mostrarAlerta = (formAlertEl, mensagem, ehErro = true) => {
    formAlertEl.textContent = mensagem;
    formAlertEl.style.display = 'block';
    
    if (ehErro) {
      formAlertEl.style.backgroundColor = '#fee2e2'; 
      formAlertEl.style.color = '#b91c1c'; 
      formAlertEl.style.border = '1px solid #f87171'; 
    } else {
      formAlertEl.style.backgroundColor = '#d1fae5'; 
      formAlertEl.style.color = '#047857'; 
      formAlertEl.style.border = '1px solid #34d399'; 
    }
  };

  
  const configurarBotaoCarregando = (btn, carregando) => {
    if (carregando) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: toast-spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Carregando...`;
      btn.disabled = true;
      btn.style.opacity = '0.7';
    } else {
      btn.innerHTML = btn.dataset.originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  };

  
  
  
  if (loginForm) {
    const alertBox = document.getElementById('form-alert');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email').value.trim();
      const passwordInput = document.getElementById('password').value.trim();
      const submitBtn = document.getElementById('submit-btn');

      
      if (!emailInput || !passwordInput) {
        mostrarAlerta(alertBox, 'Por favor, preencha todos os campos.', true);
        return;
      }

      if (!emailRegex.test(emailInput)) {
        mostrarAlerta(alertBox, 'Por favor, insira um e-mail válido.', true);
        return;
      }

      
      configurarBotaoCarregando(submitBtn, true);
      alertBox.style.display = 'none';

      try {
        const dados = await TeacherMakersApi.login(emailInput, passwordInput);
        const user = dados.usuario;
        const urlDestino = user.onboarding_concluido ? 'home.html' : 'introducao.html';

        mostrarAlerta(alertBox, 'Login realizado com sucesso! Redirecionando...', false);
        setTimeout(() => {
          window.location.href = urlDestino;
        }, 700);
      } catch (erro) {
        mostrarAlerta(alertBox, erro.message, true);
      } finally {
        configurarBotaoCarregando(submitBtn, false);
      }
    });
  }

  
  
  
  if (cadastroForm) {
    const alertBox = document.getElementById('form-alert');

    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('name').value.trim();
      const emailInput = document.getElementById('email').value.trim();
      const nivelSelect = document.getElementById('nivel-ensino').value;
      const passInput = document.getElementById('password').value;
      const confirmPassInput = document.getElementById('confirm-password').value;
      const submitBtn = document.getElementById('submit-btn');

      
      if (!nameInput || !emailInput || !nivelSelect || !passInput || !confirmPassInput) {
        mostrarAlerta(alertBox, 'Todos os campos são obrigatórios.', true);
        return;
      }

      if (!emailRegex.test(emailInput)) {
        mostrarAlerta(alertBox, 'Insira um e-mail válido.', true);
        return;
      }

      if (passInput.length < 6) {
        mostrarAlerta(alertBox, 'A senha deve ter pelo menos 6 caracteres.', true);
        return;
      }

      if (passInput !== confirmPassInput) {
        mostrarAlerta(alertBox, 'As senhas não coincidem.', true);
        return;
      }

      
      configurarBotaoCarregando(submitBtn, true);
      alertBox.style.display = 'none';

      try {
        await TeacherMakersApi.register({
          nome: nameInput,
          email: emailInput,
          senha: passInput,
          nivel_ensino: nivelSelect
        });

        mostrarAlerta(alertBox, 'Conta criada com sucesso! Redirecionando para o login...', false);

        setTimeout(() => {
          window.location.href = 'Login.html';
        }, 1500);
      } catch (erro) {
        mostrarAlerta(alertBox, erro.message, true);
      } finally {
        configurarBotaoCarregando(submitBtn, false);
      }
    });
  }

});
