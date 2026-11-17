import { api } from './api';
import { LoginResponse } from '../types';

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email: email.trim(), password }),
};
