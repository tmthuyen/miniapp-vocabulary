import { UserProfile } from '../entities/UserProfile';
import { UserProfileWithRolesProjection } from './projections/user-projections';



export interface IUserProfileRepository {
    save(userProfile: UserProfile) : Promise<UserProfile>;
    getByUserId(userId: string): Promise<UserProfile | null>; 
    getByUserIdWithRoles(userId: string): Promise<UserProfileWithRolesProjection | null>;
    listUsersForAdmin(limit: number, offset: number): Promise<UserProfile[]>;
}
