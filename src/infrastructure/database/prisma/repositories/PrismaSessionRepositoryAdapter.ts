// import { Session } from "../entities/Session";

import { Session } from "@/domain/entities/Session";
import { ISessionRepository } from "@/domain/repositories/ISessionRepository";
import { Session as SessionPrisma } from "@prisma/client";
import { prisma } from "../client";

// mapper
export class SessionMapper {
    static toDomainFromPrisma = (row: SessionPrisma): Session => {
        return Session.restore({
            id: row.id,
            user_id: row.user_id,
            session_token: row.session_token,
            issued_at: row.issued_at,
            expires_at: row.expires_at,
            revoked_at: row.revoked_at,
            created_at: row.created_at,
            created_by: row.created_by,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
        });
    }

    static toPrismaFromDomain = (entity: Session): SessionPrisma => {
        const dto = entity.getDTO();
        return {
            id: dto.id,
            user_id: dto.user_id,
            session_token: dto.session_token,
            issued_at: dto.issued_at,
            expires_at: dto.expires_at,
            revoked_at: dto.revoked_at,
            created_at: dto.created_at || new Date(),
            created_by: dto.created_by,
            updated_at: dto.updated_at || new Date(),
            updated_by: dto.updated_by,
        };
    }
}


// adapter
export class PrismaSessionRepositoryAdapter implements ISessionRepository {
    async save(session: Session): Promise<Session> {
        const prismaData = SessionMapper.toPrismaFromDomain(session);
        const saved = await prisma.session.upsert({
            where: { id: prismaData.id },
            update: prismaData,
            create: prismaData,
        });
        return SessionMapper.toDomainFromPrisma(saved);
    }

    async getByUserId(userId: string): Promise<Session[]> {
        const sessions = await prisma.session.findMany({
            where: { user_id: userId },
        });
        return sessions.map(SessionMapper.toDomainFromPrisma);
    }

    async getBySessionToken(token: string): Promise<Session | null> {
        const session = await prisma.session.findUnique({
            where: { session_token: token },
        });
        return session ? SessionMapper.toDomainFromPrisma(session) : null;
    }

    async deleteById(id: string): Promise<void> {
        await prisma.session.delete({
            where: { id },
        });
    }
}