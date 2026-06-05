// export interface IRoleRepository {
//     getAll(): Promise<Role[]>;
//     getById(id: string): Promise<Role | null>;
//     getByCode(code: string): Promise<Role | null>;
//     save(auditUserId: string, role: z.infer<typeof roleSchema>): Promise<Role>;
// }

import { Role as RolePrisma } from '@prisma/client';
import { prisma } from '../client';
import { IRoleRepository } from '@/domain/repositories/IRoleRepository';
import { Role } from '@/domain/entities/Role';

export class RoleMapper {
    static toDomainFromPrisma = (row: RolePrisma): Role => {
        return Role.restore({
            id: row.id,
            name: row.name,
            code: row.code,
            created_at: row.created_at,
            created_by: row.created_by,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
        });
    }
    static toPrismaFromDomain = (entity: Role): RolePrisma => {
        const dto = entity.getDTO();
        return {
            id: dto.id,
            name: dto.name,
            code: dto.code,
            created_at: dto.created_at || new Date(),
            created_by: dto.created_by,
            updated_at: dto.updated_at || new Date(),
            updated_by: dto.updated_by,
        };
    }
}



export class PrismaRoleRepositoryAdapter implements IRoleRepository {
    async save(role: Role): Promise<Role> {
        const prismaData = RoleMapper.toPrismaFromDomain(role); 
        const saved = await prisma.role.upsert({
            where: { id: prismaData.id },
            update: prismaData,
            create: prismaData,
        });
        return RoleMapper.toDomainFromPrisma(saved);
    }
    
    async getAll(): Promise<Role[]> {
        const rows = await prisma.role.findMany();
        return rows.map(RoleMapper.toDomainFromPrisma); 
    }

    async getById(id: string): Promise<Role | null> {
        const row = await prisma.role.findUnique({ where: { id } });
        if (!row) return null;
        return RoleMapper.toDomainFromPrisma(row);
    }

    async getByCode(code: string): Promise<Role | null> {
        const row = await prisma.role.findUnique({ where: { code } });
        if (!row) return null;
        return RoleMapper.toDomainFromPrisma(row);
    }
}