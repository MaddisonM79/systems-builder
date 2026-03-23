<template>
  <div class="relative w-full h-full">
    <VueFlow
      :node-types="nodeTypes"
      :default-edge-options="defaultEdgeOptions"
      :zoom-on-scroll="true"
      :pan-on-scroll="false"
      :pan-on-drag="true"
      :connect-on-click="false"
      class="w-full h-full bg-base-300"
    >
      <Background
        :gap="28"
        :size="1.5"
        :pattern-color="'oklch(var(--color-base-content) / 0.08)'"
        variant="dots"
      />
    </VueFlow>

    <!-- Theme switcher — top-right overlay -->
    <div class="absolute top-3 right-3 z-10">
      <ThemeSwitcher />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection as VFConnection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { useBoardStore } from '@/stores/board'
import type { Card, Connection } from '@/engine/graph'
import CardNode from './CardNode.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const boardStore = useBoardStore()
const { addNodes, addEdges, onConnect: vfOnConnect, onNodeDragStop: vfOnNodeDragStop, fitView } = useVueFlow()

const nodeTypes = { card: markRaw(CardNode) as any }

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
}

function cardToNode(card: Card): Node {
  return {
    id: card.id,
    type: 'card',
    position: card.position,
    data: {
      title: card.title,
      archetype: card.archetype,
      inputs: card.inputs,
      outputs: card.outputs,
    },
  }
}

function connectionToEdge(conn: Connection): Edge {
  return {
    id: conn.id,
    source: conn.sourceCardId,
    sourceHandle: conn.sourcePortId,
    target: conn.targetCardId,
    targetHandle: conn.targetPortId,
    type: 'smoothstep',
    animated: true,
  }
}

function seedBoard() {
  if (boardStore.cards.size > 0) return

  const cards: Card[] = [
    {
      id: 'card-wood-gen',
      archetype: 'generator',
      title: 'Wood Source',
      position: { x: 80, y: 200 },
      inputs: [],
      outputs: [{ id: 'port-wood-gen-out', side: 'output', label: 'Wood', resourceType: 'wood' }],
    },
    {
      id: 'card-refiner',
      archetype: 'refiner',
      title: 'Wood Refiner',
      position: { x: 380, y: 200 },
      inputs: [{ id: 'port-refiner-in', side: 'input', label: 'Raw Wood', resourceType: 'wood' }],
      outputs: [{ id: 'port-refiner-out', side: 'output', label: 'Lumber', resourceType: 'lumber' }],
    },
    {
      id: 'card-splitter',
      archetype: 'splitter',
      title: 'Lumber Split',
      position: { x: 680, y: 150 },
      inputs: [{ id: 'port-splitter-in', side: 'input', label: 'Lumber', resourceType: 'lumber' }],
      outputs: [
        { id: 'port-splitter-out-a', side: 'output', label: 'Batch A', resourceType: 'lumber' },
        { id: 'port-splitter-out-b', side: 'output', label: 'Batch B', resourceType: 'lumber' },
      ],
    },
    {
      id: 'card-market',
      archetype: 'seller',
      title: 'Market',
      position: { x: 980, y: 80 },
      inputs: [{ id: 'port-market-in', side: 'input', label: 'Lumber', resourceType: 'lumber' }],
      outputs: [],
    },
    {
      id: 'card-workshop',
      archetype: 'seller',
      title: 'Workshop',
      position: { x: 980, y: 290 },
      inputs: [{ id: 'port-workshop-in', side: 'input', label: 'Lumber', resourceType: 'lumber' }],
      outputs: [],
    },
  ]

  const connections: Connection[] = [
    { id: 'conn-gen-refiner',     sourceCardId: 'card-wood-gen', sourcePortId: 'port-wood-gen-out',    targetCardId: 'card-refiner',  targetPortId: 'port-refiner-in' },
    { id: 'conn-refiner-splitter', sourceCardId: 'card-refiner',  sourcePortId: 'port-refiner-out',    targetCardId: 'card-splitter', targetPortId: 'port-splitter-in' },
    { id: 'conn-splitter-market',  sourceCardId: 'card-splitter', sourcePortId: 'port-splitter-out-a', targetCardId: 'card-market',   targetPortId: 'port-market-in' },
    { id: 'conn-splitter-workshop', sourceCardId: 'card-splitter', sourcePortId: 'port-splitter-out-b', targetCardId: 'card-workshop', targetPortId: 'port-workshop-in' },
  ]

  cards.forEach(card => boardStore.addCard(card))
  connections.forEach(conn => boardStore.addConnection(conn))
}

onMounted(async () => {
  seedBoard()
  addNodes(Array.from(boardStore.cards.values()).map(cardToNode))
  addEdges(Array.from(boardStore.connections.values()).map(connectionToEdge))
  await nextTick()
  fitView({ padding: 0.15 })
})

vfOnConnect((params: VFConnection) => {
  if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return
  const connId = `conn-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`
  boardStore.addConnection({
    id: connId,
    sourceCardId: params.source,
    sourcePortId: params.sourceHandle,
    targetCardId: params.target,
    targetPortId: params.targetHandle,
  })
  addEdges([{ id: connId, source: params.source, sourceHandle: params.sourceHandle, target: params.target, targetHandle: params.targetHandle, type: 'smoothstep', animated: true }])
})

vfOnNodeDragStop(({ node }) => {
  boardStore.updateCard(node.id, { position: node.position })
})
</script>
