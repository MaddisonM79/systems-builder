import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// saves — one row per user per device
// data column holds the full save state as a JSON string
// validated separately by SaveSchema (src/packages/schemas/src/save.ts)
export const saves = sqliteTable('saves', {
  id:              text('id').primaryKey(),
  userId:          text('user_id').notNull(),
  deviceId:        text('device_id').notNull(),
  version:         integer('version').notNull(),
  lastSyncVersion: integer('last_sync_version').notNull(),
  data:            text('data').notNull(),
  createdAt:       integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:       integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// TODO: add tables as game design solidifies
// Candidates: users, prestige_history, tech_tree_selections, leaderboard
