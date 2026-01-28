import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseVocabularyRepository } from "@/infrastructure/database/supabase/repositories/SupabaseVocabularyRepository"
import { SupabaseUserProfileRepository } from "@/infrastructure/database/supabase/repositories/SupabaseUserProfileRepository"
import { GetVocabularyList } from "@/core/use-cases/vocabulary/GetVocabularyList"
import { GetVocabularyCategories } from "@/core/use-cases/vocabulary/GetVocabularyCategories"
import { CreateVocabulary } from "@/core/use-cases/vocabulary/CreateVocabulary"
import { UpdateVocabulary } from "@/core/use-cases/vocabulary/UpdateVocabulary"
import { DeleteVocabulary } from "@/core/use-cases/vocabulary/DeleteVocabulary"
import { GetMyProfile } from "@/core/use-cases/profile/GetMyProfile"
import { UpdateMyProfile } from "@/core/use-cases/profile/UpdateMyProfile"

export function createRequestContainer(supabase: SupabaseClient) {
  const vocabularyRepo = new SupabaseVocabularyRepository(supabase)
  const profileRepo = new SupabaseUserProfileRepository(supabase)

  return {
    vocabulary: {
      getList: new GetVocabularyList(vocabularyRepo),
      getCategories: new GetVocabularyCategories(vocabularyRepo),
      create: new CreateVocabulary(vocabularyRepo),
      update: new UpdateVocabulary(vocabularyRepo),
      delete: new DeleteVocabulary(vocabularyRepo),
    },
    profile: {
      getMyProfile: new GetMyProfile(profileRepo),
      updateMyProfile: new UpdateMyProfile(profileRepo),
    },
  }
}


