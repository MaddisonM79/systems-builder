// Flow simulation — pure TypeScript, no framework imports
import type { CardId, ConnectionId, Card, Connection } from '@/engine/graph'
import type { CardDefinition, ItemDefinition } from '@system-builder/schemas'
import type { AppliedBonus, FlowItem } from '@system-builder/schemas'

// ─── Buffer capacities ────────────────────────────────────────────────────────

const CAP = {
  GENERATOR_OUT: 10,
  REFINER_IN:    5,
  REFINER_OUT:   5,
  STORAGE_OUT:   5,
  SPLITTER_IN:   5,
  SPLITTER_OUT:  5,
  SELLER_IN:     10,
} as const

// ─── Runtime state per card ───────────────────────────────────────────────────

type CardRuntime = {
  inputBuffers:  Map<string, FlowItem[]>  // portId → queued items
  outputBuffers: Map<string, FlowItem[]>  // portId → queued items
  accumulators:  Map<string, number>      // key → fractional carry or timer value
  rrIndex:       number                  // round-robin cursor for splitters
}

// ─── Public types ─────────────────────────────────────────────────────────────

export type SimDelta = {
  coinDelta:           number
  researchPointsDelta: number
  cardXpDeltas:        Record<string, number>  // cardId → xp gained this tick
  poolLevels:          Record<string, number>  // storage cardId → absolute item count
  portFlows:           Record<string, number>  // portId → items moved this tick
  portFill:            Record<string, number>  // portId → fill ratio 0.0–1.0
  portCount:           Record<string, number>  // portId → item count in buffer
}

// Per-port buffer snapshot — full item fidelity so bonuses survive reload
export type BufferContents = Record<string, {
  resourceType:   string
  appliedBonuses: AppliedBonus[][]  // one inner array per item
}>

