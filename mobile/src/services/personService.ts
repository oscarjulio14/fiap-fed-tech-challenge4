import { api } from './api';
import { Paginated, Person, PersonInput, PersonKind } from '../types';

/** CRUD compartilhado entre professores (/teachers) e alunos (/students). */
export const personService = {
  list: (kind: PersonKind, page: number, limit: number) =>
    api.get<Paginated<Person>>(`/${kind}?page=${page}&limit=${limit}`),
  get: (kind: PersonKind, id: number) => api.get<Person>(`/${kind}/${id}`),
  create: (kind: PersonKind, input: PersonInput) => api.post<Person>(`/${kind}`, input),
  update: (kind: PersonKind, id: number, input: PersonInput) =>
    api.put<Person>(`/${kind}/${id}`, input),
  remove: (kind: PersonKind, id: number) => api.delete(`/${kind}/${id}`),
};
