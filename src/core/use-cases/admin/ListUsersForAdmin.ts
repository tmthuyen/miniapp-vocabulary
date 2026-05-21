import type { IUserProfileRepository } from "@/core/interfaces/repositories/IUserProfileRepository"

export class ListUsersForAdmin {
  constructor(private readonly repo: IUserProfileRepository) {}
  async execute() {
    return this.repo.listUsersForAdmin()
  }
}
