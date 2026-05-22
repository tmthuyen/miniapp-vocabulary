import { z } from "zod"


// === base ===
export const baseSchema = z.object({ 
    created_at: z.date(),
    created_by: z.string(),
    updated_at: z.date(),
    updated_by: z.string(),
})

export class BaseDomain {
    private props: z.infer<typeof baseSchema>
    constructor(private readonly inputProps: z.infer<typeof baseSchema>) {
        const parsed = baseSchema.safeParse(this.inputProps)
        if (!parsed.success) {
            throw new Error("Invalid base domain data")
        }
        this.props = parsed.data
    }

    getDTO(): z.infer<typeof baseSchema> {
        return this.props
    }

    createBaseDomain(audit_user_id: string) {
        const newData = { created_by: audit_user_id, created_at: new Date(), updated_by: audit_user_id, updated_at: new Date() }
        const parsed = baseSchema.safeParse(newData)
        if (!parsed.success) {
            throw new Error("Invalid base domain data")
        }
        this.props = parsed.data
    }

    updateBaseDomain(audit_user_id: string) {
        const newData = { ...this.props, updated_by: audit_user_id, updated_at: new Date() }
        const parsed = baseSchema.safeParse(newData)
        if (!parsed.success) {
            throw new Error("Invalid base domain data")
        }
        this.props = parsed.data
    }   
}