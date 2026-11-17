import { api } from './api';
import { Comment, Post, PostInput } from '../types';

export const postService = {
  list: (query = '') => {
    const q = query.trim();
    return api.get<Post[]>(q ? `/posts?q=${encodeURIComponent(q)}` : '/posts');
  },
  get: (id: number) => api.get<Post>(`/posts/${id}`),
  create: (input: PostInput) => api.post<Post>('/posts', input),
  update: (id: number, input: PostInput) => api.put<Post>(`/posts/${id}`, input),
  remove: (id: number) => api.delete(`/posts/${id}`),

  comments: (postId: number) => api.get<Comment[]>(`/posts/${postId}/comments`),
  addComment: (postId: number, text: string) =>
    api.post<Comment>(`/posts/${postId}/comments`, { text }),
};
