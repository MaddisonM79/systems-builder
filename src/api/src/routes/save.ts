import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { API_CODES } from '@system-builder/constants'

export const saveRoutes = new Hono()

saveRoutes.use('*', authMiddleware)

// POST /save — push local save to cloud
// Checks for active device conflict before writing
// Returns SAVE_CONFLICT with both snapshots if another device is active and versions have diverged
saveRoutes.post('/', async (c) => {
  // TODO: implement
  return c.json({ code: API_CODES.SAVE_CONFLICT }, 409)
})

// GET /save — pull cloud save to local
saveRoutes.get('/', async (c) => {
  // TODO: implement
  return c.json({})
})
