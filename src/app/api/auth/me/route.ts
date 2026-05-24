import { createRequestContainer } from "@/infrastructure/di/container"

export async function GET() {
  const user = {
    id: "123",
    email: "cc",
    full_name: "John Doe",
    avatar_url: null,
    role_codes: ["user"],
  }
  if (!user) return Response.json({ user: null }, { status: 200 })
//   const di = createRequestContainer()
//   const profile = await di.profile.getMyProfileUC.execute(user.id)
  
  const responseData = {
    status: 200,
    message: "User info retrieved successfully",
    data: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role_codes: user.role_codes,
    },
  };
  return Response.json(responseData, { status: 200 });
}
