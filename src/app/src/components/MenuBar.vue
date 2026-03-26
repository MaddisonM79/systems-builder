<template>
  <nav class="flex items-stretch px-3 bg-base-200 border-b border-base-300 shrink-0 gap-0.5" style="height: 34px;">
    <button
      v-for="item in ITEMS"
      :key="item.id"
      class="px-3 text-xs font-medium transition-colors duration-100 border-b-2 -mb-px"
      :class="activeTab === item.id
        ? 'border-primary text-base-content'
        : 'border-transparent text-base-content/50 hover:text-base-content/80'"
      @click="emit('tab-change', item.id)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
export type TabId = 'build' | 'upgrades' | 'research' | 'prestige'

const ITEMS: Array<{ id: TabId; label: string }> = [
  { id: 'build',    label: 'Build' },
  { id: 'upgrades', label: 'Upgrades' },
  { id: 'research', label: 'Research' },
  { id: 'prestige', label: 'Prestige' },
]

defineProps<{ activeTab: TabId }>()

const emit = defineEmits<{
  'tab-change': [tab: TabId]
}>()
</script>
