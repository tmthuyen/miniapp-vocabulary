import { UserProfile } from '../entities/UserProfile';

export interface IUserProfileRepository {
    save(userProfile: UserProfile) : Promise<UserProfile>;
    getByUserId(userId: string): Promise<UserProfile | null>; 
    listUsersForAdmin(limit: number, offset: number): Promise<UserProfile[]>;
}
