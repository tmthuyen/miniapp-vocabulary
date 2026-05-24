import z from 'zod';
import { baseSchema, BaseDomain } from './BaseDomain';

export const sessionSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    session_token: z.string().nonempty(),
    issued_at: z.date(),
    expires_at: z.date(),
    revoked_at: z.date().nullable(),
    ...baseSchema.shape,
});


export class Session extends BaseDomain {
    private domainProps: z.infer<typeof sessionSchema>;
    constructor(inputProps: z.infer<typeof sessionSchema>) {
        super(inputProps);
        const parsed = sessionSchema.safeParse(inputProps);
        if (!parsed.success) {
            throw new Error('Invalid session data');
        }
        this.domainProps = parsed.data;
    }

    getDTO(): z.infer<typeof sessionSchema> {
        return this.domainProps;
    }

    isExpired(now: Date = new Date()) {
        return this.domainProps.expires_at <= now;
    }

    static create(input: {
        audit_user_id: string,
        new_id: string;
        user_id: string;
        session_token: string;
        issued_at: Date;
        expires_at: Date;
    }): Session {
        const entity = new Session({
            id: input.new_id,
            user_id: input.user_id,
            session_token: input.session_token,
            issued_at: input.issued_at,
            expires_at: input.expires_at,
            revoked_at: null,
            created_at: null,
            created_by: null,
            updated_at: null,
            updated_by: null,
        });

        entity.createBaseDomain(input.audit_user_id);
        
        return entity;
    }

    update(audit_user_id: string, updates: Partial<z.infer<typeof sessionSchema>>) {
        super.updateBaseDomain(audit_user_id);
        const newData = { ...this.domainProps, ...updates, ...super.getDTO() };
        const parsed = sessionSchema.safeParse(newData);
        if (!parsed.success) {
            throw new Error('Invalid session update data');
        }
        this.domainProps = parsed.data;
    }

    revoke(audit_user_id: string) {
        this.update(audit_user_id, { revoked_at: new Date() });
    }

    
}



// export interface SessionProps {
//   id: string
//   userId: string
//   session_token: string
//   expires_at: string
//   created_at: string
// }

// export interface SessionDTO {
//   id: string
//   user_id: string
//   session_token: string
//   expires_at: string
//   created_at: string
// }

// export class Session {
//   constructor(private readonly props: SessionProps) {
//     if (!props.id) throw new Error("Session.id is required")
//     if (!props.userId) throw new Error("Session.userId is required")
//     if (!props.session_token?.trim()) throw new Error("Session.session_token is required")
//     if (!props.expires_at) throw new Error("Session.expires_at is required")
//     if (!props.created_at) throw new Error("Session.created_at is required")
//   }

//   isExpired(now: Date = new Date()) {
//     return new Date(this.props.expires_at) <= now
//   }

//   toDTO(): SessionDTO {
//     return {
//       id: this.props.id,
//       user_id: this.props.userId,
//       session_token: this.props.session_token,
//       expires_at: this.props.expires_at,
//       created_at: this.props.created_at,
//     }
//   }
// }
