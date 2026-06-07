import { IPasswordHasher } from '@/application/interfaces/port/hash/IPasswordHasher';
import { IUserAuthProviderRepository } from '@/domain/repositories/IUserAuthProviderRepository';
import { AppError } from '@/shared/errors/AppError';
import z from 'zod';

export const signInWithEmailPasswordInput = z.object({
  email: z
    .email({
      pattern: /^[\w.-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i,
      message:
        'Email must be a valid email address with domain gmail.com, yahoo.com, or outlook.com',
    })
    .nonempty({ message: 'Email is required' }),
  password: z.string().min(6).nonempty({ message: 'Password is required' }),
});

export const signInOutput = z.object({
  user_id: z.string(),
  email: z.string().nullable(),
  full_name: z.string().default(''),
  avatar_url: z.string().nullable(),
  role_codes: z.array(z.string()),
});

export class SignInWithEmailPasswordUC {
  constructor(
    private readonly bcrypt: IPasswordHasher,
    private readonly userAuthProviderRepo: IUserAuthProviderRepository
  ) {}

  async execute(
    input: z.infer<typeof signInWithEmailPasswordInput>
  ): Promise<z.infer<typeof signInOutput>> {
    const { email, password } = input;

    const existing = await this.userAuthProviderRepo.getSignInProjectionByEmail(email);
    if (!existing) {
      throw AppError.builder()
        .withMessage('Invalid email or password')
        .withCode('INVALID_CREDENTIALS')
        .withStatus(400);
    }

    if (existing.password_hash === null) {
      throw AppError.builder()
        .withMessage(
          'This email is registered with a social account. Please sign in with your social account.'
        )
        .withCode('SOCIAL_ACCOUNT')
        .withStatus(400);
    }

    const isMatch = await this.bcrypt.verify(password, existing.password_hash);
    if (!isMatch) {
      throw AppError.builder()
        .withMessage('Invalid password')
        .withCode('INVALID_CREDENTIALS')
        .withStatus(400);
    }

    return {
      user_id: existing.user_id,
      email: existing.email,
      full_name: existing.full_name || '',
      avatar_url: existing.avatar_url || null,
      role_codes: existing.role_codes,
    };
  }
}
