import { ProfileDTO } from '@/shared/types/user.types';
import { ApiResponse, FetchOptions, getUtil } from '@/shared/utils/http';

export const getProfile = async (options?: FetchOptions): Promise<ApiResponse<ProfileDTO>> => {
  return getUtil('/profile', options);
};
