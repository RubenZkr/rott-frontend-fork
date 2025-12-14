import api from './api';

// Authentication
export const authService = {
    login: async (username, password) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await api.post('/api/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },
};

// Subjects
export const subjectService = {
    getAll: async () => {
        const response = await api.get('/api/subjects');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/subjects/${id}`);
        return response.data;
    },

    create: async (subjectData) => {
        const response = await api.post('/api/subjects', subjectData);
        return response.data;
    },

    update: async (id, subjectData) => {
        const response = await api.patch(`/api/subjects/${id}`, subjectData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/subjects/${id}`);
        return response.data;
    },
};

// Quizzes
export const quizService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.subject_id) params.append('subject_id', filters.subject_id);
        if (filters.status) params.append('status', filters.status);

        const response = await api.get(`/api/quizzes?${params.toString()}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/quizzes/${id}`);
        return response.data;
    },

    generate: async (formData) => {
        const response = await api.post('/api/quizzes/generate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    publish: async (id) => {
        const response = await api.post(`/api/quizzes/${id}/publish`);
        return response.data;
    },

    update: async (id, quizData) => {
        const response = await api.patch(`/api/quizzes/${id}`, quizData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/quizzes/${id}`);
        return response.data;
    },

    exportCSV: async (id) => {
        const response = await api.get(`/api/quizzes/${id}/export`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

// Attempts (Student quiz taking)
export const attemptService = {
    startAttempt: async (quizId) => {
        const response = await api.post(`/api/quizzes/${quizId}/start`);
        return response.data;
    },

    submitAnswers: async (attemptId, answers) => {
        const response = await api.post(`/api/attempts/${attemptId}/submit`, {
            answers,
        });
        return response.data;
    },

    getResults: async (attemptId) => {
        const response = await api.get(`/api/attempts/${attemptId}/results`);
        return response.data;
    },

    getMyAttempts: async () => {
        const response = await api.get('/api/attempts/my-attempts');
        return response.data;
    },
};

// Dashboard
export const dashboardService = {
    getStudentDashboard: async () => {
        const response = await api.get('/api/dashboard/student');
        return response.data;
    },

    getQuizStats: async (quizId) => {
        const response = await api.get(`/api/dashboard/teacher/quiz/${quizId}`);
        return response.data;
    },

    getSubjectStats: async (subjectId) => {
        const response = await api.get(`/api/dashboard/teacher/subject/${subjectId}`);
        return response.data;
    },

    getStudentProgress: async (studentId) => {
        const response = await api.get(`/api/dashboard/teacher/student/${studentId}`);
        return response.data;
    },
};
