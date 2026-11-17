import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { AuthProvider } from '../src/context/AuthContext';
import LoginScreen from '../src/screens/LoginScreen';
import { authService } from '../src/services/authService';

jest.mock('../src/services/authService');
const mockedLogin = authService.login as jest.Mock;

async function renderLogin() {
  await render(
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>,
  );
}

describe('LoginScreen', () => {
  beforeEach(() => mockedLogin.mockReset());

  it('mostra erros de validação sem chamar a API', async () => {
    await renderLogin();
    await fireEvent.press(await screen.findByTestId('login-submit'));
    expect(await screen.findByText('Informe um e-mail válido.')).toBeTruthy();
    expect(screen.getByText('Informe a senha.')).toBeTruthy();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('chama a API com as credenciais informadas', async () => {
    mockedLogin.mockResolvedValue({
      token: 't',
      user: { id: 1, name: 'Ana', email: 'prof@fiap.com', role: 'teacher' },
    });
    await renderLogin();
    await fireEvent.changeText(await screen.findByTestId('login-email'), 'prof@fiap.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), '123456');
    await fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() => expect(mockedLogin).toHaveBeenCalledWith('prof@fiap.com', '123456'));
  });

  it('exibe a mensagem de erro retornada pela API', async () => {
    mockedLogin.mockRejectedValue(new Error('E-mail ou senha inválidos.'));
    await renderLogin();
    await fireEvent.changeText(await screen.findByTestId('login-email'), 'prof@fiap.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'errada');
    await fireEvent.press(screen.getByTestId('login-submit'));
    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
  });
});
