import { defineStore } from 'pinia'
import { ref, shallowRef, triggerRef } from 'vue'

export const useSimStore = defineStore('sim', () => {
  // Flat refs per scalar value — never a single deep reactive object
  const coin = ref(0)
  const researchPoints = ref(0)

  // Per-card-instance maps — shallowRef; call triggerRef after mutating
  const cardXp     = shallowRef<Record<string, number>>({})
  const cardLevels = shallowRef<Record<string, number>>({})
  const poolLevels = shallowRef<Record<string, number>>({})

  function setCardXp(cardId: string, xp: number): void {
    cardXp.value[cardId] = xp
    triggerRef(cardXp)
  }

  function setCardLevel(cardId: string, level: number): void {
    cardLevels.value[cardId] = level
    triggerRef(cardLevels)
  }

  function setPoolLevel(cardId: string, level: number): void {
    poolLevels.value[cardId] = level
    triggerRef(poolLevels)
  }

  return {
    coin,
    researchPoints,
    cardXp,
    cardLevels,
    poolLevels,
    setCardXp,
    setCardLevel,
    setPoolLevel,
  }
})
