import { watch } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useSimStore } from '@/stores/sim'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { loadSave, writeSave, getOrCreateDeviceId } from '@/persistence'
import { serialize, deserialize } from '@/persistence/serializer'
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
  let hydrating = false

  function buildSnapshot() {
    return {
      cards:           boardStore.cards,
      connections:     boardStore.connections,
      coin:            simStore.coin,
      researchPoints:  simStore.researchPoints,
      prestigeCount:   gameStore.prestigeCount,
      unlockedCardIds: gameStore.unlockedCardIds,
    }
  }

  async function saveNow(): Promise<void> {
    const save = serialize(buildSnapshot(), lastSave)
    await writeSave(save)
    lastSave = save
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
  watch([() => gameStore.prestigeCount, () => gameStore.unlockedCardIds], scheduleSave, { flush: 'post' })

  async function load(): Promise<boolean> {
    hydrating = true

    try {
      userStore.deviceId = await getOrCreateDeviceId()

      const save = await loadSave()
      if (!save) return false

      lastSave = save

      const state = deserialize(save)
      state.cards.forEach(card => boardStore.addCard(card))
      state.connections.forEach(conn => boardStore.addConnection(conn))
      simStore.coin            = state.coin
      simStore.researchPoints  = state.researchPoints
      gameStore.prestigeCount  = state.prestigeCount
      gameStore.unlockedCardIds = state.unlockedCardIds

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
