<template>
  <input :id="MODAL_ID" type="checkbox" class="modal-toggle" v-model="open" />

  <div class="modal modal-bottom sm:modal-middle" role="dialog">
    <div class="modal-box max-w-sm p-0 overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-200 shrink-0">
        <h2 class="font-semibold text-base-content text-sm tracking-wide">Settings</h2>
        <label :for="MODAL_ID" class="btn btn-ghost btn-xs btn-circle">✕</label>
      </div>

      <!-- Body -->
      <div class="flex flex-col gap-6 p-5">

        <!-- Theme -->
        <div>
          <div class="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-3">Theme</div>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="t in AVAILABLE_THEMES"
              :key="t"
              class="px-2 py-1.5 rounded text-xs capitalize border transition-colors"
              :class="userStore.theme === t
                ? 'bg-primary text-primary-content border-primary'
                : 'bg-base-200 text-base-content/60 border-base-300 hover:border-base-content/30 hover:text-base-content'"
              @click="userStore.setTheme(t)"
            >{{ t }}</button>
          </div>
        </div>

        <!-- Grid -->
        <div>
          <div class="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-3">Grid</div>
          <div class="flex gap-1.5">
            <button
              v-for="style in GRID_STYLES"
              :key="style"
              class="flex-1 px-3 py-1.5 rounded text-xs capitalize border transition-colors"
              :class="userStore.gridStyle === style
                ? 'bg-primary text-primary-content border-primary'
                : 'bg-base-200 text-base-content/60 border-base-300 hover:border-base-content/30 hover:text-base-content'"
              @click="userStore.gridStyle = style"
            >{{ style }}</button>
          </div>
        </div>

        <!-- Line routing -->
        <div>
          <div class="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-3">Line Style</div>
          <div class="flex gap-1.5">
            <button
              v-for="style in ROUTING_STYLES"
              :key="style"
              class="flex-1 px-3 py-1.5 rounded text-xs capitalize border transition-colors"
              :class="userStore.routingStyle === style
                ? 'bg-primary text-primary-content border-primary'
                : 'bg-base-200 text-base-content/60 border-base-300 hover:border-base-content/30 hover:text-base-content'"
              @click="userStore.routingStyle = style"
            >{{ style }}</button>
          </div>
        </div>

      </div>

    </div>

    <!-- Backdrop -->
    <label class="modal-backdrop" :for="MODAL_ID" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore, AVAILABLE_THEMES } from '@/stores/user'

const MODAL_ID = 'settings-modal'

const open = defineModel<boolean>({ default: false })

const userStore = useUserStore()

const GRID_STYLES    = ['lines', 'dots', 'cross'] as const
const ROUTING_STYLES = ['orthogonal', 'rounded', 'straight'] as const
</script>
