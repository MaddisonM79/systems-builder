<template>
  <header class="flex items-center justify-between px-4 h-12 bg-base-200 border-b border-base-300 shrink-0 z-20">

    <!-- Left: wordmark -->
    <div class="flex items-center gap-2">
      <span class="font-bold text-base tracking-tight text-base-content select-none">
        System<span class="text-primary">Builder</span>
      </span>
    </div>

    <!-- Right: help + theme switcher + user profile -->
    <div class="flex items-center gap-3">
      <button
        class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content text-sm font-semibold"
        @click="showHelp = true"
        title="Help"
      >?</button>
      <ThemeSwitcher />
      <UserProfile />
    </div>

  </header>

  <HelpModal v-model="showHelp" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import UserProfile from './UserProfile.vue'
import HelpModal from './HelpModal.vue'

const showHelp = ref(false)
</script>
