import { defineStore } from 'pinia'
import { shallowRef, triggerRef, ref } from 'vue'
import type { Card, CardId, Connection, ConnectionId } from '@/engine/graph'

export const useBoardStore = defineStore('board', () => {
  // shallowRef — Vue watches the Map reference, not every nested card property
  // Use triggerRef() manually after mutating card internals
  const cards = shallowRef(new Map<CardId, Card>())
  const connections = shallowRef(new Map<ConnectionId, Connection>())

  // Plain ref counter — increments on every mutation so watchers fire reliably.
  // storeToRefs wraps shallowRef in an ObjectRefImpl which loses the forceTrigger
  // flag, causing watch() to skip callbacks when the Map reference doesn't change.
  const revision = ref(0)

  function addCard(card: Card): void {
    cards.value.set(card.id, card)
    triggerRef(cards)
    revision.value++
  }

  function removeCard(id: CardId): void {
    cards.value.delete(id)
    triggerRef(cards)
    revision.value++
  }

  function updateCard(id: CardId, patch: Partial<Card>): void {
    const card = cards.value.get(id)
    if (!card) return
    cards.value.set(id, { ...card, ...patch })
    triggerRef(cards)
    revision.value++
  }

  function addConnection(connection: Connection): void {
    connections.value.set(connection.id, connection)
    triggerRef(connections)
    revision.value++
  }

  function removeConnection(id: ConnectionId): void {
    connections.value.delete(id)
    triggerRef(connections)
    revision.value++
  }

  return {
    cards,
    connections,
    revision,
    addCard,
    removeCard,
    updateCard,
    addConnection,
    removeConnection,
  }
})
