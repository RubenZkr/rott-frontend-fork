import api from './api';

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

    publish: async (id, availableFrom = null, availableUntil = null) => {
        const data = {};
        if (availableFrom) data.available_from = availableFrom;
        if (availableUntil) data.available_until = availableUntil;
        const response = await api.post(`/api/quizzes/${id}/publish`, Object.keys(data).length > 0 ? data : null);
        return response.data;
    },

    unpublish: async (id) => {
        const response = await api.post(`/api/quizzes/${id}/unpublish`);
        return response.data;
    },

    updateAvailability: async (id, availableFrom, availableUntil) => {
        const response = await api.patch(`/api/quizzes/${id}/availability`, {
            available_from: availableFrom,
            available_until: availableUntil
        });
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

    regenerateQuestion: async (quizId, questionId) => {
        const response = await api.post(`/api/quizzes/${quizId}/regenerate_question/${questionId}`);
        return response.data;
    },
};

// Attempts (Student quiz taking)
export const attemptService = {
    // FIXED: Changed from /api/quizzes/{quizId}/start to /api/attempts/quizzes/{quizId}/start
    startAttempt: async (quizId) => {
        const response = await api.post(`/api/attempts/quizzes/${quizId}/start`);
        return response.data;
    },

    // FIXED: Backend expects a direct array, not {answers: [...]}
    submitAnswers: async (attemptId, answers) => {
        const response = await api.post(`/api/attempts/${attemptId}/submit`, answers);
        return response.data;
    },

    getResults: async (attemptId) => {
        const response = await api.get(`/api/attempts/${attemptId}/results`);
        return response.data;
    },

    // FIXED: Changed from /api/attempts/my-attempts to /api/attempts/user/me
    getMyAttempts: async (quizId = null) => {
        let url = '/api/attempts/user/me';
        if (quizId) {
            url += `?quiz_id=${quizId}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    getAttempt: async (attemptId) => {
        const response = await api.get(`/api/attempts/${attemptId}`);
        return response.data;
    },
};

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

    // NEW: Get all students overview for teacher dashboard
    getTeacherDashboard: async (subjectId = null) => {
        let url = '/api/dashboard/teacher/students';
        if (subjectId) {
            url += `?subject_id=${subjectId}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    // NEW: Export students to CSV
    exportStudentsCSV: async (subjectId = null) => {
        let url = '/api/dashboard/teacher/students/export';
        if (subjectId) {
            url += `?subject_id=${subjectId}`;
        }
        const response = await api.get(url, {
            responseType: 'blob',
        });
        return response.data;
    },
};
