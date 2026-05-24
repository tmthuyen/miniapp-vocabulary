
export class DomainError extends Error {
    public readonly code: number;
    constructor(message: string, code: number = 400) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
    } 
}