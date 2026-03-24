<template>
  <div v-if="isDev">
    <!-- Toggle button — fixed over the footer area -->
    <button
      class="fixed bottom-1.5 left-3 z-50 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded bg-base-300 text-base-content/40 hover:text-base-content/70 hover:bg-base-content/10 transition-colors select-none"
      @click="isOpen = !isOpen"
    >DEV</button>

    <!-- Panel -->
    <div
      v-if="isOpen"
      class="fixed bottom-9 left-3 z-50 w-[280px] max-h-[70vh] overflow-y-auto bg-base-200 border border-base-300 rounded-xl shadow-2xl font-mono text-xs"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-base-300">
        <span class="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">Developer Panel</span>
        <button
          class="text-base-content/30 hover:text-base-content/70 transition-colors"
          @click="isOpen = false"
        >✕</button>
      </div>

      <!-- Currency section -->
      <div class="px-3 py-2 border-b border-base-300">
        <div class="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-2">Currency</div>

        <!-- Coin row -->
        <div class="flex items-center gap-1 mb-1.5">
          <span class="text-base-content/50 w-6 shrink-0">¢</span>
          <input
            v-model.number="coinValue"
            type="number"
            class="input input-xs w-20 font-mono"
            min="0"
          />
          <button class="btn btn-xs btn-ghost font-mono" @click="simStore.coin += 100">+100</button>
          <button class="btn btn-xs btn-ghost font-mono" @click="simStore.coin += 1000">+1k</button>
          <button class="btn btn-xs btn-ghost font-mono" @click="simStore.coin += 10000">+10k</button>
        </div>

        <!-- Research Points row -->
        <div class="flex items-center gap-1">
          <span class="text-base-content/50 w-6 shrink-0">RP</span>
          <input
            v-model.number="rpValue"
            type="number"
            class="input input-xs w-20 font-mono"
            min="0"
          />
          <button class="btn btn-xs btn-ghost font-mono" @click="simStore.researchPoints += 10">+10</button>
          <button class="btn btn-xs btn-ghost font-mono" @click="simStore.researchPoints += 100">+100</button>
        </div>
      </div>

      <!-- Game State section -->
      <div class="px-3 py-2 border-b border-base-300">
        <div class="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-2">Game State</div>
        <div class="flex flex-col gap-1 text-base-content/60">
          <div class="flex justify-between">
            <span class="text-base-content/40">Prestige</span>
            <span>{{ gameStore.prestigeCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/40">Upgrades purchased</span>
            <span>{{ purchasedUpgradeCount }}</span>
          </div>
        </div>
      </div>

      <!-- Tick Controls section -->
      <div class="px-3 py-2">
        <div class="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-2">Tick Controls</div>

        <!-- Manual tick buttons -->
        <div class="flex gap-1 mb-2">
          <button class="btn btn-xs btn-outline font-mono" @click="doTick(1)">×1</button>
          <button class="btn btn-xs btn-outline font-mono" @click="doTick(10)">×10</button>
          <button class="btn btn-xs btn-outline font-mono" @click="doTick(100)">×100</button>
          <button class="btn btn-xs btn-outline font-mono" @click="doTick(1000)">×1000</button>
        </div>

        <!-- Auto-tick row -->
        <div class="flex items-center gap-2">
          <button
            class="btn btn-xs font-mono"
            :class="autoTicking ? 'btn-error' : 'btn-outline'"
            @click="toggleAutoTick"
          >{{ autoTicking ? 'Stop' : 'Start' }}</button>

          <select
            v-model.number="autoTickSpeed"
            class="select select-xs font-mono"
            :disabled="autoTicking"
          >
            <option :value="1000">1/s</option>
            <option :value="200">5/s</option>
            <option :value="100">10/s</option>
          </select>

          <!-- Pulsing indicator -->
          <span
            v-if="autoTicking"
            class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSimStore } from '@/stores/sim'
import { useGameStore } from '@/stores/game'
import { useGameLoop } from '@/composables/useGameLoop'

const isDev = import.meta.env.DEV

const simStore  = useSimStore()
const gameStore = useGameStore()
const gameLoop  = useGameLoop()

const isOpen = ref(false)

// Computed get/set pairs for v-model on store values
const coinValue = computed<number>({
  get: () => simStore.coin,
  set: (v: number) => { simStore.coin = v },
})

const rpValue = computed<number>({
  get: () => simStore.researchPoints,
  set: (v: number) => { simStore.researchPoints = v },
})

const purchasedUpgradeCount = computed<number>(() =>
  Object.values(gameStore.purchasedUpgrades).reduce((sum, n) => sum + n, 0),
)

// Tick logic — delegates to the real simulation
function doTick(n: number): void {
  gameLoop.manualTick(n)
}

// Auto-tick
const autoTicking = ref(false)
const autoTickSpeed = ref<number>(1000) // ms per tick
const autoTickInterval = ref<ReturnType<typeof setInterval> | null>(null)

function startAutoTick(): void {
  if (autoTickInterval.value !== null) return
  autoTicking.value = true
  autoTickInterval.value = setInterval(() => doTick(1), autoTickSpeed.value)
}

function stopAutoTick(): void {
  if (autoTickInterval.value !== null) {
    clearInterval(autoTickInterval.value)
    autoTickInterval.value = null
  }
  autoTicking.value = false
}

function toggleAutoTick(): void {
  if (autoTicking.value) {
    stopAutoTick()
  } else {
    startAutoTick()
  }
}

// Keyboard shortcut — backtick toggles the panel
function onKeyDown(e: KeyboardEvent): void {
  if (e.key === '`') {
    isOpen.value = !isOpen.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  stopAutoTick()
})
</script>
