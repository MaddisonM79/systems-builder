import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSimStore = defineStore('sim', () => {
  // Flat refs per value — never a single deep reactive object
  // Each value is independently reactive at minimal cost

  // Meta-currencies
  const coin = ref(0)
  const researchPoints = ref(0)

  // TODO: per-card-type XP map (cardTypeId → level + xp)
  // TODO: per-card-instance XP map (cardId → xp) for instance-scoped cards
  // TODO: resource pool levels map (cardId → poolLevel) — populated by simulation engine

  return {
    coin,
    researchPoints,
  }
})
