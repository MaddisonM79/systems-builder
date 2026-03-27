import { watch } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useSimStore } from '@/stores/sim'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { loadSave, writeSave, getOrCreateDeviceId } from '@/persistence'
import { serialize, deserialize } from '@/persistence/serializer'
import { getSimBufferContents } from '@/composables/useGameLoop'
import { createCard } from '@/engine/registry'
import { catalog } from '@system-builder/catalog'
import type { SaveV1 } from '@system-builder/schemas'

const DEBOUNCE_MS = 1500

export function usePersistence() {
  const boardStore = useBoardStore()
  const simStore   = useSimStore()
  const gameStore  = useGameStore()
  const userStore  = useUserStore()

  let lastSave: SaveV1 | null = null
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  // Prevents auto-save from firing during initial store hydration
  let hydrating  = false
  // Prevents concurrent writes — if a save is already in flight, skip the overlap
  let saving     = false

  function buildSnapshot() {
    return {
      cards:             boardStore.cards,
      connections:       boardStore.connections,
      coin:              simStore.coin,
      researchPoints:    simStore.researchPoints,
      cardXp:            simStore.cardXp,
      cardLevels:        simStore.cardLevels,
      poolLevels:        simStore.poolLevels,
      bufferContents:    getSimBufferContents(),
      prestigeCount:     gameStore.prestigeCount,
      purchasedUpgrades: gameStore.purchasedUpgrades,
    }
  }

  async function saveNow(): Promise<void> {
    if (saving) return
    saving = true
    try {
      const save = serialize(buildSnapshot(), lastSave)
      await writeSave(save)
      lastSave = save
    } finally {
      saving = false
    }
  }

  function scheduleSave(): void {
    if (hydrating) return
    if (saveTimer !== null) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = null
      saveNow().catch(err => console.warn('[persistence] Auto-save failed:', err))
    }, DEBOUNCE_MS)
  }

  // Board store: watch the revision counter (plain ref) rather than the shallowRef Maps.
  // storeToRefs wraps shallowRef in ObjectRefImpl which loses the forceTrigger flag —
  // Vue's watch skips the callback when the Map reference is unchanged.
  watch(() => boardStore.revision, scheduleSave, { flush: 'post' })

  // Sim and game stores use plain refs
  watch([() => simStore.coin, () => simStore.researchPoints], scheduleSave, { flush: 'post' })
  watch([() => gameStore.prestigeCount, () => gameStore.purchasedUpgrades], scheduleSave, { flush: 'post' })

  async function load(): Promise<boolean> {
    hydrating = true

    try {
      userStore.deviceId = await getOrCreateDeviceId()

      const save = await loadSave()
      if (!save) return false

      lastSave = save

      const state = deserialize(save)
      // Ports are not stored in the save — reconstruct from catalog definition on load.
      // This keeps the save lean and ports always in sync with catalog changes.
      state.cards.forEach(savedCard => {
        const def = catalog.find(d => d.id === savedCard.typeId)
        if (!def) {
          console.warn(`[persistence] Unknown card typeId "${savedCard.typeId}" — skipping`)
          return
        }
        const card = createCard(def, savedCard.id, savedCard.position)
        card.outputRouting = savedCard.outputRouting
        boardStore.addCard(card)
      })
      state.connections.forEach(conn => boardStore.addConnection(conn))
      simStore.coin            = state.coin
      simStore.researchPoints  = state.researchPoints
      simStore.cardXp          = state.cardXp
      simStore.cardLevels      = state.cardLevels
      simStore.poolLevels      = state.poolLevels
      simStore.bufferContents  = state.bufferContents
      gameStore.prestigeCount    = state.prestigeCount
      gameStore.purchasedUpgrades = state.purchasedUpgrades

      return true
    } catch (err) {
      console.warn('[persistence] Load failed:', err)
      return false
    } finally {
      hydrating = false
    }
  }

  return { load, saveNow }
}
