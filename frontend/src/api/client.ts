const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json() as { data?: T; error?: string };

  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json.data as T;
}

export const api = {
  // Auth
  register: (body: { username: string; displayName: string; email: string; password: string; role?: string; bio?: string; avatar?: string }) =>
    request<{ user: import('../types.ts').PublicUser; token: string }>('/users/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (username: string, password: string) =>
    request<{ user: import('../types.ts').PublicUser; token: string }>('/users/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // Users
  getUsers: () => request<import('../types.ts').PublicUser[]>('/users'),
  getUser: (username: string) => request<import('../types.ts').PublicUser>(`/users/${username}`),
  followUser: (id: string) => request<{ following: boolean; followers: number }>(`/users/${id}/follow`, { method: 'POST' }),

  // Recipes
  getRecipes: (params?: { category?: string; tag?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<import('../types.ts').Recipe[]>(`/recipes${qs}`);
  },
  getRecipe: (id: string) => request<import('../types.ts').Recipe>(`/recipes/${id}`),
  createRecipe: (body: Partial<import('../types.ts').Recipe>) =>
    request<import('../types.ts').Recipe>('/recipes', { method: 'POST', body: JSON.stringify(body) }),
  likeRecipe: (id: string) => request<{ liked: boolean; count: number }>(`/recipes/${id}/like`, { method: 'POST' }),
  saveRecipe: (id: string) => request<{ saved: boolean; count: number }>(`/recipes/${id}/save`, { method: 'POST' }),
  commentRecipe: (id: string, content: string) =>
    request<import('../types.ts').Comment>(`/recipes/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Tips
  getTips: (params?: { category?: string; tag?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<import('../types.ts').Tip[]>(`/tips${qs}`);
  },
  getTip: (id: string) => request<import('../types.ts').Tip>(`/tips/${id}`),
  createTip: (body: Partial<import('../types.ts').Tip>) =>
    request<import('../types.ts').Tip>('/tips', { method: 'POST', body: JSON.stringify(body) }),
  likeTip: (id: string) => request<{ liked: boolean; count: number }>(`/tips/${id}/like`, { method: 'POST' }),
  saveTip: (id: string) => request<{ saved: boolean; count: number }>(`/tips/${id}/save`, { method: 'POST' }),
  commentTip: (id: string, content: string) =>
    request<import('../types.ts').Comment>(`/tips/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Posts / Feed
  getPosts: () => request<import('../types.ts').Post[]>('/posts'),
  createPost: (body: { content: string; type?: string; recipeId?: string; tipId?: string }) =>
    request<import('../types.ts').Post>('/posts', { method: 'POST', body: JSON.stringify(body) }),
  likePost: (id: string) => request<{ liked: boolean; count: number }>(`/posts/${id}/like`, { method: 'POST' }),
};
