<template>
  <header class="flex items-center justify-between px-4 h-12 bg-base-200 border-b border-base-300 shrink-0 z-20">

    <!-- Left: wordmark -->
    <div class="flex items-center gap-2">
      <span class="font-bold text-base tracking-tight text-base-content select-none">
        System<span class="text-primary">Builder</span>
      </span>
    </div>

    <!-- Right: theme switcher + user profile -->
    <div class="flex items-center gap-3">
      <ThemeSwitcher />
      <UserProfile />
    </div>

  </header>
</template>

<script setup lang="ts">
import ThemeSwitcher from './ThemeSwitcher.vue'
import UserProfile from './UserProfile.vue'
</script>
