export type Role = 'teacher' | 'student';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type PostInput = Pick<Post, 'title' | 'content' | 'author'>;

export interface Comment {
  id: number;
  postId: number;
  author: string;
  text: string;
  createdAt: string;
}

/** Professores e alunos compartilham o mesmo formato, mudando apenas o campo específico. */
export type PersonKind = 'teachers' | 'students';

export interface Person {
  id: number;
  name: string;
  email: string;
  /** Disciplina (professor) */
  subject?: string;
  /** Turma (aluno) */
  classGroup?: string;
}

export interface PersonInput {
  name: string;
  email: string;
  password?: string;
  subject?: string;
  classGroup?: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
