<template>
  <div class="flex items-center gap-2">

    <!-- Logged in -->
    <template v-if="user">
      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-ghost btn-xs btn-circle avatar">
          <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-xs select-none">
            {{ initials }}
          </div>
        </button>
        <ul tabindex="0" class="dropdown-content menu menu-sm shadow-lg bg-base-200 border border-base-300 rounded-box w-48 mt-1 p-1 z-30">
          <li class="menu-title px-2 py-1">
            <span class="text-xs text-base-content/60 truncate">{{ user.email }}</span>
          </li>
          <li><a class="text-xs">Settings</a></li>
          <li><a class="text-xs text-error">Sign out</a></li>
        </ul>
      </div>
    </template>

    <!-- Logged out -->
    <template v-else>
      <button class="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content">
        Sign in
      </button>
    </template>

    <!-- Sync status indicator -->
    <SyncIndicator />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import SyncIndicator from './SyncIndicator.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const initials = computed(() => {
  if (!user.value?.email) return '?'
  return user.value.email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()
})
</script>
