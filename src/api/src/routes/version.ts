import { Hono } from 'hono'
import { KV_KEYS } from '@system-builder/constants'
import type { VersionResponse } from '@system-builder/schemas'
import type { Bindings } from '../index'

export const versionRoutes = new Hono<{ Bindings: Bindings }>()

// GET /version — session start ping
// Returns API and app semver, plus any pending kill flag for the calling device
// No auth required — called before auth state is known
versionRoutes.get('/', async (c) => {
  const apiVersion = c.env.API_VERSION
  const appVersion = await c.env.KV.get(KV_KEYS.APP_VERSION) ?? 'unknown'

  const deviceId = c.req.header('X-Device-Id')
  let killFlag: VersionResponse['killFlag'] = null
  if (deviceId) {
    const raw = await c.env.KV.get(KV_KEYS.KILL_FLAG(deviceId))
    if (raw) killFlag = JSON.parse(raw) as VersionResponse['killFlag']
  }

  return c.json({ api: apiVersion, app: appVersion, killFlag } satisfies VersionResponse)
})
