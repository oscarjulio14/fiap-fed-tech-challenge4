import { API_URL, REQUEST_TIMEOUT_MS } from '../config/env';

/** Erro padronizado das chamadas à API. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Define o token JWT enviado no header Authorization. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Registra callback executado quando a API responde 401 com token ativo (sessão expirada). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
      if (response.status === 401 && authToken && onUnauthorized) onUnauthorized();
      const message =
        (isMessageBody(data) && String(data.message)) ||
        `Erro ${response.status} ao comunicar com o servidor.`;
      throw new ApiError(message, response.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (__DEV__) console.warn(`[api] ${method} ${API_URL}${path} falhou:`, error);
    if ((error as Error)?.name === 'AbortError') {
      throw new ApiError('Tempo esgotado. Verifique sua conexão e tente novamente.', 0);
    }
    throw new ApiError(
      `Não foi possível conectar ao servidor (${API_URL}). Verifique se a API está em execução.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}

function isMessageBody(data: unknown): data is { message: unknown } {
  return typeof data === 'object' && data !== null && 'message' in data;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
};

/** Extrai uma mensagem amigável de qualquer erro capturado. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
