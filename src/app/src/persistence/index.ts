import { openDb, readSaveBlob, writeSaveBlob, readDeviceId, writeDeviceId } from './idb'
import { SaveSchema, type SaveV1 } from '@system-builder/schemas'

// Module-level singleton — one DB connection per tab lifetime
let _db: IDBDatabase | null = null

async function getDb(): Promise<IDBDatabase> {
  if (!_db) _db = await openDb()
  return _db
}

export async function loadSave(): Promise<SaveV1 | null> {
  const db = await getDb()
  const raw = await readSaveBlob(db)
  if (raw === null) return null

  const result = SaveSchema.safeParse(raw)
  if (!result.success) {
    console.warn('[persistence] Saved data failed schema validation — treating as empty:', result.error)
    return null
  }

  return result.data as SaveV1
}

export async function writeSave(save: SaveV1): Promise<void> {
  const db = await getDb()
  // JSON round-trip strips Vue reactive proxies — IDB structured clone cannot serialize Proxy objects
  await writeSaveBlob(db, JSON.parse(JSON.stringify(save)))
}

export async function getOrCreateDeviceId(): Promise<string> {
  const db = await getDb()
  const existing = await readDeviceId(db)
  if (typeof existing === 'string' && existing.length > 0) return existing

  const id = crypto.randomUUID()
  await writeDeviceId(db, id)
  return id
}
