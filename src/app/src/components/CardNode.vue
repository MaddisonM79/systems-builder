<template>
  <div
    class="card-node"
    :class="`card-node--${props.data.archetype}`"
    :style="{ width: `${CARD_W}px`, height: `${cardHeight}px` }"
  >
    <!-- Title bar -->
    <div class="card-title">
      <span class="card-title__dot" />
      <span class="card-title__text">{{ props.data.title }}</span>
      <span class="card-title__archetype">{{ props.data.archetype }}</span>
    </div>

    <!-- Input handles (Vue Flow connection points) + labels — left side, top-down -->
    <template v-for="(port, i) in props.data.inputs" :key="port.id">
      <Handle
        :id="port.id"
        type="target"
        :position="Position.Left"
        :style="{ top: `${inputTop(i)}px` }"
        class="port-handle port-handle--input"
      />
      <div
        class="port-label port-label--input"
        :style="{ top: `${inputTop(i) - PORT_H / 2}px`, height: `${PORT_H}px` }"
      >
        <span>{{ port.label }}</span>
      </div>
    </template>

    <!-- Output handles (Vue Flow connection points) + labels — right side, bottom-up -->
    <template v-for="(port, i) in props.data.outputs" :key="port.id">
      <Handle
        :id="port.id"
        type="source"
        :position="Position.Right"
        :style="{ top: `${outputTop(i)}px` }"
        class="port-handle port-handle--output"
      />
      <div
        class="port-label port-label--output"
        :style="{ top: `${outputTop(i) - PORT_H / 2}px`, height: `${PORT_H}px` }"
      >
        <span>{{ port.label }}</span>
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

const maxPorts = computed(() =>
  Math.max(props.data.inputs.length, props.data.outputs.length, 1)
)

const cardHeight = computed(() => TITLE_H + maxPorts.value * PORT_H)

// Inputs fill top-down: index 0 is topmost
function inputTop(index: number): number {
  return TITLE_H + index * PORT_H + PORT_H / 2
}

// Outputs fill bottom-up: index 0 is the bottom row
function outputTop(index: number): number {
  const rowFromTop = maxPorts.value - 1 - index
  return TITLE_H + rowFromTop * PORT_H + PORT_H / 2
}
</script>

<style scoped>
.card-node {
  position: relative;
  background: #141420;
  border: 1px solid #2a2a4e;
  border-radius: 8px;
  overflow: visible;
  font-family: 'Inter', system-ui, sans-serif;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  transition: border-color 0.15s, box-shadow 0.15s;
}

:global(.vue-flow__node.selected) .card-node,
:global(.vue-flow__node:hover) .card-node {
  box-shadow: 0 0 0 1px #60a5fa, 0 4px 24px rgba(96, 165, 250, 0.15);
  border-color: #60a5fa;
}

/* Title bar */
.card-title {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 10px;
  border-bottom: 1px solid #2a2a4e;
  border-radius: 7px 7px 0 0;
  background: #1e1e30;
}

.card-title__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-title__text {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.card-title__archetype {
  font-size: 9px;
  font-weight: 500;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

/* Port labels — absolutely positioned to match handle positions */
.port-label {
  position: absolute;
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #64748b;
  pointer-events: none;
  user-select: none;
  transition: color 0.15s;
}

.port-label--input {
  left: 16px;
  right: 50%;
  padding-left: 2px;
}

.port-label--output {
  right: 16px;
  left: 50%;
  justify-content: flex-end;
  padding-right: 2px;
}

/* Vue Flow handles — the actual connection points */
.port-handle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  cursor: crosshair;
  transition: transform 0.15s, opacity 0.15s;
}

.port-handle:hover {
  transform: translateY(-50%) scale(1.4);
}

.port-handle--input {
  background: #0a0a0f;
  border-color: #4ade80;
  left: -6px;
}

.port-handle--output {
  background: #0a0a0f;
  border-color: #60a5fa;
  right: -6px;
}

/* Archetype: title dot color */
.card-node--generator .card-title__dot  { background: #4ade80; }
.card-node--refiner   .card-title__dot  { background: #60a5fa; }
.card-node--seller    .card-title__dot  { background: #fbbf24; }
.card-node--splitter  .card-title__dot  { background: #f97316; }
.card-node--storage   .card-title__dot  { background: #a78bfa; }
.card-node--converter .card-title__dot  { background: #2dd4bf; }

/* Archetype: card border accent */
.card-node--generator { border-color: #1e3a1e; }
.card-node--refiner   { border-color: #1e2a3a; }
.card-node--seller    { border-color: #3a2e10; }
.card-node--splitter  { border-color: #3a2210; }
.card-node--storage   { border-color: #28183a; }
.card-node--converter { border-color: #143a3a; }

/* Port label color when card is hovered */
:global(.vue-flow__node:hover) .port-label {
  color: #94a3b8;
}
</style>
