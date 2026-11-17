import { ApiError, api, setAuthToken } from '../src/services/api';
import { postService } from '../src/services/postService';
import { personService } from '../src/services/personService';

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

function respond(status: number, body?: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
  setAuthToken(null);
});

describe('api client', () => {
  it('envia o token JWT no header Authorization', async () => {
    setAuthToken('abc');
    respond(200, []);
    await api.get('/posts');
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });

  it('não envia Authorization sem login', async () => {
    respond(200, []);
    await api.get('/posts');
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('converte erro HTTP em ApiError com a mensagem do servidor', async () => {
    respond(403, { message: 'Apenas professores podem executar esta ação.' });
    await expect(api.post('/posts', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      message: 'Apenas professores podem executar esta ação.',
    });
  });

  it('trata 204 sem corpo', async () => {
    respond(204);
    await expect(api.delete('/posts/1')).resolves.toBeUndefined();
  });

  it('traduz falha de rede para mensagem amigável', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(api.get('/posts')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('services', () => {
  it('postService.list codifica o termo de busca', async () => {
    respond(200, []);
    await postService.list('react native');
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/posts\?q=react%20native$/);
  });

  it('postService.list sem termo não envia query', async () => {
    respond(200, []);
    await postService.list('  ');
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/posts$/);
  });

  it('personService.list envia paginação', async () => {
    respond(200, { data: [], page: 2, limit: 5, total: 0, totalPages: 1 });
    await personService.list('students', 2, 5);
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/students\?page=2&limit=5$/);
  });

  it('personService.update usa PUT na rota do tipo correto', async () => {
    respond(200, { id: 1 });
    await personService.update('teachers', 1, { name: 'A', email: 'a@a.com' });
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/teachers\/1$/);
    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
  });
});
