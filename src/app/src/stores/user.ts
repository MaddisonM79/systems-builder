import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HankoUser } from '@system-builder/schemas'

export const AVAILABLE_THEMES = [
  'retro', 'light', 'dark', 'valentine', 'pastel', 'luxury', 'dracula', 'dim', 'abyss',
] as const

export type Theme = typeof AVAILABLE_THEMES[number]

export const useUserStore = defineStore('user', () => {
  const user = ref<HankoUser | null>(null)
  const deviceId = ref<string | null>(null)
  const isOnline = ref(true)
  const syncStatus = ref<'idle' | 'syncing' | 'conflict' | 'error'>('idle')

  // User preferences — persisted per user, synced to cloud
  const routingStyle = ref<'orthogonal' | 'rounded' | 'straight'>('rounded')
  const gridStyle    = ref<'lines' | 'dots' | 'cross'>('lines')
  const theme = ref<Theme>('retro')

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    document.documentElement.dataset.theme = newTheme
    localStorage.setItem('sb-theme', newTheme)
  }

  return {
    user,
    deviceId,
    isOnline,
    syncStatus,
    routingStyle,
    gridStyle,
    theme,
    setTheme,
  }
})
