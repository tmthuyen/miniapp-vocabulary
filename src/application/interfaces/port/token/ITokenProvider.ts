
export type tokenPayload = {
    user_id: string;
    role_codes: string[];
    full_name: string;
}

export interface ITokenProvider {
    generateToken(payload: tokenPayload): string;
    parseToken(token: string): tokenPayload;
}