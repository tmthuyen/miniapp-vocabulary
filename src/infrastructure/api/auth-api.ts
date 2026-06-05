import { ApiResponse, FetchOptions, getUtil, postUtil } from '@/shared/utils/http';

export const login = async (body: {
  email: string;
  password: string;
}): Promise<
  ApiResponse<{
    user_id: string;
    full_name: string;
  }>
> => {
  return postUtil('/auth/login', { body: { ...body } } as FetchOptions);
};

export const signupWithEmail = async (body: {
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
}): Promise<ApiResponse<null>> => {
  // Implement signup logic here, e.g., call postUtil with the appropriate endpoint and body
  return postUtil('/auth/signup', { body: { ...body } } as FetchOptions);
};

export const logout = async (): Promise<ApiResponse<null>> => {
  return postUtil('/auth/logout');
};

export const getMe = async (
  options?: FetchOptions
): Promise<ApiResponse<{ id: string; avatar_url: string; full_name: string }>> => {
  return getUtil('/auth/me', options);
};
