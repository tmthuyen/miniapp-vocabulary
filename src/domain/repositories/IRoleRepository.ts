import { Role } from '../entities/Role';

export interface IRoleRepository {
    getAll(): Promise<Role[]>;
    getById(id: string): Promise<Role | null>;
    getByCode(code: string): Promise<Role | null>;
    save(role: Role): Promise<Role>;
}
