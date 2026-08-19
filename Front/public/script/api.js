const ehLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const URL_BASE = ehLocal
    ? 'http://localhost:5000/api'
    : 'https://teachermakers-back.onrender.com/api';

const TeacherMakersApi = {
    getToken: () => localStorage.getItem('tm_token'),

    isAuthenticated: () => !!localStorage.getItem('tm_token'),

    getUser: () => JSON.parse(localStorage.getItem('tm_user') || '{}'),

    setSession: (token, user) => {
        localStorage.setItem('tm_token', token);
        localStorage.setItem('tm_user', JSON.stringify(user));
    },

    logout: () => {
        localStorage.removeItem('tm_token');
        localStorage.removeItem('tm_user');
        window.location.href = 'index.html';
    },

    request: async (endpoint, options = {}) => {
        const token = TeacherMakersApi.getToken();

        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        } else {
            delete headers['Content-Type'];
        }

        const config = {
            ...options,
            headers
        };

        const resposta = await fetch(`${URL_BASE}${endpoint}`, config);
        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro na requisição');
        }

        return resultado.dados;
    },

    register: (dadosRegistro) => TeacherMakersApi.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dadosRegistro)
    }),

    login: async (email, senha) => {
        const dados = await TeacherMakersApi.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        if (dados && dados.token) {
            TeacherMakersApi.setSession(dados.token, dados.usuario);
        }

        return dados;
    },

    completeOnboarding: () => TeacherMakersApi.request('/auth/onboarding', {
        method: 'PATCH'
    }),

    getModulos: () => TeacherMakersApi.request('/content/modulos'),

    getAulas: (moduloId) => TeacherMakersApi.request(`/content/modulos/${moduloId}/aulas`),

    getAulaDetalhes: (aulaId) => TeacherMakersApi.request(`/content/aulas/${aulaId}`),

    getPraticaDetalhes: (praticaId) => TeacherMakersApi.request(`/content/praticas/${praticaId}`),

    getPraticas: (moduloId) => TeacherMakersApi.request(`/content/modulos/${moduloId}/praticas`),

    concluirAula: (aulaId) => TeacherMakersApi.request(`/progress/aula/${aulaId}/complete`, {
        method: 'POST'
    }),

    submeterQuiz: (questaoId, opcaoId) => TeacherMakersApi.request('/progress/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ questaoId, opcaoId })
    }),

    finalizarPratica: (praticaId, diarioBordo, fotoBlob) => {
        const formData = new FormData();
        formData.append('praticaId', praticaId);
        formData.append('diarioBordo', diarioBordo);
        if (fotoBlob) formData.append('foto', fotoBlob);

        return TeacherMakersApi.request('/progress/pratica/finish', {
            method: 'POST',
            body: formData
        });
    }
};

window.TeacherMakersApi = TeacherMakersApi;
