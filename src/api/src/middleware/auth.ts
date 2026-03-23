import { createMiddleware } from 'hono/factory'

// Hanko auth middleware
// Validates the Hanko JWT from the Authorization header
// Attaches verified user to context for downstream route handlers
export const authMiddleware = createMiddleware(async (_c, next) => {
  // TODO: validate Hanko JWT
  // TODO: attach user to c.var.user
  // TODO: return 401 if token is missing or invalid
  await next()
})
