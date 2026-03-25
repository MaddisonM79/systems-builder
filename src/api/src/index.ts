import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { saveRoutes } from './routes/save'
import { deviceRoutes } from './routes/device'
import { catalogRoutes } from './routes/catalog'
import { versionRoutes } from './routes/version'

export type Bindings = {
  DB: D1Database
  KV: KVNamespace
  API_VERSION: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.route('/save', saveRoutes)
app.route('/device', deviceRoutes)
app.route('/catalog', catalogRoutes)
app.route('/version', versionRoutes)

export default app
