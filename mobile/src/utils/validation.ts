import { PersonKind } from '../types';
import { isValidEmail } from './helpers';

export type FormErrors<T extends string = string> = Partial<Record<T, string>>;

export function validatePost(values: { title: string; content: string; author: string }) {
  const errors: FormErrors<'title' | 'content' | 'author'> = {};
  if (values.title.trim().length < 3) errors.title = 'Informe um título com ao menos 3 caracteres.';
  if (values.author.trim().length < 2) errors.author = 'Informe o autor.';
  if (values.content.trim().length < 10) errors.content = 'O conteúdo precisa ter ao menos 10 caracteres.';
  return errors;
}

export function validatePerson(
  kind: PersonKind,
  values: { name: string; email: string; password: string; extra: string },
  isEditing: boolean,
) {
  const errors: FormErrors<'name' | 'email' | 'password' | 'extra'> = {};
  if (values.name.trim().length < 3) errors.name = 'Informe o nome completo.';
  if (!isValidEmail(values.email)) errors.email = 'Informe um e-mail válido.';
  if (!isEditing && values.password.length < 6) errors.password = 'A senha deve ter ao menos 6 caracteres.';
  if (isEditing && values.password && values.password.length < 6)
    errors.password = 'A nova senha deve ter ao menos 6 caracteres.';
  if (!values.extra.trim())
    errors.extra = kind === 'teachers' ? 'Informe a disciplina.' : 'Informe a turma.';
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
