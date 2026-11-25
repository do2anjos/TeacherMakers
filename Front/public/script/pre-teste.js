document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('diagnostic-form');
  const alertBox = document.getElementById('diagnostic-alert');
  const loading = document.getElementById('diagnostic-loading');
  const questionHeading = document.getElementById('diagnostic-question');
  const options = document.getElementById('diagnostic-options');
  const progress = document.getElementById('diagnostic-progress');
  const back = document.getElementById('diagnostic-back');
  const next = document.getElementById('diagnostic-next');
  const submit = document.getElementById('diagnostic-submit');
  const review = document.getElementById('diagnostic-review');
  const reviewList = document.getElementById('diagnostic-review-list');

  if (!TeacherMakersApi.isAuthenticated()) { window.location.href = 'Login.html'; return; }

  let questions = [];
  let answers = {};
  let index = 0;
  const showError = (message) => {
    alertBox.textContent = message;
    alertBox.hidden = false;
  };

  try {
    const attempt = await TeacherMakersApi.getDiagnostic();
    if (attempt.status === 'completed') {
      showReview(attempt);
      return;
    }
    questions = attempt.questions || [];
    answers = attempt.answers || {};
    if (questions.length !== 10) throw new Error('O conteúdo aprovado do questionário não está disponível. O onboarding não foi concluído.');
    loading.hidden = true;
    form.hidden = false;
    render();
  } catch (error) {
    loading.hidden = true;
    showError(error.message || 'Não foi possível carregar o pré-teste. Tente novamente mais tarde.');
  }

  function render() {
    const question = questions[index];
    questionHeading.textContent = question.prompt;
    progress.textContent = `Questão ${index + 1} de ${questions.length}`;
    back.disabled = index === 0;
    next.hidden = index === questions.length - 1;
    submit.hidden = index !== questions.length - 1;
    options.replaceChildren();
    question.options.forEach((option, optionIndex) => {
      const label = document.createElement('label');
      label.className = 'diagnostic-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question-${question.id}`;
      input.value = option.id;
      input.required = true;
      input.checked = answers[question.id] === option.id;
      label.append(input, document.createTextNode(option.label));
      options.appendChild(label);
    });
    questionHeading.focus?.();
  }

  options.addEventListener('change', (event) => {
    if (event.target.matches('input[type="radio"]')) answers[questions[index].id] = event.target.value;
  });
  back.addEventListener('click', () => { if (index > 0) { index--; render(); } });
  next.addEventListener('click', () => {
    if (!answers[questions[index].id]) { showError('Selecione uma resposta para continuar.'); return; }
    index++;
    alertBox.hidden = true;
    render();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (questions.some((question) => !answers[question.id])) { showError('Responda às 10 questões antes de concluir.'); return; }
    submit.disabled = true;
    submit.textContent = 'Salvando…';
    try {
      await TeacherMakersApi.submitDiagnostic(questions.map((question) => ({ questionId: question.id, optionId: answers[question.id] })));
      showReview({ questions, answers });
    } catch (error) {
      submit.disabled = false;
      submit.textContent = 'Concluir pré-teste';
      showError(error.message || 'Não foi possível registrar suas respostas.');
    }
  });

  function showReview(attempt) {
    form.hidden = true;
    loading.hidden = true;
    alertBox.hidden = true;

    const response = attempt.answers || {};
    const items = (attempt.questions || []).map((question, position) => {
      const escolhida = response[question.id];
      const opcao = (question.options || []).find((option) => option.id === escolhida);
      const rotulo = opcao ? `${opcao.id}) ${opcao.label}` : 'Não respondida';
      return `
        <article class="diagnostic-review-item">
          <h3>${position + 1}. ${question.prompt}</h3>
          <p class="diagnostic-review-answer">Sua resposta: ${rotulo}</p>
        </article>
      `;
    });

    reviewList.innerHTML = items.join('') || '<p>Suas respostas não estão disponíveis no momento.</p>';
    document.getElementById('diagnostic-review-home').href =
      TeacherMakersApi.getUser().onboarding_concluido ? 'home.html' : 'introducao.html';
    review.hidden = false;
    document.getElementById('diagnostic-review-title').focus?.();
  }
});