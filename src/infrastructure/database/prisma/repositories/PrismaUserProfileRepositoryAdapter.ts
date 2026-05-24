import { UserProfile as UserProfilePrisma } from '@prisma/client';
import { UserProfile } from '@/domain/entities/UserProfile';
import { IUserProfileRepository } from '@/domain/repositories/IUserProfileRepository';
import { prisma } from '../client';

class UserProfileMapper {
    static toDomainFromPrisma = (row: UserProfilePrisma): UserProfile => {
        const props = {
            id: row.id,
            full_name: row.full_name || '',
            status: row.status,
            avatar_url: row.avatar_url,
            target_band: row.target_band,
            vip_plan: row.vip_plan,
            vip_expired_at: row.vip_expired_at,
            created_at: row.created_at,
            created_by: row.created_by,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
        };
        return new UserProfile(props);
    };
    static toPrismaFromDomain = (entity: UserProfile): UserProfilePrisma => {
        const dto = entity.getDTO();
        return {
            id: dto.id,
            full_name: dto.full_name,
            status: dto.status,
            avatar_url: dto.avatar_url,
            target_band: dto.target_band,
            vip_plan: dto.vip_plan,
            vip_expired_at: dto.vip_expired_at,
            created_at: dto.created_at || new Date(),
            created_by: dto.created_by,
            updated_at: dto.updated_at || new Date(),
            updated_by: dto.updated_by,
        };
    };
}

export class PrismaUserProfileRepositoryAdapter implements IUserProfileRepository {
    async save(userProfile: UserProfile) {
        const prismaData = UserProfileMapper.toPrismaFromDomain(userProfile);
        const saved = await prisma.userProfile.upsert({
            where: { id: prismaData.id },
            update: prismaData,
            create: prismaData,
        });
        return UserProfileMapper.toDomainFromPrisma(saved);
    }
    async getByUserId(userId: string): Promise<UserProfile | null> {
        const row = await prisma.userProfile.findUnique({
            where: { id: userId },
        });
        if (!row) return null;
        return UserProfileMapper.toDomainFromPrisma(row);
    }
 

    async listUsersForAdmin(
        limit: number,
        offset: number,
    ): Promise<UserProfile[]> {
        return prisma.userProfile
            .findMany({
                skip: offset,
                take: limit,
                orderBy: { created_at: 'desc' },
            })
            .then((rows) => rows.map(UserProfileMapper.toDomainFromPrisma));
    }
}
