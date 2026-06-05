import { NextRequest, NextResponse } from 'next/server';
import mapToAppError from '@/shared/errorMapper';

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (err) {
      const appErr = mapToAppError(err);
      // optional: add logging here
      console.error('API Error:', appErr);
      return NextResponse.json(
        {
          success: false,
          message: appErr.publicMessage ?? appErr.message,
          details: appErr.details,
        },
        { status: appErr.status }
      );
    }
  };
}

export default withErrorHandling;