export type Simulation = {
  tick(dt: number): SimDelta
  reinit(cards: Map<CardId, Card>, connections: Map<ConnectionId, Connection>): void
  getBufferContents(): BufferContents
  seedBuffers(contents: BufferContents): void
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createSimulation(
  initialCards:       Map<CardId, Card>,
  initialConnections: Map<ConnectionId, Connection>,
  catalog:            CardDefinition[],
  itemDefs:           ItemDefinition[],
): Simulation {
  let cards       = initialCards
  let connections = initialConnections

  const runtimes = new Map<CardId, CardRuntime>()
  let topoOrder: CardId[] = []

  // ── Initialization ──────────────────────────────────────────────────────────

  function initRuntimes(): void {
    // Remove stale runtimes for deleted cards
    for (const id of runtimes.keys()) {
      if (!cards.has(id)) runtimes.delete(id)
    }
    // Add runtimes for new cards; preserve existing ones (maintains buffer state)
    for (const [id, card] of cards) {
      if (runtimes.has(id)) continue
      runtimes.set(id, {
        inputBuffers:  new Map(card.inputs.map(p  => [p.id, []])),
        outputBuffers: new Map(card.outputs.map(p => [p.id, []])),
        accumulators:  new Map(),
        rrIndex:       0,
      })
    }
    topoOrder = topologicalSort()
  }

  // ── Topological sort (Kahn's algorithm) ─────────────────────────────────────

  function topologicalSort(): CardId[] {
    const inDegree  = new Map<CardId, number>()
    const adjacency = new Map<CardId, CardId[]>()

    for (const id of cards.keys()) {
      inDegree.set(id, 0)
      adjacency.set(id, [])
    }
    for (const c of connections.values()) {
      adjacency.get(c.sourceCardId)?.push(c.targetCardId)
      inDegree.set(c.targetCardId, (inDegree.get(c.targetCardId) ?? 0) + 1)
    }

    const queue  = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id)
    const result: CardId[] = []

    while (queue.length > 0) {
      const id = queue.shift()!
      result.push(id)
      for (const next of adjacency.get(id) ?? []) {
        const d = (inDegree.get(next) ?? 1) - 1
        inDegree.set(next, d)
        if (d === 0) queue.push(next)
      }
    }

    if (result.length < cards.size) {
      console.warn('[sim] Cycle detected in graph — some cards skipped this tick')
    }
    return result
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function defFor(cardId: CardId): CardDefinition | undefined {
    const card = cards.get(cardId)
    return card ? catalog.find(d => d.id === card.typeId) : undefined
  }

  function getAcc(rt: CardRuntime, key: string): number {
    return rt.accumulators.get(key) ?? 0
  }

  function setAcc(rt: CardRuntime, key: string, v: number): void {
    rt.accumulators.set(key, v)
  }

  // Count how many upgrade slots this item has already consumed
  function usedSlots(item: FlowItem): number {
    return item.appliedBonuses.reduce((sum, b) => {
      const card = cards.get(b.refinerId)
      if (!card) return sum
      const def = catalog.find(d => d.id === card.typeId)
      if (def?.archetype !== 'refiner' || def.refinerMode.mode !== 'upgrade') return sum
      return sum + def.refinerMode.slotCost
    }, 0)
  }

  function maxSlotsFor(resourceType: string): number {
    return itemDefs.find(i => i.id === resourceType)?.baseUpgradeSlots ?? 0
  }

  function coinValue(item: FlowItem): number {
    const base = itemDefs.find(i => i.id === item.resourceType)?.baseValue ?? 0
    return base + item.appliedBonuses.reduce((s, b) => s + b.bonus, 0)
  }

  // ── Per-card processing ──────────────────────────────────────────────────────

  function processGenerator(cardId: CardId, dt: number): void {
    const card = cards.get(cardId)!
    const def  = defFor(cardId)
    const rt   = runtimes.get(cardId)!
    if (def?.archetype !== 'generator') return

    let n = 0
    if (def.flow.mode === 'continuous') {
      const acc = getAcc(rt, 'main') + def.flow.ratePerSecond * dt
      n = Math.floor(acc)
      setAcc(rt, 'main', acc - n)
    } else {
      const timer = getAcc(rt, 'timer') + dt
      if (timer >= def.flow.intervalSeconds) {
        n = def.flow.batchSize
        setAcc(rt, 'timer', timer - def.flow.intervalSeconds)
      } else {
        setAcc(rt, 'timer', timer)
        return
      }
    }

    // Distribute items across output ports (round-robin for multi-port generators)
    const portCount = card.outputs.length
    if (portCount === 0) return
    for (let i = 0; i < n; i++) {
      const port = card.outputs[i % portCount]
      const buf  = rt.outputBuffers.get(port.id)
      if (buf && buf.length < CAP.GENERATOR_OUT) {
        buf.push({ resourceType: def.outputResource, appliedBonuses: [] })
      }
    }
  }

  function processRefiner(cardId: CardId, dt: number): void {
    const def = defFor(cardId)
    const rt  = runtimes.get(cardId)!
    if (def?.archetype !== 'refiner') return

    const inPortId  = `${cardId}:in:0`
    const outPortId = `${cardId}:out:0`
    const inBuf  = rt.inputBuffers.get(inPortId)  ?? []
    const outBuf = rt.outputBuffers.get(outPortId) ?? []

    // Rate-limit: how many items can be processed this tick
    const flowRate = def.flow.mode === 'continuous' ? def.flow.ratePerSecond : def.flow.batchSize / def.flow.intervalSeconds
    const acc = getAcc(rt, 'main') + flowRate * dt
    let capacity = Math.floor(acc)
    setAcc(rt, 'main', acc - capacity)

    if (def.refinerMode.mode === 'upgrade') {
      const { valueBonus, slotCost } = def.refinerMode
      while (capacity > 0 && inBuf.length > 0 && outBuf.length < CAP.REFINER_OUT) {
        const item = inBuf.shift()!
        // Apply bonus only if upgrade slots remain
        if (usedSlots(item) + slotCost <= maxSlotsFor(item.resourceType)) {
          item.appliedBonuses.push({ refinerId: cardId, bonus: valueBonus })
        }
        outBuf.push(item)
        capacity--
      }
    } else {
      // transform mode — consume N input items, produce M output items
      const { inputUnits, outputUnits } = def.refinerMode.conversionRatio
      const outResource = def.refinerMode.outputResource
      while (
        capacity > 0 &&
        inBuf.length >= inputUnits &&
        outBuf.length + outputUnits <= CAP.REFINER_OUT
      ) {
        inBuf.splice(0, inputUnits)
        for (let j = 0; j < outputUnits; j++) {
          outBuf.push({ resourceType: outResource, appliedBonuses: [] })
        }
        capacity--
      }
    }
  }

  function processSplitter(cardId: CardId): void {
    const card  = cards.get(cardId)!
    const rt    = runtimes.get(cardId)!
    const inBuf = rt.inputBuffers.get(`${cardId}:in:0`) ?? []
    const outCount = card.outputs.length
    if (outCount === 0) return

    while (inBuf.length > 0) {
      if (card.outputRouting.mode === 'weighted') {
        const weights = card.outputRouting.weights
        const rand = Math.random() * 100
        let cum = 0
        let chosen = 0
        for (let i = 0; i < weights.length; i++) {
          cum += weights[i]
          if (rand < cum) { chosen = i; break }
        }
        const buf = rt.outputBuffers.get(`${cardId}:out:${chosen}`)
        if (!buf || buf.length >= CAP.SPLITTER_OUT) break  // back-pressure
        buf.push(inBuf.shift()!)
      } else {
        // even: round-robin across output ports
        let placed = false
        for (let attempt = 0; attempt < outCount; attempt++) {
          const idx = rt.rrIndex % outCount
          rt.rrIndex++
          const buf = rt.outputBuffers.get(`${cardId}:out:${idx}`)
          if (buf && buf.length < CAP.SPLITTER_OUT) {
            buf.push(inBuf.shift()!)
            placed = true
            break
          }
        }
        if (!placed) break  // all output ports full — back-pressure
      }
    }
  }

  function processStorage(cardId: CardId, dt: number, delta: SimDelta): void {
    const def = defFor(cardId)
    const rt  = runtimes.get(cardId)!
    if (def?.archetype !== 'storage') return

    // Storage inputBuffer IS the pool — items arrive via routeConnections
    const inBuf  = rt.inputBuffers.get(`${cardId}:in:0`)  ?? []
    const outBuf = rt.outputBuffers.get(`${cardId}:out:0`) ?? []

    // Drain from pool to output buffer at outputFlow rate
    const outRate = def.outputFlow.mode === 'continuous' ? def.outputFlow.ratePerSecond : def.outputFlow.batchSize / def.outputFlow.intervalSeconds
    const acc = getAcc(rt, 'main') + outRate * dt
    const drainCount = Math.floor(acc)
    setAcc(rt, 'main', acc - drainCount)

    const actual = Math.min(drainCount, inBuf.length, CAP.STORAGE_OUT - outBuf.length)
    for (let i = 0; i < actual; i++) {
      outBuf.push(inBuf.shift()!)
    }

    delta.poolLevels[cardId] = inBuf.length
  }

  function processSeller(cardId: CardId, dt: number, delta: SimDelta): void {
    const def = defFor(cardId)
    const rt  = runtimes.get(cardId)!
    if (def?.archetype !== 'seller') return

    def.acceptedResources.forEach((entry, i) => {
      const portId = `${cardId}:in:${i}`
      const inBuf  = rt.inputBuffers.get(portId) ?? []

      let consumeCount = 0
      if (entry.flow.mode === 'continuous') {
        const acc = getAcc(rt, portId) + entry.flow.ratePerSecond * dt
        consumeCount = Math.floor(acc)
        setAcc(rt, portId, acc - consumeCount)
      } else {
        const timer = getAcc(rt, `t:${portId}`) + dt
        if (timer >= entry.flow.intervalSeconds) {
          consumeCount = entry.flow.batchSize
          setAcc(rt, `t:${portId}`, timer - entry.flow.intervalSeconds)
        } else {
          setAcc(rt, `t:${portId}`, timer)
        }
      }

      const actual = Math.min(consumeCount, inBuf.length)
      for (let j = 0; j < actual; j++) {
        delta.coinDelta += coinValue(inBuf.shift()!)
        delta.cardXpDeltas[cardId] = (delta.cardXpDeltas[cardId] ?? 0) + 1
      }
    })
  }

  // ── Route output buffers → downstream input buffers ───────────────────────────

  function routeConnections(delta: SimDelta): void {
    for (const conn of connections.values()) {
      const srcRt = runtimes.get(conn.sourceCardId)
      const dstRt = runtimes.get(conn.targetCardId)
      if (!srcRt || !dstRt) continue

      const outBuf = srcRt.outputBuffers.get(conn.sourcePortId)
      const inBuf  = dstRt.inputBuffers.get(conn.targetPortId)
      if (!outBuf || !inBuf) continue

      // Determine target input buffer capacity
      const dstDef = defFor(conn.targetCardId)
      let cap: number = CAP.SELLER_IN
      if      (dstDef?.archetype === 'storage')  cap = dstDef.baseCapacity
      else if (dstDef?.archetype === 'refiner')  cap = CAP.REFINER_IN
      else if (dstDef?.archetype === 'splitter') cap = CAP.SPLITTER_IN

      let moved = 0
      while (outBuf.length > 0 && inBuf.length < cap) {
        inBuf.push(outBuf.shift()!)
        moved++
      }
      if (moved > 0) {
        delta.portFlows[conn.sourcePortId] = (delta.portFlows[conn.sourcePortId] ?? 0) + moved
        delta.portFlows[conn.targetPortId] = (delta.portFlows[conn.targetPortId] ?? 0) + moved
      }
    }
  }

  // ── Main tick ────────────────────────────────────────────────────────────────

  function tick(dt: number): SimDelta {
    const delta: SimDelta = {
      coinDelta:           0,
      researchPointsDelta: 0,
      cardXpDeltas:        {},
      poolLevels:          {},
      portFlows:           {},
      portFill:            {},
      portCount:           {},
    }

    for (const cardId of topoOrder) {
      const def = defFor(cardId)
      if (!def) continue
      switch (def.archetype) {
        case 'generator': processGenerator(cardId, dt);       break
        case 'refiner':   processRefiner(cardId, dt);         break
        case 'splitter':  processSplitter(cardId);            break
        case 'storage':   processStorage(cardId, dt, delta);  break
        case 'seller':    processSeller(cardId, dt, delta);   break
      }
    }

    routeConnections(delta)
    snapshotBufferFill(delta)
    return delta
  }

  // ── Snapshot buffer fill ratios after routing ─────────────────────────────────

  function snapshotBufferFill(delta: SimDelta): void {
    for (const [cardId, rt] of runtimes) {
      const def = defFor(cardId)
      if (!def) continue

      // Output buffer caps
      let outCap = 1
      if      (def.archetype === 'generator') outCap = CAP.GENERATOR_OUT
      else if (def.archetype === 'refiner')   outCap = CAP.REFINER_OUT
      else if (def.archetype === 'splitter')  outCap = CAP.SPLITTER_OUT
      else if (def.archetype === 'storage')   outCap = CAP.STORAGE_OUT
      for (const [portId, buf] of rt.outputBuffers) {
        delta.portFill[portId]  = buf.length / outCap
        delta.portCount[portId] = buf.length
      }

      // Input buffer caps
      let inCap = 1
      if      (def.archetype === 'refiner')  inCap = CAP.REFINER_IN
      else if (def.archetype === 'splitter') inCap = CAP.SPLITTER_IN
      else if (def.archetype === 'seller')   inCap = CAP.SELLER_IN
      else if (def.archetype === 'storage')  inCap = def.baseCapacity
      for (const [portId, buf] of rt.inputBuffers) {
        delta.portFill[portId]  = buf.length / inCap
        delta.portCount[portId] = buf.length
      }
    }
  }

  // ── Reinit on graph change ───────────────────────────────────────────────────

  function reinit(
    newCards:       Map<CardId, Card>,
    newConnections: Map<ConnectionId, Connection>,
  ): void {
    cards       = newCards
    connections = newConnections
    initRuntimes()
  }

  // ── Buffer contents snapshot / seed ─────────────────────────────────────────

  function getBufferContents(): BufferContents {
    const out: BufferContents = {}
    for (const rt of runtimes.values()) {
      for (const [portId, buf] of rt.inputBuffers) {
        if (buf.length > 0) out[portId] = {
          resourceType:   buf[0].resourceType,
          appliedBonuses: buf.map(item => item.appliedBonuses),
        }
      }
      for (const [portId, buf] of rt.outputBuffers) {
        if (buf.length > 0) out[portId] = {
          resourceType:   buf[0].resourceType,
          appliedBonuses: buf.map(item => item.appliedBonuses),
        }
      }
    }
    return out
  }

  function seedBuffers(contents: BufferContents): void {
    for (const [portId, { resourceType, appliedBonuses }] of Object.entries(contents)) {
      // portId format: `${cardId}:in:${i}` or `${cardId}:out:${i}`
      const parts  = portId.split(':')
      const cardId = parts.slice(0, -2).join(':')
      const dir    = parts[parts.length - 2]
      const rt     = runtimes.get(cardId)
      if (!rt) continue
      const buf = dir === 'in' ? rt.inputBuffers.get(portId) : rt.outputBuffers.get(portId)
      if (!buf) continue
      buf.length = 0
      for (const bonuses of appliedBonuses) {
        buf.push({ resourceType, appliedBonuses: bonuses })
      }
    }
  }

  initRuntimes()
  return { tick, reinit, getBufferContents, seedBuffers }
}
