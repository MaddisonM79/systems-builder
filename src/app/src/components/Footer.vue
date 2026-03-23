<template>
  <footer class="flex items-center justify-between px-4 h-8 bg-base-200 border-t border-base-300 shrink-0 z-20">

    <!-- Left: routing style toggle -->
    <div class="flex items-center gap-3">
      <span class="text-xs text-base-content/40 select-none">routing</span>
      <div class="flex gap-0.5">
        <button
          v-for="style in ROUTING_STYLES"
          :key="style"
          class="btn btn-xs border-none text-xs capitalize"
          :class="routingStyle === style
            ? 'bg-base-300 text-base-content'
            : 'bg-transparent text-base-content/40 hover:text-base-content hover:bg-base-300'"
          @click="userStore.routingStyle = style"
        >
          {{ style }}
        </button>
      </div>
    </div>

    <!-- Right: version -->
    <span class="text-xs text-base-content/30 select-none">v0.0.1</span>

  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const routingStyle = computed(() => userStore.routingStyle)

const ROUTING_STYLES = ['orthogonal', 'rounded', 'straight'] as const
</script>
