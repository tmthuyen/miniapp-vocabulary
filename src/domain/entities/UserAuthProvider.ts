import z, { email } from "zod";
import { BaseDomain, baseSchema } from "./BaseDomain";

export const userAuthProviderSchema = z.object({
    id: z.string(),
    user_id: z.string().nonempty(),
    provider_type : z.string().nonempty().default('local'), // fb, google, apple, local
    provider_user_id: z.string().nullable(), // id của user trên provider đó, ví dụ fb thì là fb id, google thì là google id
    email: email().nullable(),
    password_hash: z.string().nullable(), // chỉ dùng khi provider_type là local
    is_verified: z.boolean().default(false), // đã xác thực email chưa, chỉ áp dụng cho local provider
    ...baseSchema.shape,
});

export class UserAuthProvider extends BaseDomain {
    private domainProps: z.infer<typeof userAuthProviderSchema>;
    constructor(inputProps: z.infer<typeof userAuthProviderSchema>) {
        super(inputProps);
        const parsed = userAuthProviderSchema.safeParse(inputProps);
        if (!parsed.success) {
            throw new Error('Invalid user auth provider data');
        }
        this.domainProps = parsed.data;
    }

    getDTO(): z.infer<typeof userAuthProviderSchema> {
        return this.domainProps;
    }

    createUserAuthProvider(
        audit_user_id: string,
        inputAuthProvider: z.infer<typeof userAuthProviderSchema>,
    ) {
        super.createBaseDomain(audit_user_id);
        const merged = { ...inputAuthProvider, ...super.getDTO() };
        const parsed = userAuthProviderSchema.safeParse(merged);
        if (!parsed.success) {
            throw new Error('Invalid user auth provider data');
        }
        this.domainProps = parsed.data;
    } 
}