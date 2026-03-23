// API response codes
export const API_CODES = {
  SAVE_CONFLICT: 'SAVE_CONFLICT',
} as const

// Device presence — heartbeat TTL while tab is open
export const DEVICE_HEARTBEAT_TTL_MS = 3 * 60 * 1000   // 3 minutes

// Kill Flag — only needs to outlive the losing tab's next heartbeat
export const KILL_FLAG_TTL_MS = 10 * 60 * 1000          // 10 minutes

// Save versioning
export const CURRENT_SAVE_VERSION = 1
