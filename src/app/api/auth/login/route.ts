import withErrorHandling from '@/infrastructure/api/next/withErrorHandling';
import { createRequestContainer } from '@/infrastructure/di/container';
import { NextRequest, NextResponse } from 'next/server';

const setAuthCookie = (token: string, response: NextResponse) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // cookie expires in 7 days

  response.cookies.set({
    name: 'access_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
  });
};

export const POST = withErrorHandling(async (req: NextRequest) => {
  const di = createRequestContainer();
  console.log('Login request body:', req);
  const body = (await req.json()) as { email?: string; password?: string };

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';

  const user = await di.auth.signInWithEmailPasswordUC.execute({ email, password });

  // tạo token
  const token = di.tokenProvider.generateToken({
    user_id: user.user_id,
    role_codes: user.role_codes,
    full_name: user.full_name || '',
  });

  // set cookie
  const response = NextResponse.json(
    {
      status: 200,
      message: 'Login successful',
      data: {
        ...user,
      },
    },
    { status: 200 }
  );
  setAuthCookie(token, response);

  return response;
});
