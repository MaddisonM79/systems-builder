import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { catalog, upgrades, techs } from '@system-builder/catalog'
import { costForTier } from '@system-builder/schemas'
import { UNLOCK_CONDITION_TYPES } from '@system-builder/constants'
import { useSimStore } from './sim'

export const useGameStore = defineStore('game', () => {
  const prestigeCount = ref(0)

  // Raw purchase state — upgradeId → times purchased
  const purchasedUpgrades = ref<Record<string, number>>({})

  // Researched tech IDs — accumulated across runs; applied permanently on prestige
  const researchedTechs = ref<Set<string>>(new Set())

  // Derived: set of card IDs the player can place.
  // Free cards always included; upgrade-unlocked cards added when purchased.
  const unlockedCardIds = computed<Set<string>>(() => {
    const unlocked = new Set(
      catalog
        .filter(d => d.unlockCondition.type === UNLOCK_CONDITION_TYPES.FREE)
        .map(d => d.id),
    )
    for (const upg of upgrades) {
      if (upg.effect.type === 'unlock_card') {
        if ((purchasedUpgrades.value[upg.id] ?? 0) > 0) {
          unlocked.add(upg.effect.cardId)
        }
      }
    }
    return unlocked
  })

  // Attempt to purchase an upgrade. Returns true on success, false if insufficient
  // funds or already maxed. Deducts currency from simStore on success.
  function purchaseUpgrade(upgradeId: string): boolean {
    const upg = upgrades.find(u => u.id === upgradeId)
    if (!upg) return false

    const count = purchasedUpgrades.value[upgradeId] ?? 0
    if (count >= upg.maxPurchases) return false

    const cost = costForTier(upg.costConfig, count)
    if (!cost) return false

    const simStore = useSimStore()

    // Validate
    for (const c of cost) {
      if (c.currencyType === 'coin' && simStore.coin < c.amount) return false
      if (c.currencyType === 'researchPoints' && simStore.researchPoints < c.amount) return false
    }

    // Deduct
    for (const c of cost) {
      if (c.currencyType === 'coin') simStore.coin -= c.amount
      if (c.currencyType === 'researchPoints') simStore.researchPoints -= c.amount
    }

    // Record — spread to trigger reactivity
    purchasedUpgrades.value = { ...purchasedUpgrades.value, [upgradeId]: count + 1 }
    return true
  }

  // Attempt to research a tech. Returns true on success.
  // Prereqs must all be researched; player must have enough RP.
  function researchTech(techId: string): boolean {
    const tech = techs.find(t => t.id === techId)
    if (!tech) return false
    if (researchedTechs.value.has(techId)) return false
    if (!tech.prerequisites.every(p => researchedTechs.value.has(p))) return false

    const simStore = useSimStore()
    if (simStore.researchPoints < tech.rpCost) return false

    simStore.researchPoints -= tech.rpCost
    // Spread into new Set to trigger reactivity
    researchedTechs.value = new Set([...researchedTechs.value, techId])
    return true
  }

  // TODO: story progress milestones
  // TODO: tech tree selections (accumulated, applied on prestige)

  return {
    prestigeCount,
    purchasedUpgrades,
    unlockedCardIds,
    purchaseUpgrade,
    researchedTechs,
    researchTech,
  }
})
