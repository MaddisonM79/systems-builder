import { z } from 'zod'
import { API_CODES } from '@system-builder/constants'

// Save Snapshot — shown to user during conflict resolution
// Fields are a starting point; refine when save schema is fully designed
export const SaveSnapshotSchema = z.object({
  deviceId: z.string(),
  deviceName: z.string(),
  lastActiveAt: z.number(),
  lastSyncAt: z.number(),
  prestigeCount: z.number().int().nonnegative(),
  totalPlaytime: z.number().nonnegative(),
  activeChainCount: z.number().int().nonnegative(),
  totalCoinEarned: z.number().nonnegative(),
})

// SAVE_CONFLICT response — returned by API when a save push is blocked
export const SaveConflictResponseSchema = z.object({
  code: z.literal(API_CODES.SAVE_CONFLICT),
  local: SaveSnapshotSchema,
  cloud: SaveSnapshotSchema,
})

// Version check response — returned by GET /version on session start
export const VersionResponseSchema = z.object({
  version: z.string(),
  killFlag: z.object({
    rejectedAt: z.number(),
    winnerDeviceId: z.string(),
  }).nullable(),
})

export type SaveSnapshot = z.infer<typeof SaveSnapshotSchema>
export type SaveConflictResponse = z.infer<typeof SaveConflictResponseSchema>
export type VersionResponse = z.infer<typeof VersionResponseSchema>
