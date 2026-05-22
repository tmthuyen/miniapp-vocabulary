import type { SupabaseClient } from "@supabase/supabase-js"
import { UserProfile } from "@/domain/entities/UserProfile"
import type { IUserProfileRepository, UpdateUserProfileInput } from "@/domain/repositories/IUserProfileRepository"

type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  target_band: number | null
  role: "admin" | "user" | null
  vip_plan: "free" | "vip_basic" | "vip_pro" | null
  vip_expired_at: string | null
  created_at: string
  updated_at: string
}

function rowToEntity(row: ProfileRow) {
  return new UserProfile({
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    target_band: row.target_band,
    role: row.role ?? "user",
    vip_plan: row.vip_plan ?? "free",
    vip_expired_at: row.vip_expired_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })
}

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getByUserId(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()
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
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.vip_plan !== undefined ? { vip_plan: input.vip_plan } : {}),
          ...(input.vip_expired_at !== undefined ? { vip_expired_at: input.vip_expired_at } : {}),
        },
        { onConflict: "id" }
      )
      .select("*")
      .single()

    if (error) throw error
    return rowToEntity(data as ProfileRow)
  }
}
