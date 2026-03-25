<template>
  <div class="build-menu rounded-2xl shadow-xl overflow-hidden" style="background: oklch(var(--b2) / 0.92); backdrop-filter: blur(12px);">
    <!-- Tab row -->
    <div class="flex items-stretch border-b border-base-300/50" style="height: 36px;">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-1.5 px-4 text-xs font-medium transition-colors duration-100"
        :class="activeTab === tab.id
          ? ['text-base-content', 'border-b-2', tab.activeClass]
          : 'text-base-content/40 hover:text-base-content/70'"
        @click="setTab(tab.id)"
      >
        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="tab.dotClass" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Card chips row -->
    <div class="flex items-center gap-2 px-3 overflow-x-auto" style="height: 56px;">
      <BuildMenuItem
        v-for="def in activeCards"
        :key="def.id"
        :def="def"
        :class="selectedDef?.id === def.id ? 'ring-1 ring-base-content/30' : ''"
        @select="onSelect"
      />
      <span v-if="activeCards.length === 0" class="text-xs text-base-content/30 italic">
        No cards unlocked
      </span>
    </div>

    <!-- Detail strip — visible when a card is selected -->
    <Transition name="detail">
      <div v-if="selectedDef" class="border-t border-base-300/50 px-4 pt-2.5 pb-3 flex flex-col gap-2">
        <!-- Description -->
        <p class="text-xs text-base-content/70 leading-relaxed">{{ selectedDef.description }}</p>
        <!-- Stats + costs row -->
        <div class="flex items-center justify-between gap-4">
          <!-- Archetype-specific stat chips -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              v-for="stat in cardStats(selectedDef)"
              :key="stat"
              class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-base-300/60 text-base-content/70"
            >{{ stat }}</span>
          </div>
          <!-- Costs -->
          <div class="flex flex-col items-end gap-0.5 flex-shrink-0 text-[11px] text-base-content/50">
            <span>Place: <span class="text-base-content/80">{{ formatPlacement(selectedDef.placementCost) }}</span></span>
            <span>Unlock: <span class="text-base-content/80">{{ formatUnlock(selectedDef.unlockCondition) }}</span></span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CardDefinition, UnlockCondition } from '@system-builder/schemas'
import { generators, refiners, sellers, splitters, combiners, storage, researchers } from '@system-builder/catalog'
import { useGameStore } from '@/stores/game'
import BuildMenuItem from './BuildMenuItem.vue'

const gameStore = useGameStore()

// All archetype tab configs — static so Tailwind bundles all classes.
// `id` is the unique tab key; a tab may contain cards from multiple archetypes.
const ALL_TABS: Array<{
  id: string
  label: string
  cards: CardDefinition[]
  dotClass: string
  activeClass: string
}> = [
  { id: 'generator',  label: 'Generator',  cards: generators,                   dotClass: 'bg-success',   activeClass: 'border-success' },
  { id: 'refiner',    label: 'Refiner',    cards: refiners,                     dotClass: 'bg-info',      activeClass: 'border-info' },
  { id: 'storage',    label: 'Storage',    cards: storage,                      dotClass: 'bg-accent',    activeClass: 'border-accent' },
  { id: 'routing',    label: 'Routing',    cards: [...splitters, ...combiners], dotClass: 'bg-secondary', activeClass: 'border-secondary' },
  { id: 'seller',     label: 'Seller',     cards: sellers,                      dotClass: 'bg-warning',   activeClass: 'border-warning' },
  { id: 'researcher', label: 'Researcher', cards: researchers,                  dotClass: 'bg-primary',   activeClass: 'border-primary' },
]

const tabs = ALL_TABS.filter(t => t.cards.length > 0)

const activeTab = ref<string>(tabs[0]?.id ?? 'generator')
const selectedDef = ref<CardDefinition | null>(null)

const activeCards = computed<CardDefinition[]>(() => {
  const all = ALL_TABS.find(t => t.id === activeTab.value)?.cards ?? []
  return all.filter(d => gameStore.unlockedCardIds.has(d.id))
})

function setTab(id: string) {
  activeTab.value = id
  selectedDef.value = null
}

function onSelect(def: CardDefinition) {
  // Toggle off if already selected
  selectedDef.value = selectedDef.value?.id === def.id ? null : def
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function flowRate(flow: { mode: string; ratePerSecond?: number; batchSize?: number; intervalSeconds?: number }): string {
  if (flow.mode === 'continuous') return `${flow.ratePerSecond}/s`
  return `${flow.batchSize} per ${flow.intervalSeconds}s`
}

function cardStats(def: CardDefinition): string[] {
  switch (def.archetype) {
    case 'generator':
      return [`${flowRate(def.flow)} ${cap(def.outputResource)}`]

    case 'refiner':
      if (def.refinerMode.mode === 'upgrade') {
        const { valueBonus, slotCost } = def.refinerMode
        return [
          `+${valueBonus} Coin/unit`,
          `${slotCost} slot${slotCost !== 1 ? 's' : ''}`,
        ]
      } else {
        const { inputResource, outputResource, conversionRatio: r } = def.refinerMode
        return [`${r.inputUnits} ${cap(inputResource)} → ${r.outputUnits} ${cap(outputResource)}`]
      }

    case 'storage':
      return [
        `${def.baseCapacity} capacity`,
        `In ${flowRate(def.inputFlow)} · Out ${flowRate(def.outputFlow)}`,
      ]

    case 'splitter':
      return [`${def.defaultOutputPortCount} outputs`]

    case 'seller': {
      const resources = def.acceptedResources.map(r => cap(r.resource)).join(', ')
      return [`Buys: ${resources}`, `Pays: ${cap(def.outputCurrency)}`]
    }

    case 'researcher': {
      const resources = def.acceptedResources.map(r => cap(r.resource)).join(', ')
      return [`Researches: ${resources}`, `Outputs: RP`]
    }

    default:
      return []
  }
}

function formatUnlock(cond: UnlockCondition): string {
  switch (cond.type) {
    case 'free':           return 'Free'
    case 'coin':           return `${cond.amount} Coin`
    case 'researchPoints': return `${cond.amount} RP`
    case 'xp':             return `${cond.xpThreshold} XP`
    case 'storyMilestone': return 'Story unlock'
  }
}

function formatPlacement(cost: CardDefinition['placementCost']): string {
  if (!cost) return 'Free'
  const label = cost.currencyType.charAt(0).toUpperCase() + cost.currencyType.slice(1)
  return `${cost.amount} ${label}`
}
</script>

<style scoped>
.build-menu {
  min-width: 320px;
  max-width: 640px;
}

.build-menu div::-webkit-scrollbar {
  display: none;
}

/* Detail strip slide-down transition */
.detail-enter-active,
.detail-leave-active {
  transition: max-height 0.15s ease, opacity 0.15s ease;
  max-height: 120px;
  overflow: hidden;
}

.detail-enter-from,
.detail-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
