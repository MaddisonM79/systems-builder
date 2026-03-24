<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-base-300/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

        <!-- Panel -->
        <div class="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-base-200 border border-base-300">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 border-b border-base-300" style="height: 48px;">
            <span class="text-sm font-semibold text-base-content">Progression</span>
            <button
              class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
              @click="$emit('update:modelValue', false)"
            >✕</button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-base-300 px-5">
            <button
              v-for="tab in TABS"
              :key="tab.id"
              class="py-2.5 px-3 text-xs font-medium border-b-2 -mb-px transition-colors duration-100"
              :class="activeTab === tab.id
                ? 'border-primary text-base-content'
                : 'border-transparent text-base-content/40 hover:text-base-content/70'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab content -->
          <div class="bg-base-100">
            <UpgradesTab v-if="activeTab === 'upgrades'" />

            <div v-else class="flex items-center justify-center py-16 text-sm text-base-content/30 italic">
              Coming soon
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UpgradesTab from './UpgradesTab.vue'

defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

const TABS = [
  { id: 'upgrades',      label: 'Upgrades' },
  { id: 'research_tree', label: 'Research Tree' },
  { id: 'prestige',      label: 'Prestige' },
] as const

type TabId = typeof TABS[number]['id']
const activeTab = ref<TabId>('upgrades')
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
