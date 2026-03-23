import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const prestigeCount = ref(0)
  const unlockedCardIds = ref<string[]>([])

  // TODO: story progress milestones
  // TODO: tech tree selections (accumulated, applied on prestige)
  // TODO: research points balance

  return {
    prestigeCount,
    unlockedCardIds,
  }
})
