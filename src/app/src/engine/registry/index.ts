// Card type registry — pure TypeScript, no framework imports
import type { CardDefinition } from '@system-builder/schemas'
import type { Card, Port } from '@/engine/graph'

// Capitalize the first letter of a resource type string for use as a port label
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Derive input and output ports from a card definition.
// Port IDs are deterministic: `${cardId}:in:${index}` / `${cardId}:out:${index}`
function derivePorts(def: CardDefinition, cardId: string): { inputs: Port[]; outputs: Port[] } {
  switch (def.archetype) {
    case 'generator': {
      const outputs: Port[] = Array.from({ length: def.defaultOutputPortCount }, (_, i) => ({
        id: `${cardId}:out:${i}`,
        side: 'output',
        label: capitalize(def.outputResource),
        resourceType: def.outputResource,
      }))
      return { inputs: [], outputs }
    }

    case 'refiner': {
      if (def.refinerMode.mode === 'upgrade') {
        const resource = def.refinerMode.resourceType
        return {
          inputs: [{ id: `${cardId}:in:0`, side: 'input', label: capitalize(resource), resourceType: resource }],
          outputs: [{ id: `${cardId}:out:0`, side: 'output', label: capitalize(resource), resourceType: resource }],
        }
      } else {
        // transform mode
        return {
          inputs: [{ id: `${cardId}:in:0`, side: 'input', label: capitalize(def.refinerMode.inputResource), resourceType: def.refinerMode.inputResource }],
          outputs: [{ id: `${cardId}:out:0`, side: 'output', label: capitalize(def.refinerMode.outputResource), resourceType: def.refinerMode.outputResource }],
        }
      }
    }

    case 'storage': {
      const resource = def.resourceType
      return {
        inputs: [{ id: `${cardId}:in:0`, side: 'input', label: capitalize(resource), resourceType: resource }],
        outputs: [{ id: `${cardId}:out:0`, side: 'output', label: capitalize(resource), resourceType: resource }],
      }
    }

    case 'splitter': {
      const resource = def.resourceType
      const outputs: Port[] = Array.from({ length: def.defaultOutputPortCount }, (_, i) => ({
        id: `${cardId}:out:${i}`,
        side: 'output',
        label: `Out ${i + 1}`,
        resourceType: resource,
      }))
      return {
        inputs: [{ id: `${cardId}:in:0`, side: 'input', label: capitalize(resource), resourceType: resource }],
        outputs,
      }
    }

    case 'seller': {
      const inputs: Port[] = def.acceptedResources.map((entry, i) => ({
        id: `${cardId}:in:${i}`,
        side: 'input',
        label: capitalize(entry.resource),
        resourceType: entry.resource,
      }))
      return { inputs, outputs: [] }
    }

    case 'researcher': {
      const inputs: Port[] = def.acceptedResources.map((entry, i) => ({
        id: `${cardId}:in:${i}`,
        side: 'input',
        label: capitalize(entry.resource),
        resourceType: entry.resource,
      }))
      return { inputs, outputs: [] }
    }

    default:
      // Converter and combiner archetypes — no ports derived yet
      return { inputs: [], outputs: [] }
  }
}

// Create a Card instance from a catalog definition.
// `id` must be unique per placed card; `position` is in flow canvas coordinates.
export function createCard(
  def: CardDefinition,
  id: string,
  position: { x: number; y: number },
): Card {
  const { inputs, outputs } = derivePorts(def, id)
  return {
    id,
    typeId: def.id,
    archetype: def.archetype,
    title: def.displayName,
    position,
    inputs,
    outputs,
    outputRouting: { mode: 'even' },
  }
}
