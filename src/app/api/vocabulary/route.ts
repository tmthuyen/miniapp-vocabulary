import { NextRequest, NextResponse } from 'next/server';
import withErrorHandling from '@/infrastructure/api/next/withErrorHandling';

export const GET = withErrorHandling(async (req: NextRequest) => {
    const responseData = {
        success: true,
        status: 200,
        message: 'Vocabulary list retrieved successfully',
        data: [
            { id: 1, word: 'aberration', meaning: 'a departure from what is normal, usual, or expected' },
        ],
    };

    return NextResponse.json(responseData, { status: 200 });
});
