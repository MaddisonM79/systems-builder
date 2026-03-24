import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { HankoUser } from '@system-builder/schemas'

export const AVAILABLE_THEMES = [
  'retro', 'light', 'dark', 'valentine', 'pastel', 'luxury', 'dracula', 'dim', 'abyss',
] as const

export type Theme = typeof AVAILABLE_THEMES[number]

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
    (lsGet('sb-routing-style') as 'orthogonal' | 'rounded' | 'straight') ?? 'rounded',
  )
  const gridStyle      = ref<'lines' | 'dots' | 'cross'>(
    (lsGet('sb-grid-style') as 'lines' | 'dots' | 'cross') ?? 'lines',
  )
  const theme          = ref<Theme>((lsGet('sb-theme') as Theme) ?? 'retro')
  const showBufferFill  = ref(lsBool('sb-show-buffer-fill',  true))
  const showBufferCount = ref(lsBool('sb-show-buffer-count', true))

  // Apply theme to DOM on init
  document.documentElement.dataset.theme = theme.value

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    document.documentElement.dataset.theme = newTheme
    lsSet('sb-theme', newTheme)
  }

  // Watch all other prefs and persist automatically
  watch(routingStyle,   v => lsSet('sb-routing-style',      v))
  watch(gridStyle,      v => lsSet('sb-grid-style',          v))
  watch(showBufferFill,  v => lsSet('sb-show-buffer-fill',  String(v)))
  watch(showBufferCount, v => lsSet('sb-show-buffer-count', String(v)))

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
