import { UserAuthProvider, ProviderType } from '@/domain/entities/UserAuthProvider';
import {
  IUserAuthProviderRepository,
  SignInProjection,
} from '@/domain/repositories/IUserAuthProviderRepository';
import { UserAuthProvider as UserAuthProviderPrisma } from '@prisma/client';
import { prisma } from '../client';

// mapper
export class UserAuthProviderMapper {
  static toDomainFromPrisma = (row: UserAuthProviderPrisma): UserAuthProvider => {
    return UserAuthProvider.restore({
      id: row.id,
      user_id: row.user_id,
      provider_type: row.provider_type as ProviderType,
      provider_user_id: row.provider_user_id,
      email: row.email,
      password_hash: row.password_hash,
      is_verified: row.is_verified,
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
    });
  };

  static toPrismaFromDomain = (entity: UserAuthProvider): UserAuthProviderPrisma => {
    const dto = entity.getDTO();
    return {
      id: dto.id,
      user_id: dto.user_id,
      provider_type: dto.provider_type,
      provider_user_id: dto.provider_user_id,
      email: dto.email,
      password_hash: dto.password_hash,
      is_verified: dto.is_verified,
      created_at: dto.created_at || new Date(),
      created_by: dto.created_by,
      updated_at: dto.updated_at || new Date(),
      updated_by: dto.updated_by,
    };
  };
}

// adapter
export class PrismaUserAuthProviderRepositoryAdapter implements IUserAuthProviderRepository {
  private toSignInProjection(row: any): SignInProjection {
    return {
      user_id: row.user_id,
      status: row.user_profile?.status ?? 'active',
      email: row.email ?? null,
      password_hash: row.password_hash ?? null,
      full_name: row.user_profile?.full_name ?? '',
      avatar_url: row.user_profile?.avatar_url ?? null,
      role_codes: (row.user_profile?.user_roles ?? []).map((r: any) => r.role.code),
    };
  }

  async save(userAuthProvider: UserAuthProvider): Promise<UserAuthProvider> {
    const prismaData = UserAuthProviderMapper.toPrismaFromDomain(userAuthProvider);
    const saved = await prisma.userAuthProvider.upsert({
      where: { id: prismaData.id },
      update: prismaData,
      create: prismaData,
    });
    return UserAuthProviderMapper.toDomainFromPrisma(saved);
  }

  async getUserByEmail(email: string): Promise<UserAuthProvider | null> {
    const user = await prisma.userAuthProvider.findUnique({
      where: { email: email },
    });
    return user ? UserAuthProviderMapper.toDomainFromPrisma(user) : null;
  }

  async getSignInProjectionByEmail(email: string): Promise<SignInProjection | null> {
    const row = await prisma.userAuthProvider.findFirst({
      where: { email: email.toLowerCase(), provider_type: 'local' },
      include: {
        user_profile: {
          include: {
            user_roles: { include: { role: { select: { code: true } } } },
          },
        },
      },
    });
    return row ? this.toSignInProjection(row) : null;
  }

  async getUserByProvider(
    providerType: string,
    providerId: string
  ): Promise<UserAuthProvider | null> {
    const user = await prisma.userAuthProvider.findUnique({
      where: {
        provider_type_provider_user_id: {
          provider_type: providerType,
          provider_user_id: providerId,
        },
      },
    });
    return user ? UserAuthProviderMapper.toDomainFromPrisma(user) : null;
  }

  async getSignInProjectionByProvider(
    providerType: string,
    providerId: string
  ): Promise<SignInProjection | null> {
    const row = await prisma.userAuthProvider.findUnique({
      where: {
        provider_type_provider_user_id: {
          provider_type: providerType,
          provider_user_id: providerId,
        },
      },
      include: {
        user_profile: {
          include: {
            user_roles: { include: { role: { select: { code: true } } } },
          },
        },
      },
    });
    return row ? this.toSignInProjection(row) : null;
  }
}
