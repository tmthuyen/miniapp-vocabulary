import z from "zod"
import { BaseDomain, baseSchema } from "./BaseDomain"


// ==== Roles ===
export const roleSchema = z.object({
    id: z.string(),
    name: z.string().trim().nonempty(),
    code: z.string().uppercase().trim().nonempty(),
    ...baseSchema.shape,
})

export class Role extends BaseDomain {
    private domainProps: z.infer<typeof roleSchema>
    constructor(inputProps: z.infer<typeof roleSchema>) {
        super(inputProps);
        const parsed = roleSchema.safeParse(inputProps)
        if (!parsed.success) {
            throw new Error("Invalid role data")
        }
        this.domainProps = parsed.data
    }

    getDTO(): z.infer<typeof roleSchema> {
        return this.domainProps
    }

    createRole(
        audit_user_id: string, 
        inputRole: z.infer<typeof roleSchema>
    ) {
        super.createBaseDomain(audit_user_id);
        const merged = { ...inputRole, ...super.getDTO() }
        const parsed = roleSchema.safeParse(merged)
        if (!parsed.success) {
            throw new Error("Invalid role data")
        }
        this.domainProps = parsed.data
    }

    updateRole(
        audit_user_id: string,
        updates: Partial<z.infer<typeof roleSchema>>
    ) {
        super.updateBaseDomain(audit_user_id);
        const newData = { ...this.domainProps, ...updates, ...super.getDTO() }

        const parsed = roleSchema.safeParse(newData)
        if (!parsed.success) {
            throw new Error("Invalid role update data")
        }
        this.domainProps = parsed.data
    }
}

export const userRoleSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    role_id: z.string(),
    ...baseSchema.shape,
})

export class UserRole extends BaseDomain {
    private domainProps: z.infer<typeof userRoleSchema>
    constructor(inputProps: z.infer<typeof userRoleSchema>) {
        super(inputProps);
        const parsed = userRoleSchema.safeParse(inputProps)
        if (!parsed.success) {
            throw new Error("Invalid user role data")
        }
        this.domainProps = parsed.data
    }
}