import { Hono } from 'hono'

export const catalogRoutes = new Hono()

// GET /catalog — serve card type definitions from KV
// No auth required — catalog is not user-specific
catalogRoutes.get('/', async (c) => {
  // TODO: read card definitions from KV
  // TODO: validate with Zod before returning
  return c.json({ cards: [] })
})
