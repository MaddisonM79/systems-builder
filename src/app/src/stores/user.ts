import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HankoUser } from '@system-builder/schemas'

export const useUserStore = defineStore('user', () => {
  const user = ref<HankoUser | null>(null)
  const deviceId = ref<string | null>(null)
  const isOnline = ref(true)
  const syncStatus = ref<'idle' | 'syncing' | 'conflict' | 'error'>('idle')

  // User preferences — persisted per user, synced to cloud
  const routingStyle = ref<'orthogonal' | 'rounded' | 'straight'>('rounded')

  return {
    user,
    deviceId,
    isOnline,
    syncStatus,
    routingStyle,
  }
})
