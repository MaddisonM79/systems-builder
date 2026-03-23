// Raw IndexedDB helpers — no framework imports, no domain logic

const DB_NAME = 'sb-local'
const DB_VERSION = 1

export const STORE_SAVES = 'saves'
export const STORE_META  = 'meta'

export const KEY_SAVE      = 'local'
export const KEY_DEVICE_ID = 'deviceId'

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_SAVES)) db.createObjectStore(STORE_SAVES)
      if (!db.objectStoreNames.contains(STORE_META))  db.createObjectStore(STORE_META)
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function idbGet(db: IDBDatabase, store: string, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror   = () => reject(req.error)
  })
}

function idbPut(db: IDBDatabase, store: string, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readwrite').objectStore(store).put(value, key)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

export const readSaveBlob  = (db: IDBDatabase): Promise<unknown>  => idbGet(db, STORE_SAVES, KEY_SAVE)
export const writeSaveBlob = (db: IDBDatabase, data: unknown): Promise<void> => idbPut(db, STORE_SAVES, KEY_SAVE, data)
export const readDeviceId  = (db: IDBDatabase): Promise<unknown>  => idbGet(db, STORE_META, KEY_DEVICE_ID)
export const writeDeviceId = (db: IDBDatabase, id: string): Promise<void>  => idbPut(db, STORE_META, KEY_DEVICE_ID, id)
