<template>
  <div
    class="card-node relative rounded-lg shadow-lg transition-all duration-150"
    :class="[archetypeClasses.border, 'bg-base-100 border']"
    :style="{ width: `${CARD_W}px`, height: `${cardHeight}px` }"
  >
    <!-- Title bar -->
    <div class="flex items-center gap-2 px-3 bg-base-200 border-b border-base-300 rounded-t-lg" :style="{ height: `${TITLE_H}px` }">
      <span class="w-2 h-2 rounded-full flex-shrink-0" :class="archetypeClasses.dot" />
      <span class="text-xs font-semibold text-base-content truncate flex-1">{{ props.data.title }}</span>
      <span class="text-[9px] font-medium text-base-content/30 uppercase tracking-wider flex-shrink-0">{{ props.data.archetype }}</span>
      <span v-if="props.data.rateLabel" class="text-[9px] font-mono text-base-content/40 flex-shrink-0 ml-0.5">{{ props.data.rateLabel }}</span>
      <button
        v-if="props.selected"
        class="delete-btn flex items-center justify-center w-4 h-4 rounded-full bg-error/80 hover:bg-error text-error-content flex-shrink-0 transition-colors duration-100"
        title="Delete card"
        @click.stop="onDelete"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Input handles + rate/fill — left side, top-down -->
    <template v-for="(port, i) in props.data.inputs" :key="port.id">
      <Handle
        :id="port.id"
        type="target"
        :position="Position.Left"
        :style="{ top: `${inputTop(i)}px` }"
        class="port-handle port-handle--input"
      />
      <!-- fill bar -->
      <div v-if="userStore.showBufferFill" class="port-fill port-fill--input absolute" :style="fillBarStyle(simStore.portFill[port.id], i, 'input')" />
      <!-- rate + optional count stacked -->
      <div
        class="port-label port-label--input text-[10px] font-mono text-base-content/40 flex flex-col justify-center absolute"
        :style="{ top: `${inputTop(i) - PORT_H / 2}px`, height: `${PORT_H}px`, left: '16px', right: '50%' }"
      >
        <span>{{ formatRate(simStore.portRates[port.id]) }}</span>
        <span v-if="userStore.showBufferCount" class="text-[8px] text-base-content/30 leading-none mt-0.5">{{ formatCount(simStore.portCount[port.id]) }}</span>
      </div>
    </template>

    <!-- Output handles + rate/fill — right side, bottom-up -->
    <template v-for="(port, i) in props.data.outputs" :key="port.id">
      <Handle
        :id="port.id"
        type="source"
        :position="Position.Right"
        :style="{ top: `${outputTop(i)}px` }"
        class="port-handle port-handle--output"
      />
      <!-- fill bar -->
      <div v-if="userStore.showBufferFill" class="port-fill port-fill--output absolute" :style="fillBarStyle(simStore.portFill[port.id], i, 'output')" />
      <!-- rate + optional count stacked -->
      <div
        class="port-label port-label--output text-[10px] font-mono text-base-content/40 flex flex-col items-end justify-center absolute"
        :style="{ top: `${outputTop(i) - PORT_H / 2}px`, height: `${PORT_H}px`, right: '16px', left: '50%' }"
      >
        <span>{{ formatRate(simStore.portRates[port.id]) }}</span>
        <span v-if="userStore.showBufferCount" class="text-[8px] text-base-content/30 leading-none mt-0.5">{{ formatCount(simStore.portCount[port.id]) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { Port } from '@/engine/graph'
import { useSimStore } from '@/stores/sim'
import { useUserStore } from '@/stores/user'

interface CardNodeData {
  title:     string
  archetype: string
  inputs:    Port[]
  outputs:   Port[]
  rateLabel: string | null
}

const props = defineProps<{
  id: string
  data: CardNodeData
  selected: boolean
}>()

const { removeNodes } = useVueFlow()
const simStore  = useSimStore()
const userStore = useUserStore()

function onDelete() {
  removeNodes([props.id])
}

function formatRate(rate: number | undefined): string {
  const r = rate ?? 0
  if (r >= 10) return `${Math.round(r)}/s`
  if (r >= 1)  return `${r.toFixed(1)}/s`
  return `${r.toFixed(2)}/s`
}

const CARD_W = 200
const TITLE_H = 36
const PORT_H = 30

const BAR_W    = 3          // px
const BAR_PAD  = 5          // px from card edge
const BAR_SLOT = PORT_H - 8 // max bar height within a port row

function fillBarStyle(
  fill:  number | undefined,
  index: number,
  side:  'input' | 'output',
): Record<string, string> {
  const f     = Math.min(Math.max(fill ?? 0, 0), 1)
  const barH  = Math.max(f * BAR_SLOT, f > 0 ? 2 : 0)
  const cY    = side === 'input' ? inputTop(index) : outputTop(index)
  const top   = cY - BAR_SLOT / 2 + (BAR_SLOT - barH)  // grows upward from slot bottom
  const color = f > 0.8 ? 'var(--color-error)' : f > 0.4 ? 'var(--color-warning)' : 'var(--color-success)'

  const style: Record<string, string> = {
    width:           `${BAR_W}px`,
    height:          `${barH}px`,
    top:             `${top}px`,
    borderRadius:    `${BAR_W}px`,
    backgroundColor: color,
    opacity:         f === 0 ? '0' : String(0.3 + f * 0.7),
    transition:      'height 0.15s ease, top 0.15s ease, background-color 0.3s ease',
  }
  if (side === 'input') style.left  = `${BAR_PAD}px`
  else                  style.right = `${BAR_PAD}px`
  return style
}

function formatCount(n: number | undefined): string {
  const v = n ?? 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 10_000)    return `${Math.round(v / 1_000)}k`
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}k`
  return String(v)
}


// All classes declared statically so Tailwind includes them in the bundle
const ARCHETYPE_CLASSES: Record<string, { dot: string; border: string }> = {
  generator: { dot: 'bg-success',   border: 'border-success/30' },
  refiner:   { dot: 'bg-info',      border: 'border-info/30' },
  seller:    { dot: 'bg-warning',   border: 'border-warning/30' },
  splitter:  { dot: 'bg-secondary', border: 'border-secondary/30' },
  storage:   { dot: 'bg-accent',    border: 'border-accent/30' },
  converter: { dot: 'bg-primary',   border: 'border-primary/30' },
}

const archetypeClasses = computed(
  () => ARCHETYPE_CLASSES[props.data.archetype] ?? { dot: 'bg-base-content', border: 'border-base-300' }
)

const maxPorts = computed(() =>
  Math.max(props.data.inputs.length, props.data.outputs.length, 1)
)

const cardHeight = computed(() => TITLE_H + maxPorts.value * PORT_H)

function inputTop(index: number): number {
  return TITLE_H + index * PORT_H + PORT_H / 2
}

function outputTop(index: number): number {
  const rowFromTop = maxPorts.value - 1 - index
  return TITLE_H + rowFromTop * PORT_H + PORT_H / 2
}
</script>

<style scoped>
/* Handles — use DaisyUI CSS vars so they shift with the theme */
.port-handle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  cursor: crosshair;
  transition: transform 0.15s;
  background: var(--color-base-100);
}

.port-handle:hover {
  transform: translateY(-50%) scale(1.4);
}

.port-handle--input {
  border-color: var(--color-success);
  left: -6px;
}

.port-handle--output {
  border-color: var(--color-info);
  right: -6px;
}

/* Selected state via Vue Flow's wrapper class */
:global(.vue-flow__node.selected) .card-node {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
