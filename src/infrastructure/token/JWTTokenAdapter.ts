import {
    ITokenProvider,
    tokenPayload,
} from '@/application/interfaces/port/token/ITokenProvider';
import jwt from 'jsonwebtoken';

export class JWTTokenAdapter implements ITokenProvider {
    generateToken(payload: tokenPayload): string {
        const secret = process.env.JWT_SECRET;
        const expiresIn: jwt.SignOptions['expiresIn'] =
            (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d';
        
        
        if (!secret) throw new Error('JWT_SECRET is not set');

        return jwt.sign(payload, secret, {
            expiresIn: expiresIn,
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm || 'HS256',
        });
    }

    parseToken(token: string): tokenPayload {
        // Implement JWT token parsing logic here
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('JWT_SECRET is not set');

            const decoded = jwt.verify(token, secret) as tokenPayload;
            return decoded;
        } catch {
            throw new Error('Invalid token');
        }
    }
}
