<template>
  <div class="flex items-center gap-2 bg-base-200 border border-base-300 rounded-lg px-2 py-1 shadow-md">
    <span class="text-xs text-base-content/50 font-medium select-none">theme</span>
    <select
      class="select select-xs bg-base-200 border-none text-base-content text-xs focus:outline-none cursor-pointer min-w-24"
      :value="userStore.theme"
      @change="onChange"
    >
      <option
        v-for="t in AVAILABLE_THEMES"
        :key="t"
        :value="t"
      >
        {{ t }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, AVAILABLE_THEMES, type Theme } from '@/stores/user'

const userStore = useUserStore()

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as Theme
  userStore.setTheme(value)
}
</script>
