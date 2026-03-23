import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

export const deviceRoutes = new Hono()

deviceRoutes.use('*', authMiddleware)

// POST /device/heartbeat — update device presence in KV (short TTL)
// Also checks for and returns any kill flag on this device
deviceRoutes.post('/heartbeat', async (c) => {
  // TODO: write device presence to KV with short TTL
  // TODO: check for kill flag (kill:{deviceId}) and return if found
  return c.json({ alive: true, killFlag: null })
})

// DELETE /device/heartbeat — mark device inactive on tab close (beforeunload)
deviceRoutes.delete('/heartbeat', async (c) => {
  // TODO: remove device presence from KV
  return c.json({ ok: true })
})
