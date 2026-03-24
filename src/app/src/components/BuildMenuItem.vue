<template>
  <div
    draggable="true"
    class="build-menu-item flex items-center gap-2 px-3 rounded-lg border cursor-grab select-none transition-all duration-100"
    :class="archetypeClasses.border"
    :style="{ height: `${ITEM_H}px` }"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('select', props.def)"
  >
    <span class="w-2 h-2 rounded-full flex-shrink-0" :class="archetypeClasses.dot" />
    <span class="text-xs font-semibold text-base-content whitespace-nowrap">{{ props.def.displayName }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CardDefinition } from '@system-builder/schemas'

const props = defineProps<{
  def: CardDefinition
}>()

defineEmits<{ select: [def: CardDefinition] }>()

const ITEM_H = 40

// All classes declared statically so Tailwind includes them in the bundle
const ARCHETYPE_CLASSES: Record<string, { dot: string; border: string }> = {
  generator: { dot: 'bg-success',   border: 'border-success/40 bg-success/5 hover:bg-success/10' },
  refiner:   { dot: 'bg-info',      border: 'border-info/40 bg-info/5 hover:bg-info/10' },
  seller:    { dot: 'bg-warning',   border: 'border-warning/40 bg-warning/5 hover:bg-warning/10' },
  splitter:  { dot: 'bg-secondary', border: 'border-secondary/40 bg-secondary/5 hover:bg-secondary/10' },
  storage:   { dot: 'bg-accent',    border: 'border-accent/40 bg-accent/5 hover:bg-accent/10' },
  converter: { dot: 'bg-primary',   border: 'border-primary/40 bg-primary/5 hover:bg-primary/10' },
}

const archetypeClasses = ARCHETYPE_CLASSES[props.def.archetype]
  ?? { dot: 'bg-base-content', border: 'border-base-300 bg-base-100 hover:bg-base-200' }

function onDragStart(event: DragEvent) {
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      typeId: props.def.id,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
    }),
  )
}

function onDragEnd(event: DragEvent) {
  // Reset cursor — handled by CSS class removal automatically
  void event
}
</script>

<style scoped>
.build-menu-item:active {
  cursor: grabbing;
}
</style>
