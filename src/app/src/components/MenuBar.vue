<template>
  <nav class="flex items-stretch px-3 bg-base-200 border-b border-base-300 shrink-0 gap-0.5" style="height: 34px;">
    <button
      v-for="item in ITEMS"
      :key="item.id"
      class="px-3 text-xs font-medium transition-colors duration-100 border-b-2 -mb-px"
      :class="item.id === 'build' && buildActive
        ? 'border-primary text-base-content'
        : 'border-transparent text-base-content/50 hover:text-base-content/80'"
      @click="onItemClick(item.id)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
type MenuItemId = 'build' | 'upgrades' | 'research' | 'prestige'

const ITEMS: Array<{ id: MenuItemId; label: string }> = [
  { id: 'build',    label: 'Build' },
  { id: 'upgrades', label: 'Upgrades' },
  { id: 'research', label: 'Research' },
  { id: 'prestige', label: 'Prestige' },
]

defineProps<{ buildActive: boolean }>()

const emit = defineEmits<{
  'toggle-build':   []
  'open-upgrades':  []
  'open-research':  []
  'open-prestige':  []
}>()

function onItemClick(id: MenuItemId) {
  switch (id) {
    case 'build':    emit('toggle-build');   break
    case 'upgrades': emit('open-upgrades');  break
    case 'research': emit('open-research');  break
    case 'prestige': emit('open-prestige');  break
  }
}
</script>
