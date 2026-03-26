<template>
  <div class="p-6 flex flex-col gap-6 overflow-y-auto h-full">
    <template v-for="(group, category) in groupedUpgrades" :key="category">
      <!-- Category heading -->
      <div>
        <h3 class="text-[11px] font-semibold uppercase tracking-widest text-base-content/40 mb-3">
          {{ category }}
        </h3>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="upg in group"
            :key="upg.id"
            class="rounded-xl border bg-base-100 p-4 flex flex-col gap-3 transition-opacity"
            :class="isPurchased(upg.id) ? 'border-base-300 opacity-60' : 'border-base-300'"
          >
            <!-- Top row: name + tier dots -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-base-content">{{ upg.displayName }}</p>
                <p class="text-xs text-base-content/60 mt-0.5 leading-relaxed">{{ upg.description }}</p>
              </div>
              <!-- Tier progress dots -->
              <div v-if="upg.maxPurchases > 1" class="flex items-center gap-1 flex-shrink-0 mt-0.5">
                <span
                  v-for="i in upg.maxPurchases"
                  :key="i"
                  class="w-2 h-2 rounded-full"
                  :class="i <= purchaseCount(upg.id) ? 'bg-primary' : 'bg-base-300'"
                />
              </div>
              <span v-else-if="isPurchased(upg.id)" class="text-[11px] font-medium text-success flex-shrink-0 mt-0.5">
                Owned
              </span>
            </div>

            <!-- Bottom row: cost + buy button -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <template v-if="!isPurchased(upg.id)">
                  <span
                    v-for="cost in nextCost(upg)"
                    :key="cost.currencyType"
                    class="text-xs font-medium px-2 py-0.5 rounded-full"
                    :class="canAffordCost(cost) ? 'bg-base-200 text-base-content/80' : 'bg-error/10 text-error'"
                  >
                    {{ formatCost(cost) }}
                  </span>
                </template>
                <span v-else-if="purchaseCount(upg.id) < upg.maxPurchases">
                  <span
                    v-for="cost in nextCost(upg)"
                    :key="cost.currencyType"
                    class="text-xs font-medium px-2 py-0.5 rounded-full"
                    :class="canAffordCost(cost) ? 'bg-base-200 text-base-content/80' : 'bg-error/10 text-error'"
                  >
                    {{ formatCost(cost) }}
                  </span>
                </span>
                <span v-else class="text-xs text-base-content/30 italic">Maxed</span>
              </div>

              <button
                class="btn btn-xs btn-primary flex-shrink-0"
                :disabled="!canBuy(upg)"
                @click="buy(upg.id)"
              >
                {{ purchaseCount(upg.id) > 0 && upg.maxPurchases > 1 ? 'Upgrade' : 'Buy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <p v-if="Object.keys(groupedUpgrades).length === 0" class="text-sm text-base-content/40 italic text-center py-8">
      No upgrades available.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UpgradeDefinition, UpgradeCost } from '@system-builder/schemas'
import { upgrades } from '@system-builder/catalog'
import { costForTier } from '@system-builder/schemas'
import { useGameStore } from '@/stores/game'
import { useSimStore } from '@/stores/sim'

const gameStore = useGameStore()
const simStore  = useSimStore()

// Group upgrades by category
const groupedUpgrades = computed(() => {
  const groups: Record<string, UpgradeDefinition[]> = {}
  for (const upg of upgrades) {
    if (!groups[upg.category]) groups[upg.category] = []
    groups[upg.category].push(upg)
  }
  return groups
})

function purchaseCount(id: string): number {
  return gameStore.purchasedUpgrades[id] ?? 0
}

function isPurchased(id: string): boolean {
  const upg = upgrades.find(u => u.id === id)
  if (!upg) return false
  return purchaseCount(id) >= upg.maxPurchases
}

function nextCost(upg: UpgradeDefinition): UpgradeCost[] {
  return costForTier(upg.costConfig, purchaseCount(upg.id)) ?? []
}

function canAffordCost(cost: UpgradeCost): boolean {
  if (cost.currencyType === 'coin') return simStore.coin >= cost.amount
  if (cost.currencyType === 'researchPoints') return simStore.researchPoints >= cost.amount
  return false
}

function canBuy(upg: UpgradeDefinition): boolean {
  if (isPurchased(upg.id)) return false
  const cost = nextCost(upg)
  if (!cost.length) return false
  return cost.every(c => canAffordCost(c))
}

function buy(id: string) {
  gameStore.purchaseUpgrade(id)
}

function formatCost(cost: UpgradeCost): string {
  const label = cost.currencyType === 'coin' ? '🪙'
    : cost.currencyType === 'researchPoints' ? '🔬'
    : cost.currencyType
  return `${cost.amount.toLocaleString()} ${label}`
}
</script>
