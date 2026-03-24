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
      @dragover.prevent
      @drop="onDrop"
      class="w-full h-full bg-base-300"
    >
      <GridBackground />
    </VueFlow>

    <Transition name="build-menu">
      <BuildMenu v-if="showBuildMenu" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, markRaw, computed, watch } from 'vue'

defineProps<{ showBuildMenu: boolean }>()
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
import { createCard } from '@/engine/registry'
import { catalog } from '@system-builder/catalog'
import CardNode from './CardNode.vue'
import GridBackground from './GridBackground.vue'
import BuildMenu from './BuildMenu.vue'

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
  screenToFlowCoordinate,
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

function genRateLabel(card: Card): string | null {
  if (card.archetype !== 'generator') return null
  const def = catalog.find(d => d.id === card.typeId)
  if (!def || def.archetype !== 'generator') return null
  return def.flow.mode === 'continuous'
    ? `${def.flow.ratePerSecond}/s`
    : `${def.flow.batchSize} per ${def.flow.intervalSeconds}s`
}

function cardToNode(card: Card): Node {
  return {
    id: card.id,
    type: 'card',
    position: card.position,
    data: {
      title:     card.title,
      archetype: card.archetype,
      inputs:    card.inputs,
      outputs:   card.outputs,
      rateLabel: genRateLabel(card),
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

onMounted(async () => {
  await load()

  addNodes(Array.from(boardStore.cards.values()).map(cardToNode))
  addEdges(Array.from(boardStore.connections.values()).map(connectionToEdge))
  await nextTick()
  fitView({ padding: 0.15 })
})

// Drop a card from the BuildMenu onto the canvas
function onDrop(event: DragEvent) {
  const raw = event.dataTransfer?.getData('text/plain')
  if (!raw) return

  let payload: { typeId: string; offsetX: number; offsetY: number }
  try {
    payload = JSON.parse(raw)
  } catch {
    return
  }

  const def = catalog.find(d => d.id === payload.typeId)
  if (!def) return

  // Convert screen coords → flow canvas coords, offset by where the user grabbed the chip
  const position = screenToFlowCoordinate({
    x: event.clientX - (payload.offsetX ?? 0),
    y: event.clientY - (payload.offsetY ?? 0),
  })

  const id = crypto.randomUUID()
  const card = createCard(def, id, position)

  boardStore.addCard(card)
  addNodes([cardToNode(card)])
}

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

<style scoped>
.build-menu-enter-active,
.build-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.build-menu-enter-from,
.build-menu-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
