import { Hono } from 'hono'

export const versionRoutes = new Hono()

// GET /version — session start ping
// Returns current app version and any kill flag for the calling device
// No auth required — called before auth state is known
versionRoutes.get('/', async (c) => {
  // TODO: return current game version
  // TODO: check for kill flag if deviceId header is present
  return c.json({ version: '0.0.1', killFlag: null })
})
