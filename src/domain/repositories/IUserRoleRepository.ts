import { UserRole } from "../entities/Role";

export interface IUserRoleRepository {
    save(userRole: UserRole): Promise<UserRole>;
    getRoleCodesByUserId(userId: string): Promise<string[]>;
    delete(userId: string, roleId: string): Promise<void>;
}
