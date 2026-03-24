<template>
  <div class="relative w-full h-full">
    <VueFlow
      :node-types="nodeTypes"
      :default-edge-options="defaultEdgeOptions"
      :zoom-on-scroll="true"
      :pan-on-scroll="false"
      :pan-on-drag="true"
      :connect-on-click="false"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :is-valid-connection="isValidConnection"
      :delete-key-code="['Backspace', 'Delete']"
      :edges-updatable="true"
      @edge-update-start="onEdgeUpdateStart"
      @edge-update="onEdgeUpdate"
      @edge-update-end="onEdgeUpdateEnd"
      class="w-full h-full bg-base-300"
    >
      <GridBackground />
    </VueFlow>

  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, markRaw, computed, watch } from 'vue'
import {
  VueFlow, useVueFlow,
  type Node, type Edge,
  type Connection as VFConnection,
  type NodeRemoveChange,
  type EdgeRemoveChange,
  type EdgeUpdateEvent,
  type EdgeMouseEvent,
} from '@vue-flow/core'
import { useBoardStore } from '@/stores/board'
import { useUserStore } from '@/stores/user'
import { usePersistence } from '@/composables/usePersistence'
import type { Card, Connection } from '@/engine/graph'
import CardNode from './CardNode.vue'
import GridBackground from './GridBackground.vue'

const boardStore = useBoardStore()
const userStore  = useUserStore()
const {
  addNodes, addEdges, fitView,
  onConnect: vfOnConnect,
  onNodeDragStop: vfOnNodeDragStop,
  onNodesChange: vfOnNodesChange,
  onEdgesChange: vfOnEdgesChange,
  updateEdge,
  removeEdges,
  getEdges,
  edges: vfEdges,
} = useVueFlow()
const { load } = usePersistence()

const nodeTypes = { card: markRaw(CardNode) as any }

const ROUTING_TYPE_MAP = {
  orthogonal: 'step',
  rounded:    'smoothstep',
  straight:   'straight',
} as const

const edgeType = computed(() => ROUTING_TYPE_MAP[userStore.routingStyle])

const defaultEdgeOptions = computed(() => ({
  type: edgeType.value,
  animated: true,
}))

watch(edgeType, (type) => {
  for (const edge of vfEdges.value) {
    edge.type = type
  }
})

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
    type: edgeType.value,
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
  const hasSave = await load()
  if (!hasSave) seedBoard()

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
  addEdges([{ id: connId, source: params.source, sourceHandle: params.sourceHandle, target: params.target, targetHandle: params.targetHandle, type: edgeType.value, animated: true }])
})

vfOnNodeDragStop(({ node }) => {
  boardStore.updateCard(node.id, { position: node.position })
})

// Prevent self-connections and duplicate port connections
function isValidConnection(connection: VFConnection): boolean {
  if (connection.source === connection.target) return false
  const targetAlreadyConnected = getEdges.value.some(
    e => e.target === connection.target && e.targetHandle === connection.targetHandle,
  )
  return !targetAlreadyConnected
}

// Edge reconnect — drag either endpoint to a new handle, or drop in empty space to disconnect
let edgeUpdateSuccessful = false

function onEdgeUpdateStart() {
  edgeUpdateSuccessful = false
}

function onEdgeUpdate({ edge, connection }: EdgeUpdateEvent) {
  if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return
  edgeUpdateSuccessful = true
  updateEdge(edge, connection)
  boardStore.removeConnection(edge.id)
  boardStore.addConnection({
    id: edge.id,
    sourceCardId: connection.source,
    sourcePortId: connection.sourceHandle,
    targetCardId: connection.target,
    targetPortId: connection.targetHandle,
  })
}

function onEdgeUpdateEnd({ edge }: EdgeMouseEvent) {
  if (!edgeUpdateSuccessful) {
    removeEdges([edge.id])
    // vfOnEdgesChange 'remove' fires from removeEdges → boardStore.removeConnection called there
  }
}

vfOnEdgesChange((changes) => {
  changes
    .filter((c): c is EdgeRemoveChange => c.type === 'remove')
    .forEach(c => boardStore.removeConnection(c.id))
})

vfOnNodesChange((changes) => {
  changes
    .filter((c): c is NodeRemoveChange => c.type === 'remove')
    .forEach(c => boardStore.removeCard(c.id))
})
</script>
