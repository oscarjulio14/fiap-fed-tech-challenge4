import { formatDate, isValidEmail, summarize } from '../src/utils/helpers';
import { hasErrors, validatePerson, validatePost } from '../src/utils/validation';

describe('helpers', () => {
  it('resume textos longos com reticências', () => {
    const text = 'a'.repeat(200);
    const result = summarize(text, 50);
    expect(result.length).toBeLessThanOrEqual(51);
    expect(result.endsWith('…')).toBe(true);
  });

  it('mantém textos curtos e normaliza espaços', () => {
    expect(summarize('  olá   mundo  ')).toBe('olá mundo');
  });

  it('valida e-mails', () => {
    expect(isValidEmail('prof@fiap.com')).toBe(true);
    expect(isValidEmail('prof@fiap')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('retorna string vazia para data inválida', () => {
    expect(formatDate('não-é-data')).toBe('');
  });
});

describe('validation', () => {
  it('rejeita post incompleto', () => {
    const errors = validatePost({ title: '', content: 'curto', author: '' });
    expect(Object.keys(errors).sort()).toEqual(['author', 'content', 'title']);
  });

  it('aceita post válido', () => {
    expect(hasErrors(validatePost({ title: 'Título', content: 'Conteúdo suficiente', author: 'Ana' }))).toBe(false);
  });

  it('exige senha apenas no cadastro, não na edição', () => {
    const values = { name: 'Fulano de Tal', email: 'f@fiap.com', password: '', extra: 'Mobile' };
    expect(validatePerson('teachers', values, false).password).toBeDefined();
    expect(validatePerson('teachers', values, true).password).toBeUndefined();
  });

  it('usa a mensagem correta para o campo extra', () => {
    const values = { name: 'Fulano de Tal', email: 'f@fiap.com', password: '123456', extra: '' };
    expect(validatePerson('teachers', values, false).extra).toMatch(/disciplina/i);
    expect(validatePerson('students', values, false).extra).toMatch(/turma/i);
  });
});
