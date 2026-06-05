import { IPasswordHasher } from "@/application/interfaces/port/hash/IPasswordHasher";
import { UserAuthProvider } from "@/domain/entities/UserAuthProvider";
import { UserProfile } from "@/domain/entities/UserProfile";
import { IUserAuthProviderRepository } from "@/domain/repositories/IUserAuthProviderRepository";
import { IUserProfileRepository } from "@/domain/repositories/IUserProfileRepository";
import { generateUniqueId } from "@/shared/utils/idUtils";
import z from "zod";
import { AssignRoleUC } from "./AssignRoleUC";
import AppError from "@/shared/errors/AppError";

export const signUpWithEmailPasswordInput = z.object({
    email: z.email().nonempty({ message: "Email is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    password_confirm: z.string().min(6, { message: "Password confirmation must be at least 6 characters long" }),
    full_name: z.string().min(5, { message: "Full name must be at least 5 characters long" }).max(100, { message: "Full name must be at most 100 characters long" }),
});

export const signUpWithEmailPasswordOutput = z.object({
    user_id: z.string(),
    email: z.string(),
});

export class SignUpWithEmailPasswordUC {
    constructor(
        private readonly bcrypt: IPasswordHasher,
        private readonly userAuthProviderRepo: IUserAuthProviderRepository,
        private readonly userProfileRepo: IUserProfileRepository,
        private readonly assignRoleUC: AssignRoleUC,
    ) { 
    }

    async execute(
        input: z.infer<typeof signUpWithEmailPasswordInput>,
    ): Promise<z.infer<typeof signUpWithEmailPasswordOutput>> {
        const { email, password, password_confirm, full_name } = input;
        // kiếm tra password và password_confirm có khớp không
        if (password !== password_confirm) {
            throw AppError.builder()
                .withMessage('Password and password confirmation do not match')
                .withCode('PASSWORD_MISMATCH')
                .withStatus(400);
        }

        // tìm user auth provider có email này
        const existing = await this.userAuthProviderRepo.getUserByEmail(email);
        if (existing) {
            throw AppError.builder()
                .withMessage('Email already in use')
                .withCode('EMAIL_IN_USE')
                .withStatus(400);
        }

        // hash password
        const passwordHash = await this.bcrypt.hash(password, 10);

        const newUserId = generateUniqueId();
        const newUserAuthId = generateUniqueId();
        // tạo profile
        const newUserProfile = UserProfile.create({
            new_id: newUserId,
            audit_user_id: newUserId,
            full_name,
            avatar_url: null,
            target_band: null
        });
        const savedUserProfile = await this.userProfileRepo.save(newUserProfile);

        // tạo auth provider mới với provider_type là local, email, password_hash là hash password, user_id là id mới
        const newUserAuthProvider = UserAuthProvider.createLocal({
            new_id: newUserAuthId,
            user_id: newUserId,
            email,
            password_hash: passwordHash,
            audit_user_id: newUserId,
        });

        const savedAuthProvider = await this.userAuthProviderRepo.save(newUserAuthProvider);

        // gán role user mặc định cho user mới
        await this.assignRoleUC.execute(newUserId, ['USER']);
 
        return {
            user_id: savedUserProfile.getDTO().id,
            email: savedAuthProvider.getDTO().email!,
        };
    }

}