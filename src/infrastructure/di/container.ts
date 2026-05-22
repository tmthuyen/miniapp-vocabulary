import { PrismaVocabularyRepository } from "@/infrastructure/database/prisma/repositories/PrismaVocabularyRepository"
import { PrismaUserProfileRepository } from "@/infrastructure/database/prisma/repositories/PrismaUserProfileRepository"
import { PrismaGameRepository } from "@/infrastructure/database/prisma/repositories/PrismaGameRepository"
import { GetVocabularyList } from "@/use-cases/vocabulary/GetVocabularyList"
import { GetVocabularyCategories } from "@/use-cases/vocabulary/GetVocabularyCategories"
import { CreateVocabulary } from "@/use-cases/vocabulary/CreateVocabulary"
import { UpdateVocabulary } from "@/use-cases/vocabulary/UpdateVocabulary"
import { DeleteVocabulary } from "@/use-cases/vocabulary/DeleteVocabulary"
import { GetMyProfile } from "@/use-cases/profile/GetMyProfile"
import { UpdateMyProfile } from "@/use-cases/profile/UpdateMyProfile"
import { ListUsersForAdmin } from "@/core/use-cases/admin/ListUsersForAdmin"
import { UpdateUserAccessForAdmin } from "@/core/use-cases/admin/UpdateUserAccessForAdmin"
import { StartGameSession } from "@/use-cases/game/StartGameSession"
import { SubmitGameAnswer } from "@/use-cases/game/SubmitGameAnswer"
import { FinishGameSession } from "@/use-cases/game/FinishGameSession"
import { GetMyGameHistory } from "@/use-cases/game/GetMyGameHistory"

export function createRequestContainer() {
  const vocabularyRepo = new PrismaVocabularyRepository()
  const profileRepo = new PrismaUserProfileRepository()
  const gameRepo = new PrismaGameRepository()

  return {
    vocabulary: {
      repo: vocabularyRepo,
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
    admin: {
      listUsers: new ListUsersForAdmin(profileRepo),
      updateUserAccess: new UpdateUserAccessForAdmin(profileRepo),
    },
    game: {
      startSession: new StartGameSession(gameRepo),
      submitAnswer: new SubmitGameAnswer(gameRepo),
      finishSession: new FinishGameSession(gameRepo),
      history: new GetMyGameHistory(gameRepo),
    },
  }
}

