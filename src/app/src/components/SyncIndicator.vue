<template>
  <div
    class="flex items-center gap-1 text-xs select-none"
    :title="label"
  >
    <!-- Dot -->
    <span
      class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
      :class="dotClass"
    />
    <!-- Label — only shown on non-idle states -->
    <span
      v-if="syncStatus !== 'idle'"
      class="text-base-content/50"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const syncStatus = computed(() => userStore.syncStatus)
const isOnline = computed(() => userStore.isOnline)

const dotClass = computed(() => {
  if (!isOnline.value) return 'bg-base-content/30'
  switch (syncStatus.value) {
    case 'syncing':  return 'bg-info animate-pulse'
    case 'conflict': return 'bg-warning animate-pulse'
    case 'error':    return 'bg-error'
    default:         return 'bg-success'
  }
})

const label = computed(() => {
  if (!isOnline.value) return 'Offline'
  switch (syncStatus.value) {
    case 'syncing':  return 'Syncing…'
    case 'conflict': return 'Conflict'
    case 'error':    return 'Sync error'
    default:         return 'Saved'
  }
})
</script>
