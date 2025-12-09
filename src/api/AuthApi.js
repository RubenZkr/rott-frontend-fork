import { fetchApi } from '@/api/BaseApi';

export const login = (email, password) => fetchApi('/auth/login', 'POST', { email, password });
