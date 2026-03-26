<template>
  <div class="flex flex-col h-full">

    <!-- RP balance -->
    <div class="flex items-center justify-end gap-1.5 px-4 pt-3 pb-1 text-xs font-medium text-base-content/50 shrink-0">
      <span>🔬</span>
      <span>{{ simStore.researchPoints.toLocaleString() }} RP</span>
    </div>

    <!-- Scrollable canvas -->
    <div class="overflow-auto p-4 pt-2 flex-1">
      <div
        class="relative"
        :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
      >

        <!-- SVG connector lines — rendered underneath nodes -->
        <svg
          class="absolute inset-0"
          :width="canvasW"
          :height="canvasH"
          style="overflow: visible;"
        >
          <path
            v-for="edge in edges"
            :key="edge.key"
            :d="edge.path"
            fill="none"
            :class="edge.lit ? 'stroke-primary' : 'stroke-base-content/20'"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        <!-- Tech nodes -->
        <div
          v-for="tech in techs"
          :key="tech.id"
          class="absolute flex flex-col gap-1 rounded-lg border px-3 py-2.5 transition-all duration-150"
          :style="{
            left:   positions.get(tech.id)!.x + 'px',
            top:    positions.get(tech.id)!.y + 'px',
            width:  NODE_W + 'px',
            height: NODE_H + 'px',
          }"
          :class="nodeClass(tech.id)"
        >
          <!-- Name + tick -->
          <div class="flex items-center justify-between gap-1">
            <p class="text-xs font-semibold leading-tight text-base-content truncate">
              {{ tech.displayName }}
            </p>
            <span v-if="isResearched(tech.id)" class="text-success text-xs shrink-0">✓</span>
          </div>

          <!-- Description -->
          <p class="text-[11px] leading-snug text-base-content/50 line-clamp-3 flex-1">
            {{ tech.description }}
          </p>

          <!-- Cost + action -->
          <div class="flex items-center justify-between gap-1 mt-auto">
            <span
              class="text-[11px] font-medium"
              :class="canAfford(tech.id) ? 'text-base-content/60' : 'text-error/70'"
            >
              {{ tech.rpCost }} 🔬
            </span>
            <button
              v-if="!isResearched(tech.id)"
              class="btn btn-xs shrink-0"
              :class="isAvailable(tech.id) ? 'btn-primary' : 'btn-ghost opacity-30'"
              :disabled="!isAvailable(tech.id)"
              @click="research(tech.id)"
            >
              Research
            </button>
            <span v-else class="text-[11px] font-semibold text-success shrink-0">Done</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResearchTechDefinition } from '@system-builder/schemas'
import { techs } from '@system-builder/catalog'
import { useGameStore } from '@/stores/game'
import { useSimStore } from '@/stores/sim'

const gameStore = useGameStore()
const simStore  = useSimStore()

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_W = 240
const NODE_H = 120
const GAP_X  = 80   // gap between tier columns
const GAP_Y  = 20   // gap between nodes in same tier
const PAD    = 8    // canvas padding so nodes at y=0 aren't flush to top

// ── Tier assignment ───────────────────────────────────────────────────────────
const tierMap = computed(() => {
  const map = new Map<string, number>()

  function getTier(id: string): number {
    if (map.has(id)) return map.get(id)!
    const tech = techs.find(t => t.id === id)
    if (!tech || tech.prerequisites.length === 0) { map.set(id, 0); return 0 }
    const tier = Math.max(...tech.prerequisites.map(getTier)) + 1
    map.set(id, tier)
    return tier
  }

  for (const tech of techs) getTier(tech.id)
  return map
})

// ── Positions ─────────────────────────────────────────────────────────────────
const positions = computed(() => {
  const byTier = new Map<number, ResearchTechDefinition[]>()
  for (const tech of techs) {
    const tier = tierMap.value.get(tech.id)!
    if (!byTier.has(tier)) byTier.set(tier, [])
    byTier.get(tier)!.push(tech)
  }

  const pos = new Map<string, { x: number; y: number }>()
  for (const [tier, nodes] of byTier) {
    nodes.forEach((tech, row) => {
      pos.set(tech.id, {
        x: PAD + tier * (NODE_W + GAP_X),
        y: PAD + row * (NODE_H + GAP_Y),
      })
    })
  }
  return pos
})

const canvasW = computed(() => {
  const numTiers = new Set(tierMap.value.values()).size
  return PAD * 2 + numTiers * NODE_W + Math.max(0, numTiers - 1) * GAP_X
})

const canvasH = computed(() => {
  const byTier = new Map<number, number>()
  for (const [, tier] of tierMap.value) {
    byTier.set(tier, (byTier.get(tier) ?? 0) + 1)
  }
  const max = Math.max(...byTier.values())
  return PAD * 2 + max * NODE_H + Math.max(0, max - 1) * GAP_Y
})

// ── Edges ─────────────────────────────────────────────────────────────────────
const edges = computed(() => {
  const result: Array<{ key: string; path: string; lit: boolean }> = []
  for (const tech of techs) {
    for (const prereqId of tech.prerequisites) {
      const from = positions.value.get(prereqId)
      const to   = positions.value.get(tech.id)
      if (!from || !to) continue

      // Exit from right-center of prereq, enter left-center of dependent
      const x1 = from.x + NODE_W
      const y1 = from.y + NODE_H / 2
      const x2 = to.x
      const y2 = to.y + NODE_H / 2
      const cx = (x1 + x2) / 2

      result.push({
        key:  `${prereqId}->${tech.id}`,
        path: `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`,
        lit:  isResearched(prereqId) && isResearched(tech.id),
      })
    }
  }
  return result
})

// ── State helpers ─────────────────────────────────────────────────────────────
function isResearched(id: string): boolean {
  return gameStore.researchedTechs.has(id)
}

function prereqsMet(id: string): boolean {
  const tech = techs.find(t => t.id === id)
  if (!tech) return false
  return tech.prerequisites.every(p => isResearched(p))
}

function canAfford(id: string): boolean {
  const tech = techs.find(t => t.id === id)
  if (!tech) return false
  return simStore.researchPoints >= tech.rpCost
}

function isAvailable(id: string): boolean {
  return !isResearched(id) && prereqsMet(id) && canAfford(id)
}

function nodeClass(id: string): string {
  if (isResearched(id))  return 'border-success/50 bg-success/5'
  if (prereqsMet(id))    return 'border-primary/50 bg-base-100'
  return 'border-base-300/50 bg-base-100 opacity-40'
}

function research(id: string): void {
  gameStore.researchTech(id)
}
</script>
