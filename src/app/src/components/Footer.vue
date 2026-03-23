<template>
  <footer class="flex items-center justify-between px-4 h-8 bg-base-200 border-t border-base-300 shrink-0 z-20">

    <!-- Left: routing + grid style dropdowns -->
    <div class="flex items-center gap-4">

      <!-- Routing style -->
      <div class="dropdown dropdown-top">
        <label tabindex="0" class="flex items-center gap-1.5 cursor-pointer select-none">
          <span class="text-xs text-base-content/40">routing</span>
          <span class="text-xs text-base-content/70 capitalize">{{ routingStyle }}</span>
          <svg class="w-2.5 h-2.5 text-base-content/30" fill="none" viewBox="0 0 10 6">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </label>
        <ul tabindex="0" class="dropdown-content menu menu-xs bg-base-100 border border-base-300 rounded-box shadow-md mb-1 p-1 min-w-28">
          <li v-for="style in ROUTING_STYLES" :key="style">
            <a
              class="capitalize text-xs"
              :class="routingStyle === style ? 'active' : ''"
              @click="userStore.routingStyle = style"
            >{{ style }}</a>
          </li>
        </ul>
      </div>

      <!-- Grid style -->
      <div class="dropdown dropdown-top">
        <label tabindex="0" class="flex items-center gap-1.5 cursor-pointer select-none">
          <span class="text-xs text-base-content/40">grid</span>
          <span class="text-xs text-base-content/70 capitalize">{{ gridStyle }}</span>
          <svg class="w-2.5 h-2.5 text-base-content/30" fill="none" viewBox="0 0 10 6">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </label>
        <ul tabindex="0" class="dropdown-content menu menu-xs bg-base-100 border border-base-300 rounded-box shadow-md mb-1 p-1 min-w-28">
          <li v-for="style in GRID_STYLES" :key="style">
            <a
              class="capitalize text-xs"
              :class="gridStyle === style ? 'active' : ''"
              @click="userStore.gridStyle = style"
            >{{ style }}</a>
          </li>
        </ul>
      </div>

    </div>

    <!-- Right: version -->
    <span class="text-xs text-base-content/30 select-none">v0.0.1</span>

  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore    = useUserStore()
const routingStyle = computed(() => userStore.routingStyle)
const gridStyle    = computed(() => userStore.gridStyle)

const ROUTING_STYLES = ['orthogonal', 'rounded', 'straight'] as const
const GRID_STYLES    = ['lines', 'dots', 'cross'] as const
</script>
