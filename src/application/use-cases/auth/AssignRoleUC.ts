import { UserRole } from '@/domain/entities/Role';
import { IRoleRepository } from '@/domain/repositories/IRoleRepository';
import { IUserRoleRepository } from '@/domain/repositories/IUserRoleRepository';
import AppError from '@/shared/errors/AppError';
import { generateUniqueId } from '@/shared/utils/idUtils';

export class AssignRoleUC {
    constructor(
        private readonly roleRepo: IRoleRepository,
        private readonly userRoleRepo: IUserRoleRepository,
    ) {}

    async execute(user_id: string, role_codes: string[] = ['USER']) {

        // cách 1 chạy tuần tự
        // chậm
        

        // cách 2 chạy song song
        const assignPromises = role_codes.map(async (role_code) => {
            // tìm role theo role_code
            const role = await this.roleRepo.getByCode(role_code.toUpperCase());

            // nếu không có thì throw error
            if (!role) {
                throw AppError.builder()
                    .withMessage(`Role with code '${role_code}' not found`)
                    .withCode('ROLE_NOT_FOUND')
                    .withStatus(404);
            }

            // role dto
            // const roleDTO = role.getDTO();

            // nếu có thì tạo user role mới với user_id và role_id
            const userRole = UserRole.create(
                {
                    audit_user_id: user_id,
                    new_id: generateUniqueId(),
                    user_id,
                    role_id: role.getId(),
                }
            );
            await this.userRoleRepo.save(userRole);
        });

        try {
            await Promise.all(assignPromises);
        } catch (err) {
            // nếu có lỗi nào thì throw error chung
            throw AppError.builder()
                .withMessage(err instanceof Error ? err.message : 'Failed to assign roles')
                .withCode('ASSIGN_ROLE_FAILED')
                .withStatus(500)
                .withDetails(err instanceof Error ? err.message : err)
                .withPublicMessage('Failed to assign roles');
        }
    }
}
