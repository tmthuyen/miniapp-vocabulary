import { ApiResponse, FetchOptions, getUtil } from '@/shared/utils/http';

export const getVocabularyDashboard = async (
  options?: FetchOptions
): Promise<ApiResponse<[{ id: string; word: string; meaning: string }]>> => {
  return getUtil('/vocabulary', options);
};
