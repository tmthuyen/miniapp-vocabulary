import { createRequestContainer } from "@/infrastructure/di/container"

export async function createNextRouteContainer() {
  return createRequestContainer()
}
