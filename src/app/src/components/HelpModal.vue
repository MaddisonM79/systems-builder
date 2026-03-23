<template>
  <!-- DaisyUI modal — checkbox-driven, no JS open/close needed -->
  <input :id="MODAL_ID" type="checkbox" class="modal-toggle" v-model="open" />

  <div class="modal modal-bottom sm:modal-middle" role="dialog">
    <div class="modal-box max-w-2xl p-0 overflow-hidden flex flex-col max-h-[80vh]">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-200 shrink-0">
        <h2 class="font-semibold text-base-content text-sm tracking-wide">Help</h2>
        <label :for="MODAL_ID" class="btn btn-ghost btn-xs btn-circle">✕</label>
      </div>

      <!-- Tab bar -->
      <div class="flex border-b border-base-300 bg-base-200 shrink-0">
        <button
          v-for="tab in TABS"
          :key="tab"
          class="px-5 py-2 text-xs font-medium capitalize transition-colors border-b-2"
          :class="activeTab === tab
            ? 'border-primary text-base-content'
            : 'border-transparent text-base-content/40 hover:text-base-content'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="overflow-y-auto flex-1 p-5">

        <!-- ── CARDS ─────────────────────────────────────────────── -->
        <template v-if="activeTab === 'cards'">
          <p class="text-xs text-base-content/50 mb-4">
            Cards are the building blocks of your system. Each archetype has a distinct role in the production chain.
          </p>
          <div class="flex flex-col gap-2">
            <div
              v-for="arch in ARCHETYPES"
              :key="arch.name"
              class="flex items-start gap-3 p-3 rounded-lg bg-base-200"
            >
              <span class="w-3 h-3 rounded-full mt-0.5 shrink-0" :class="arch.dot" />
              <div>
                <div class="text-xs font-semibold text-base-content capitalize mb-0.5">{{ arch.name }}</div>
                <div class="text-xs text-base-content/50">{{ arch.description }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── CONNECTIONS ───────────────────────────────────────── -->
        <template v-else-if="activeTab === 'connections'">
          <p class="text-xs text-base-content/50 mb-4">
            Connections carry resources between card outputs and inputs. Different styles and shapes are coming.
          </p>
          <div class="flex flex-col gap-2">
            <div
              v-for="item in CONNECTION_STUBS"
              :key="item.name"
              class="flex items-start gap-3 p-3 rounded-lg bg-base-200"
            >
              <div class="w-8 h-8 rounded flex items-center justify-center shrink-0" :class="item.iconBg">
                <svg class="w-5 h-5" :class="item.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path :d="item.iconPath" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div>
                <div class="text-xs font-semibold text-base-content capitalize mb-0.5">{{ item.name }}</div>
                <div class="text-xs text-base-content/50">{{ item.description }}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 rounded-lg border border-dashed border-base-300">
            <p class="text-xs text-base-content/30 text-center">Connector shapes and colours — coming soon</p>
          </div>
        </template>

        <!-- ── CONTROLS ──────────────────────────────────────────── -->
        <template v-else-if="activeTab === 'controls'">
          <p class="text-xs text-base-content/50 mb-4">Keyboard and mouse reference.</p>
          <div class="flex flex-col gap-1">
            <div
              v-for="ctrl in CONTROLS"
              :key="ctrl.action"
              class="flex items-center justify-between py-2 border-b border-base-200 last:border-0"
            >
              <span class="text-xs text-base-content/60">{{ ctrl.action }}</span>
              <div class="flex gap-1">
                <kbd v-for="k in ctrl.keys" :key="k" class="kbd kbd-xs">{{ k }}</kbd>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- Backdrop -->
    <label class="modal-backdrop" :for="MODAL_ID" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const MODAL_ID = 'help-modal'

const open      = defineModel<boolean>({ default: false })
const activeTab = ref<'cards' | 'connections' | 'controls'>('cards')
const TABS      = ['cards', 'connections', 'controls'] as const

// ── Card archetypes ──────────────────────────────────────────────────────────

const ARCHETYPES = [
  { name: 'generator',  dot: 'bg-success',   description: 'Produces resources from nothing. The start of every chain.' },
  { name: 'refiner',    dot: 'bg-info',       description: 'Transforms one resource type into another at a set rate.' },
  { name: 'splitter',   dot: 'bg-secondary',  description: 'Divides a single input flow across multiple outputs.' },
  { name: 'seller',     dot: 'bg-warning',    description: 'Converts resources into Coin. Terminates the chain.' },
  { name: 'storage',    dot: 'bg-accent',     description: 'Buffers resources to smooth out flow imbalances.' },
  { name: 'converter',  dot: 'bg-primary',    description: 'Exchanges one resource type for another using a ratio.' },
] as const

// ── Connection stubs ─────────────────────────────────────────────────────────

const CONNECTION_STUBS = [
  {
    name: 'standard',
    description: 'A direct link between one output port and one input port.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    iconPath: 'M5 12h14',
  },
  {
    name: 'chain',
    description: 'A sequence of connected cards forming a continuous production flow.',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    iconPath: 'M5 12h4m6 0h4M9 12a3 3 0 106 0 3 3 0 00-6 0',
  },
  {
    name: 'cycle',
    description: 'A loop between cards — only valid for specific archetype combinations.',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    iconPath: 'M4 4v5h5M20 20v-5h-5M4.07 15a9 9 0 1014.86-9.36',
  },
] as const

// ── Controls reference ───────────────────────────────────────────────────────

const CONTROLS = [
  { action: 'Pan canvas',         keys: ['drag'] },
  { action: 'Zoom in / out',      keys: ['scroll'] },
  { action: 'Select card',        keys: ['click'] },
  { action: 'Connect ports',      keys: ['drag port'] },
  { action: 'Delete selected',    keys: ['Del'] },
  { action: 'Fit view',           keys: ['Ctrl', 'Shift', 'F'] },
] as const
</script>
