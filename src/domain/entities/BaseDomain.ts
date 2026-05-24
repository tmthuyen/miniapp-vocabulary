export type BaseDomainProps = {
    created_at: Date | null;
    created_by: string | null;
    updated_at: Date | null;
    updated_by: string | null;
};

function isValidBaseProps(input: BaseDomainProps): boolean {
    return (
        (input.created_at === null || input.created_at instanceof Date) &&
        (input.updated_at === null || input.updated_at instanceof Date)
    );
}

export class BaseDomain {
    private props: BaseDomainProps;

    constructor(inputProps: BaseDomainProps) {
        if (!isValidBaseProps(inputProps)) {
            throw new Error('Invalid base domain data');
        }
        this.props = inputProps;
    }

    getDTO(): BaseDomainProps {
        return this.props;
    }

    createBaseDomain(audit_user_id: string) {
        if (!audit_user_id?.trim()) throw new Error('Invalid audit user id');
        this.props = {
            created_by: audit_user_id,
            created_at: new Date(),
            updated_by: audit_user_id,
            updated_at: new Date(),
        };
    }

    updateBaseDomain(audit_user_id: string) {
        if (!audit_user_id?.trim()) throw new Error('Invalid audit user id');
        this.props = {
            ...this.props,
            updated_by: audit_user_id,
            updated_at: new Date(),
        };
    }
}
