<template>
  <div class="flex flex-col w-full h-full">
    <Header />
    <MenuBar
      :build-active="showBuildMenu"
      @toggle-build="showBuildMenu = !showBuildMenu"
      @open-upgrades="showProgression = true"
      @open-research="showProgression = true"
      @open-prestige="showProgression = true"
    />
    <main class="flex-1 overflow-hidden min-h-0">
      <Desktop :show-build-menu="showBuildMenu" />
    </main>
    <Footer />
    <DevPanel />
  </div>

  <ProgressionModal v-model="showProgression" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import MenuBar from '@/components/MenuBar.vue'
import Footer from '@/components/Footer.vue'
import Desktop from '@/components/Desktop.vue'
import DevPanel from '@/components/DevPanel.vue'
import ProgressionModal from '@/components/ProgressionModal.vue'
import { useGameLoop } from '@/composables/useGameLoop'

const gameLoop = useGameLoop()
onMounted(() => gameLoop.start())

const showBuildMenu  = ref(true)
const showProgression = ref(false)
</script>
