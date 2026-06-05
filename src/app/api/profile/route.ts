import withErrorHandling from '@/infrastructure/api/next/withErrorHandling';
import { createRequestContainer } from '@/infrastructure/di/container';
import { NextRequest, NextResponse } from 'next/server';
import { getCookieToken } from '../auth/me/route';
import { UserProfileWithRolesProjection } from '@/domain/repositories/projections/user-projections';

export const GET = withErrorHandling(async (req: NextRequest) => {
    const di = createRequestContainer();
    // lấy session từ cookie
    const token = await getCookieToken(req);

    // giải jwt
    const tokenPayload = await di.tokenProvider.parseToken(token);

    const profile = (await di.profile.getMyProfileUC.execute(
        tokenPayload.user_id,
    )) as UserProfileWithRolesProjection;

    const responseData = {
        success: true,
        status: 200,
        message: 'User info retrieved successfully',
        data: {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            role_codes: profile.role_codes,
            target_band: profile.target_band,
            vip_plan: profile.vip_plan,
            vip_expired_at: profile.vip_expired_at,
            created_at: profile.created_at,
            created_by: profile.created_by,
            updated_at: profile.updated_at,
            updated_by: profile.updated_by,
        },
    };
    return NextResponse.json(responseData, { status: 200 });
});

export async function PUT(req: Request) {
    // const body = (await req.json()) as UpdateUserProfileInput;
    // const auth = await requireUser();
    // if (!auth.ok)
    //     return Response.json(
    //         { message: auth.message },
    //         { status: auth.status },
    //     );

    // const updated = await auth.di.profile.updateMyProfile.execute(
    //     auth.userId,
    //     body,
    // );
    // return Response.json(updated.toDTO());
}
