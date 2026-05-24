import { GetMyProfileUC } from '@/application/use-cases/profile/GetMyProfileUC';
import { PrismaRoleRepositoryAdapter } from '../database/prisma/repositories/PrismaRoleRepositoryAdapter';
import { PrismaSessionRepositoryAdapter } from '../database/prisma/repositories/PrismaSessionRepositoryAdapter';
import { PrismaUserAuthProviderRepositoryAdapter } from '../database/prisma/repositories/PrismaUserAuthProviderRepositoryAdapter';
import { PrismaUserProfileRepositoryAdapter } from '../database/prisma/repositories/PrismaUserProfileRepositoryAdapter';
import { PrismaUserRoleRepositoryAdapter } from '../database/prisma/repositories/PrismaUserRoleRepositoryAdapter';
import { UpdateMyProfileUC } from '@/application/use-cases/profile/UpdateMyProfileUC';
import { BcryptAdapter } from '../hash/BcryptAdapter';
import { AssignRoleUC } from '@/application/use-cases/auth/AssignRoleUC';
import { SignInWithEmailPasswordUC } from '@/application/use-cases/auth/SignInWithEmailPasswordUC';
import { SignUpWithEmailPasswordUC } from '@/application/use-cases/auth/SignUpWithEmailPasswordUC';
import { SignInWithOAuthUC } from '@/application/use-cases/auth/SignInWithOAuthUC';
import { JWTTokenAdapter } from '../token/JWTTokenAdapter';

export function createRequestContainer() {
    //   const vocabularyRepo = new PrismaVocabularyRepository()
    const profileRepo = new PrismaUserProfileRepositoryAdapter();
    const userAuthProviderRepo = new PrismaUserAuthProviderRepositoryAdapter();
    const roleRepo = new PrismaRoleRepositoryAdapter();
    const userRoleRepo = new PrismaUserRoleRepositoryAdapter();
    const sessionRepo = new PrismaSessionRepositoryAdapter();

    const hashAdapter = new BcryptAdapter();

    // use-case orchestration
    const assignRoleUC = new AssignRoleUC(roleRepo, userRoleRepo);
    return {
        hash: {
            bcrypt: hashAdapter,
        },
        tokenProvider: new JWTTokenAdapter(),
        auth: {
            assignRoleUC,
            signInWithEmailPasswordUC: new SignInWithEmailPasswordUC(
                hashAdapter,
                userAuthProviderRepo,
            ),
            signUpWithEmailPasswordUC: new SignUpWithEmailPasswordUC(
                hashAdapter,
                userAuthProviderRepo,
                profileRepo,
                assignRoleUC,
            ),
            signInWithOAuthUC: new SignInWithOAuthUC(
                userAuthProviderRepo,
                profileRepo,
                assignRoleUC,
            ),
        },
        profile: {
            getMyProfileUC: new GetMyProfileUC(profileRepo),
            updateMyProfileUC: new UpdateMyProfileUC(profileRepo),
        }, 
    };
}
