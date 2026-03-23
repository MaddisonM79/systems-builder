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
    </div>

    <!-- Input handles + labels — left side, top-down -->
    <template v-for="(port, i) in props.data.inputs" :key="port.id">
      <Handle
        :id="port.id"
        type="target"
        :position="Position.Left"
        :style="{ top: `${inputTop(i)}px` }"
        class="port-handle port-handle--input"
      />
      <div
        class="port-label port-label--input text-[11px] text-base-content/50 flex items-center absolute"
        :style="{ top: `${inputTop(i) - PORT_H / 2}px`, height: `${PORT_H}px`, left: '16px', right: '50%' }"
      >
        {{ port.label }}
      </div>
    </template>

    <!-- Output handles + labels — right side, bottom-up -->
    <template v-for="(port, i) in props.data.outputs" :key="port.id">
      <Handle
        :id="port.id"
        type="source"
        :position="Position.Right"
        :style="{ top: `${outputTop(i)}px` }"
        class="port-handle port-handle--output"
      />
      <div
        class="port-label port-label--output text-[11px] text-base-content/50 flex items-center justify-end absolute"
        :style="{ top: `${outputTop(i) - PORT_H / 2}px`, height: `${PORT_H}px`, right: '16px', left: '50%' }"
      >
        {{ port.label }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { Port } from '@/engine/graph'

interface CardNodeData {
  title: string
  archetype: string
  inputs: Port[]
  outputs: Port[]
}

const props = defineProps<{
  data: CardNodeData
  selected: boolean
}>()

const CARD_W = 200
const TITLE_H = 36
const PORT_H = 30

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
