import { UserRole } from '@/domain/entities/Role';
import { IRoleRepository } from '@/domain/repositories/IRoleRepository';
import { IUserRoleRepository } from '@/domain/repositories/IUserRoleRepository';
import { generateUniqueId } from '@/shared/utils/idUtils';

export class AssignRoleUC {
    constructor(
        private readonly roleRepo: IRoleRepository,
        private readonly userRoleRepo: IUserRoleRepository,
    ) {}

    async execute(user_id: string, role_codes: string[] = ['user']) {
        for (const role_code of role_codes) {
            // tìm role theo role_code
            const role = await this.roleRepo.getByCode(role_code);

            // nếu không có thì throw error
            if (!role) {
                throw new Error(`Role with code '${role_code}' not found`);
            }

            // role dto
            const roleDTO = role.getDTO();

            // nếu có thì tạo user role mới với user_id và role_id
            

            const userRole = UserRole.create(
                {
                    audit_user_id: user_id,
                    new_id: generateUniqueId(),
                    user_id,
                    role_id: roleDTO.id,
                }
            );
            await this.userRoleRepo.save(userRole);
        }
    }
}
