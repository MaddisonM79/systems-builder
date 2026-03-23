import { defineStore } from 'pinia'
import { shallowRef, triggerRef } from 'vue'
import type { Card, CardId, Connection, ConnectionId } from '@/engine/graph'

export const useBoardStore = defineStore('board', () => {
  // shallowRef — Vue watches the Map reference, not every nested card property
  // Use triggerRef() manually after mutating card internals
  const cards = shallowRef(new Map<CardId, Card>())
  const connections = shallowRef(new Map<ConnectionId, Connection>())

  function addCard(card: Card): void {
    cards.value.set(card.id, card)
    triggerRef(cards)
  }

  function removeCard(id: CardId): void {
    cards.value.delete(id)
    triggerRef(cards)
  }

  function updateCard(id: CardId, patch: Partial<Card>): void {
    const card = cards.value.get(id)
    if (!card) return
    cards.value.set(id, { ...card, ...patch })
    triggerRef(cards)
  }

  function addConnection(connection: Connection): void {
    connections.value.set(connection.id, connection)
    triggerRef(connections)
  }

  function removeConnection(id: ConnectionId): void {
    connections.value.delete(id)
    triggerRef(connections)
  }

  return {
    cards,
    connections,
    addCard,
    removeCard,
    updateCard,
    addConnection,
    removeConnection,
  }
})
