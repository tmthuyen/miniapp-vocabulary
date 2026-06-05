import { UserProfileWithRolesProjection } from '@/domain/repositories/projections/user-projections';
import withErrorHandling from '@/infrastructure/api/next/withErrorHandling';
import { createRequestContainer } from '@/infrastructure/di/container';
import AppError from '@/shared/errors/AppError';
import { NextRequest, NextResponse } from 'next/server';

export const getCookieToken = async (req: NextRequest): Promise<string> => {
    const cookieStore = await req.cookies;
    const token = cookieStore.get('access_token')?.value;
    if (!token) {
        throw new AppError('No access token found in cookies', 'AUTH_ERROR', 401);
    }
    return token;
}

export const GET = withErrorHandling(async (req: NextRequest) => {
    const di = createRequestContainer();
    // lấy session từ cookie
    const token = await getCookieToken(req);

    // giải jwt
    const tokenPayload = await di.tokenProvider.parseToken(token);

    const profile = await di.profile.getMyProfileUC.execute(tokenPayload.user_id) as UserProfileWithRolesProjection;

    const user = {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
    };
    

    await new Promise((resolve) => setTimeout(resolve, 500)); // giả lập delay

    const responseData = {
        success: true,
        status: 200,
        message: 'User info retrieved successfully',
        data: {
            id: user.id,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            // role_codes: user.role_codes,
        },
    };
    return NextResponse.json(responseData, { status: 200 });
});
