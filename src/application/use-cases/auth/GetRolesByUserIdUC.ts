import { IRoleRepository } from "@/domain/repositories/IRoleRepository";
import { IUserRoleRepository } from "@/domain/repositories/IUserRoleRepository";

export class GetRolesByUserIdUC {
    constructor(
        private readonly userRoleRepo: IUserRoleRepository,
        private readonly roleRepo: IRoleRepository,
    ) {}

    async execute(user_id: string): Promise<string[]> {
        const roleCodes = await this.userRoleRepo.getRoleCodesByUserId(user_id);
        return roleCodes;
    }
}