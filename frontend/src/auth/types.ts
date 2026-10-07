export type User = { id: string; name: string; email: string };
export type Session = { token: string; user: User };
export type AuthMode = 'login' | 'register';
