export interface AuthUser {
  id: string
  email: string | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput {
  email: string
  password: string
}

export interface IAuthService {
  getCurrentUser(): Promise<AuthUser | null>
  login(input: LoginInput): Promise<AuthUser>
  signup(input: SignupInput): Promise<AuthUser>
  logout(): Promise<void>
}


