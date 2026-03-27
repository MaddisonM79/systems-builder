import { computed, watch } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useSimStore } from '@/stores/sim'
import { createSimulation } from '@/engine/simulation'
import type { BufferContents, SimDelta, Simulation } from '@/engine/simulation'
import { catalog, items } from '@system-builder/catalog'
import { TICK_CONFIG } from '@system-builder/constants'

// Module-level singleton — any component calling useGameLoop() shares this instance
let _sim:           Simulation | null = null
let _intervalId:    ReturnType<typeof setInterval> | null = null
let _watcherActive: boolean = false

// Called by usePersistence at save time — avoids storing live buffer state in the store
export function getSimBufferContents(): BufferContents {
  return _sim?.getBufferContents() ?? {}
}

export function useGameLoop() {
  const boardStore = useBoardStore()
  const simStore   = useSimStore()

  function applyDelta(delta: SimDelta, dt: number): void {
    if (delta.coinDelta !== 0)           simStore.coin           += delta.coinDelta
    if (delta.researchPointsDelta !== 0) simStore.researchPoints += delta.researchPointsDelta

    for (const [cardId, xp] of Object.entries(delta.cardXpDeltas)) {
      simStore.setCardXp(cardId, (simStore.cardXp[cardId] ?? 0) + xp)
    }
    for (const [cardId, level] of Object.entries(delta.poolLevels)) {
      simStore.setPoolLevel(cardId, level)
    }
    simStore.updatePortRates(delta.portFlows, dt)
    simStore.updatePortFill(delta.portFill, delta.portCount)
  }

  function start(): void {
    if (_intervalId !== null) return
    _sim = createSimulation(boardStore.cards, boardStore.connections, catalog, items)
    // Restore buffer state from the last save (empty object on first run)
    if (Object.keys(simStore.bufferContents).length > 0) {
      _sim.seedBuffers(simStore.bufferContents)
    }
    _intervalId = setInterval(() => {
      if (_sim) applyDelta(_sim.tick(TICK_CONFIG.DT), TICK_CONFIG.DT)
    }, TICK_CONFIG.INTERVAL_MS)
  }

  function stop(): void {
    if (_intervalId !== null) {
      clearInterval(_intervalId)
      _intervalId = null
    }
  }

  // Run n real simulation ticks immediately (used by DevPanel)
  function manualTick(n: number): void {
    if (!_sim) return
    const dt = TICK_CONFIG.DT
    const merged: SimDelta = {
      coinDelta:           0,
      researchPointsDelta: 0,
      cardXpDeltas:        {},
      poolLevels:          {},
      portFlows:           {},
      portFill:            {},
      portCount:           {},
    }
    for (let i = 0; i < n; i++) {
      const d = _sim.tick(dt)
      merged.coinDelta           += d.coinDelta
      merged.researchPointsDelta += d.researchPointsDelta
      for (const [id, xp] of Object.entries(d.cardXpDeltas)) {
        merged.cardXpDeltas[id] = (merged.cardXpDeltas[id] ?? 0) + xp
      }
      // Pool levels are absolute — take the last tick's value
      for (const [id, lvl] of Object.entries(d.poolLevels)) {
        merged.poolLevels[id] = lvl
      }
      // Port flows accumulate across all ticks
      for (const [id, count] of Object.entries(d.portFlows)) {
        merged.portFlows[id] = (merged.portFlows[id] ?? 0) + count
      }
      // Port fill/count are absolute — take the last tick's snapshot
      merged.portFill  = d.portFill
      merged.portCount = d.portCount
    }
    applyDelta(merged, dt * n)
  }

  // Reinit simulation when the board graph changes (card added/removed/connected).
  // Guard ensures only one watcher is registered regardless of how many callers
  // invoke useGameLoop() (e.g. App.vue + DevPanel.vue both call it).
  if (!_watcherActive) {
    _watcherActive = true
    watch(() => boardStore.revision, () => {
      _sim?.reinit(boardStore.cards, boardStore.connections)
    }, { flush: 'post' })
  }

  const isRunning = computed(() => _intervalId !== null)

  return { start, stop, manualTick, isRunning }
}
