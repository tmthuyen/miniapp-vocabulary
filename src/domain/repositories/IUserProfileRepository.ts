import z from 'zod';
import { UserProfile, userProfileSchema, UserStatus, VipPlan } from '../entities/UserProfile';

export interface IUserProfileRepository {
    getByUserId(userId: string): Promise<UserProfile | null>;
    save(
        userId: string,
        userSchema: z.infer<typeof userProfileSchema>,
    ): Promise<UserProfile>;
    listUsersForAdmin(limit: number, offset: number): Promise<UserProfile[]>;
    changeUserVipPlan(
        auditUserId: string,
        newPlan: VipPlan,
        vipExpiredAt: Date | null,
    ): Promise<UserProfile>;
    changeUserStatus(auditUserId: string, newStatus: UserStatus): Promise<UserProfile>;
}
