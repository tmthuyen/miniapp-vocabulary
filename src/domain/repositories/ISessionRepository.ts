import { Session } from "../entities/Session";

export interface ISessionRepository {
    save(session: Session): Promise<Session>;
    getByUserId(userId: string): Promise<Session[]>;
    getBySessionToken(token: string): Promise<Session | null>;
    deleteById(id: string): Promise<void>;
}