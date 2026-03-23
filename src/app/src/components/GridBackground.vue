<template>
  <svg class="grid-bg" :style="{ color: 'var(--color-base-content)' }" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="sb-grid"
        :width="majorSize"
        :height="majorSize"
        patternUnits="userSpaceOnUse"
        :x="offsetX % majorSize"
        :y="offsetY % majorSize"
      >
        <!-- ── LINES ─────────────────────────────────────────────── -->
        <template v-if="gridStyle === 'lines'">
          <line
            v-for="i in CELLS - 1" :key="`lv-${i}`"
            :x1="i * minorSize" y1="0" :x2="i * minorSize" :y2="majorSize"
            stroke="currentColor" :stroke-width="MINOR_W" :stroke-opacity="MINOR_O"
          />
          <line
            v-for="i in CELLS - 1" :key="`lh-${i}`"
            x1="0" :y1="i * minorSize" :x2="majorSize" :y2="i * minorSize"
            stroke="currentColor" :stroke-width="MINOR_W" :stroke-opacity="MINOR_O"
          />
          <!-- major lines inset by half stroke so full width is inside clip -->
          <line
            :x1="MAJOR_W / 2" y1="0" :x2="MAJOR_W / 2" :y2="majorSize"
            stroke="currentColor" :stroke-width="MAJOR_W" :stroke-opacity="MAJOR_O"
          />
          <line
            x1="0" :y1="MAJOR_W / 2" :x2="majorSize" :y2="MAJOR_W / 2"
            stroke="currentColor" :stroke-width="MAJOR_W" :stroke-opacity="MAJOR_O"
          />
        </template>

        <!-- ── DOTS ──────────────────────────────────────────────── -->
        <template v-else-if="gridStyle === 'dots'">
          <circle
            v-for="{ cx, cy, major } in dotMarks" :key="`d-${cx}-${cy}`"
            :cx="cx" :cy="cy"
            :r="major ? MAJOR_DOT_R : MINOR_DOT_R"
            fill="currentColor"
            :fill-opacity="major ? MAJOR_O : MINOR_O"
          />
        </template>

        <!-- ── CROSS ─────────────────────────────────────────────── -->
        <template v-else-if="gridStyle === 'cross'">
          <path
            v-for="{ cx, cy, major } in crossMarks" :key="`c-${cx}-${cy}`"
            :d="crossPath(cx, cy, major ? MAJOR_ARM : MINOR_ARM)"
            fill="none"
            stroke="currentColor"
            :stroke-width="major ? MAJOR_W : MINOR_W"
            :stroke-opacity="major ? MAJOR_O : MINOR_O"
            stroke-linecap="round"
          />
        </template>
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#sb-grid)" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useUserStore } from '@/stores/user'

// ── Grid constants ───────────────────────────────────────────────────────────

const MINOR_PX   = 20
const MAJOR_PX   = 200
const CELLS      = MAJOR_PX / MINOR_PX   // 10
const BOUNDARY_INSET = 10                 // px — must be >= MAJOR_ARM to avoid clip on boundary crosses/dots

// Lines
const MINOR_W    = 1.5
const MAJOR_W    = 2
const MINOR_O    = 0.12
const MAJOR_O    = 0.28

// Dots
const MINOR_DOT_R = 1.5
const MAJOR_DOT_R = 3

// Crosses
const MINOR_ARM  = 4    // half-arm length in px
const MAJOR_ARM  = 8

// ── Reactive state ───────────────────────────────────────────────────────────

const userStore = useUserStore()
const gridStyle = computed(() => userStore.gridStyle)

const { viewport } = useVueFlow()

const minorSize = computed(() => MINOR_PX * viewport.value.zoom)
const majorSize = computed(() => MAJOR_PX * viewport.value.zoom)
const offsetX   = computed(() => viewport.value.x)
const offsetY   = computed(() => viewport.value.y)

// ── Mark position helpers ────────────────────────────────────────────────────

type Mark = { cx: number; cy: number; major: boolean }

/** Returns one mark per grid intersection in the major cell, boundary-safe. */
function buildMarks(): Mark[] {
  const s   = minorSize.value
  const out: Mark[] = []
  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      const major = row === 0 && col === 0
      out.push({
        cx:    col === 0 ? BOUNDARY_INSET : col * s,
        cy:    row === 0 ? BOUNDARY_INSET : row * s,
        major,
      })
    }
  }
  return out
}

const dotMarks   = computed(buildMarks)
const crossMarks = computed(buildMarks)

function crossPath(cx: number, cy: number, arm: number): string {
  return `M ${cx - arm} ${cy} L ${cx + arm} ${cy} M ${cx} ${cy - arm} L ${cx} ${cy + arm}`
}
</script>
