import { UserRole } from "@/domain/entities/Role";
import { UserRole as UserRolePrisma } from "@prisma/client";
import { prisma } from "../client"; 
import { IUserRoleRepository } from "@/domain/repositories/IUserRoleRepository";

// export interface IUserRoleRepository {
//     save(userRole: UserRolePrisma): Promise<UserRole>;
//     getRolesByUserId(userId: string): Promise<string[]>;
//     delete(userId: string, roleId: string): Promise<void>;
// }


// mapper
export class UserRoleMapper {
    static toDomainFromPrisma = (row: UserRolePrisma): UserRole => {
        const props = {
            id: row.id,
            user_id: row.user_id,
            role_id: row.role_id,
            created_at: row.created_at,
            created_by: row.created_by,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
        };
        return new UserRole(props);
    }

    static toPrismaFromDomain = (entity: UserRole): UserRolePrisma => {
        const dto = entity.getDTO();
        return {
            id: dto.id,
            user_id: dto.user_id,
            role_id: dto.role_id,
            created_at: dto.created_at || new Date(),
            created_by: dto.created_by,
            updated_at: dto.updated_at || new Date(),
            updated_by: dto.updated_by,
        };
    }
}

// adapter
export class PrismaUserRoleRepositoryAdapter implements IUserRoleRepository {
    async save(userRole: UserRole): Promise<UserRole> {
        const prismaData = UserRoleMapper.toPrismaFromDomain(userRole);
        const saved = await prisma.userRole.upsert({
            where: { id: prismaData.id },
            update: prismaData,
            create: prismaData,
        });
        return UserRoleMapper.toDomainFromPrisma(saved);
    }

    async getRoleCodesByUserId(userId: string): Promise<string[]> {
        const rows = await prisma.userRole.findMany({
            where: { user_id: userId },
            include: { role: true },
        });
        return rows.map(r => r.role.code);
    }

    async delete(userId: string, roleId: string): Promise<void> {
        await prisma.userRole.deleteMany({
            where: { user_id: userId, role_id: roleId },
        });
    }


}