// Card and connection graph — pure TypeScript, no framework imports

export type CardId = string
export type ConnectionId = string
export type PortId = string

export type PortSide = 'input' | 'output'

export type Port = {
  id: PortId
  side: PortSide
  label: string
  resourceType: string
}

export type Card = {
  id: CardId
  archetype: string
  title: string
  position: { x: number; y: number }
  inputs: Port[]
  outputs: Port[]
}

export type Connection = {
  id: ConnectionId
  sourceCardId: CardId
  sourcePortId: PortId
  targetCardId: CardId
  targetPortId: PortId
}

// TODO: graph operations (add, remove, query)
// TODO: cycle detection — required before any cycle-capable card type is implemented
