import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { authService } from '../src/services/authService';

jest.mock('../src/services/authService');
const mockedLogin = authService.login as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockedLogin.mockReset();
});

describe('AuthContext', () => {
  it('professor autenticado tem permissão de professor e a sessão é persistida', async () => {
    mockedLogin.mockResolvedValue({
      token: 't',
      user: { id: 1, name: 'Ana', email: 'prof@fiap.com', role: 'teacher' },
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('prof@fiap.com', '123456');
    });

    expect(result.current.isTeacher).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(await AsyncStorage.getItem('@blog/session')).toContain('prof@fiap.com');
  });

  it('aluno não é professor', async () => {
    mockedLogin.mockResolvedValue({
      token: 't',
      user: { id: 2, name: 'João', email: 'aluno@fiap.com', role: 'student' },
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.login('aluno@fiap.com', '123456');
    });
    expect(result.current.isTeacher).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('restaura a sessão salva e o logout limpa usuário e armazenamento', async () => {
    await AsyncStorage.setItem(
      '@blog/session',
      JSON.stringify({ token: 't', user: { id: 1, name: 'Ana', email: 'a@a.com', role: 'teacher' } }),
    );
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(await AsyncStorage.getItem('@blog/session')).toBeNull();
  });

  it('login inválido propaga o erro e não autentica', async () => {
    mockedLogin.mockRejectedValue(new Error('E-mail ou senha inválidos.'));
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await expect(result.current.login('x@x.com', 'errada')).rejects.toThrow('inválidos');
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
