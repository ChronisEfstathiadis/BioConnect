// Remove Supabase types - not needed with Auth0
export interface AuthError {
  name: string;
  message: string;
  status?: number;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface SignUpParams {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}
