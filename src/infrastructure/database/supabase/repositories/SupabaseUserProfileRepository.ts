import type { SupabaseClient } from "@supabase/supabase-js"
import { UserProfile } from "@/core/domain/entities/UserProfile"
import type { IUserProfileRepository, UpdateUserProfileInput } from "@/core/interfaces/repositories/IUserProfileRepository"

type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  target_band: number | null
  created_at: string
  updated_at: string
}

function rowToEntity(row: ProfileRow) {
  return new UserProfile({
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    target_band: row.target_band,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })
}

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getByUserId(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) throw error
    return rowToEntity(data as ProfileRow)
  }

  async upsertForUser(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
          ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
          ...(input.target_band !== undefined ? { target_band: input.target_band } : {}),
        },
        { onConflict: "id" }
      )
      .select("*")
      .single()

    if (error) throw error
    return rowToEntity(data as ProfileRow)
  }
}


