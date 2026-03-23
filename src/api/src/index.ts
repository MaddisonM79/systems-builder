import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { saveRoutes } from './routes/save'
import { deviceRoutes } from './routes/device'
import { catalogRoutes } from './routes/catalog'
import { versionRoutes } from './routes/version'

const app = new Hono()

app.use('*', cors())

app.route('/save', saveRoutes)
app.route('/device', deviceRoutes)
app.route('/catalog', catalogRoutes)
app.route('/version', versionRoutes)

export default app
