import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { HankoUser } from '@system-builder/schemas'

export const AVAILABLE_THEMES = [
  'retro', 'light', 'dark', 'valentine', 'pastel', 'luxury', 'dracula', 'dim', 'abyss',
] as const

export type Theme = typeof AVAILABLE_THEMES[number]

// ── localStorage keys ─────────────────────────────────────────────────────────
// Centralised here to prevent typo-induced silent preference loss

const LS_KEYS = {
  ROUTING_STYLE:   'sb-routing-style',
  GRID_STYLE:      'sb-grid-style',
  THEME:           'sb-theme',
  SHOW_BUFFER_FILL:  'sb-show-buffer-fill',
  SHOW_BUFFER_COUNT: 'sb-show-buffer-count',
} as const

// ── localStorage helpers ───────────────────────────────────────────────────────

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

function lsBool(key: string, fallback: boolean): boolean {
  const v = lsGet(key)
  return v === null ? fallback : v === 'true'
}

// ──────────────────────────────────────────────────────────────────────────────

export const useUserStore = defineStore('user', () => {
  const user       = ref<HankoUser | null>(null)
  const deviceId   = ref<string | null>(null)
  const isOnline   = ref(true)
  const syncStatus = ref<'idle' | 'syncing' | 'conflict' | 'error'>('idle')

  // User preferences — initialised from localStorage, watched and re-persisted on change
  const routingStyle   = ref<'orthogonal' | 'rounded' | 'straight'>(
    (lsGet(LS_KEYS.ROUTING_STYLE) as 'orthogonal' | 'rounded' | 'straight') ?? 'rounded',
  )
  const gridStyle      = ref<'lines' | 'dots' | 'cross'>(
    (lsGet(LS_KEYS.GRID_STYLE) as 'lines' | 'dots' | 'cross') ?? 'lines',
  )
  const theme          = ref<Theme>((lsGet(LS_KEYS.THEME) as Theme) ?? 'retro')
  const showBufferFill  = ref(lsBool(LS_KEYS.SHOW_BUFFER_FILL,  true))
  const showBufferCount = ref(lsBool(LS_KEYS.SHOW_BUFFER_COUNT, true))

  // Apply theme to DOM on init
  document.documentElement.dataset.theme = theme.value

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    document.documentElement.dataset.theme = newTheme
    lsSet(LS_KEYS.THEME, newTheme)
  }

  // Watch all other prefs and persist automatically
  watch(routingStyle,    v => lsSet(LS_KEYS.ROUTING_STYLE,      v))
  watch(gridStyle,       v => lsSet(LS_KEYS.GRID_STYLE,         v))
  watch(showBufferFill,  v => lsSet(LS_KEYS.SHOW_BUFFER_FILL,   String(v)))
  watch(showBufferCount, v => lsSet(LS_KEYS.SHOW_BUFFER_COUNT,  String(v)))

  return {
    user,
    deviceId,
    isOnline,
    syncStatus,
    routingStyle,
    gridStyle,
    theme,
    setTheme,
    showBufferFill,
    showBufferCount,
  }
})
