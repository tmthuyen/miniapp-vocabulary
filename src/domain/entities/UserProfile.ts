// sử dụng zod để validate dữ liệu đầu vào cho UserdomainProps
import { z } from 'zod';
import { baseSchema, BaseDomain } from './BaseDomain';

/**
 * VipPlan có thể là:
 * - free: gói miễn phí, có thể sử dụng tất cả tính năng cơ bản nhưng có giới hạn về số lượng từ vựng được lưu trữ và không có quyền truy cập vào các tính năng nâng cao như phân tích lỗi, đề xuất học tập cá nhân hóa, v.v.
 * - vip_basic: gói VIP cơ bản, có thể lưu trữ nhiều từ vựng hơn, được phép sử dụng một số tính năng nâng cao nhưng vẫn còn một số hạn chế so với gói VIP Pro (ví dụ: không được sử dụng tính năng phân tích lỗi nâng cao hoặc đề xuất học tập cá nhân hóa chi tiết)
 * - vip_pro: gói VIP chuyên nghiệp, có thể lưu trữ số lượng từ vựng không giới hạn, được phép sử dụng tất cả các tính năng nâng cao mà ứng dụng cung cấp (bao gồm cả phân tích lỗi nâng cao, đề xuất học tập cá nhân hóa chi tiết, v.v.)
 */
export type VipPlan = 'free' | 'vip_basic' | 'vip_pro';

/**
 * User status có thể là:
 * - pending: tài khoản mới tạo, chưa xác thực email
 * - active: tài khoản đã xác thực và đang hoạt động bình thường
 * - inactive: tài khoản đã xác thực nhưng bị vô hiệu hóa tạm thời (ví dụ do vi phạm chính sách)
 * - deleted: tài khoản đã bị xóa (có thể do người dùng tự xóa hoặc admin xóa)
 * - banned: tài khoản bị cấm vĩnh viễn (do vi phạm nghiêm trọng)
 * - restricted: tài khoản bị hạn chế một số chức năng (ví dụ không được comment, không được đăng bài, nhưng vẫn có thể đăng nhập và xem nội dung)
 */
export type UserStatus =
    | 'pending'
    | 'active'
    | 'inactive'
    | 'deleted'
    | 'banned'
    | 'restricted';

export const userProfileSchema = z.object({
    id: z.string(),
    full_name: z.string().nonempty(),
    status: z
        .enum([
            'pending',
            'active',
            'inactive',
            'deleted',
            'banned',
            'restricted',
        ])
        .default('pending'),
    avatar_url: z.string().nullable(),
    target_band: z.number().nullable(),
    vip_plan: z.enum(['free', 'vip_basic', 'vip_pro']).default('free'),
    vip_expired_at: z.date().nullable(),
    ...baseSchema.shape,
});

export class UserProfile extends BaseDomain {
    private domainProps: z.infer<typeof userProfileSchema>;
    constructor(inputProps: z.infer<typeof userProfileSchema>) {
        super(inputProps);
        const parsed = userProfileSchema.safeParse(inputProps);
        if (!parsed.success) {
            throw new Error('Invalid user profile data');
        }
        this.domainProps = parsed.data;
    }

    getDTO(): z.infer<typeof userProfileSchema> {
        return this.domainProps;
    }

    createProfile(
        audit_user_id: string,
        inputUser: z.infer<typeof userProfileSchema>,
    ) {
        super.createBaseDomain(audit_user_id);
        const merged = { ...inputUser, ...super.getDTO() };

        const parsed = userProfileSchema.safeParse(merged);
        if (!parsed.success) {
            throw new Error('Invalid user profile data');
        }

        this.domainProps = parsed.data;
    }

    updateProfile(
        audit_user_id: string,
        updates: Partial<z.infer<typeof userProfileSchema>>,
    ) {
        super.updateBaseDomain(audit_user_id);
        const newData = { ...this.domainProps, ...updates, ...super.getDTO() };

        const parsed = userProfileSchema.safeParse(newData);
        if (!parsed.success) {
            throw new Error('Invalid user profile update data');
        }
        this.domainProps = parsed.data;
    }

    changeVipPlan(
        audit_user_id: string,
        newPlan: VipPlan,
        vip_expired_at: Date | null,
    ) {
        this.updateProfile(audit_user_id, { vip_plan: newPlan, vip_expired_at });
    }

    changeStatus(audit_user_id: string, newStatus: UserStatus) {
        this.updateProfile(audit_user_id, { status: newStatus });
    } 

    isVipBasic() {
        return (
            this.domainProps.vip_plan === 'vip_basic' &&
            (!this.domainProps.vip_expired_at ||
                this.domainProps.vip_expired_at > new Date())
        );
    }

    isVipPro() {
        return (
            this.domainProps.vip_plan === 'vip_pro' &&
            (!this.domainProps.vip_expired_at ||
                this.domainProps.vip_expired_at > new Date())
        );
    }

    isFreeUser() {
        return this.domainProps.vip_plan === 'free';
    }
}
