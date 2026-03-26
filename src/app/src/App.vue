<template>
  <div class="flex flex-col w-full h-full">
    <Header />
    <MenuBar :active-tab="activeTab" @tab-change="activeTab = $event" />
    <main class="flex-1 overflow-hidden min-h-0">
      <!-- Desktop stays mounted to preserve canvas position and game state -->
      <Desktop v-show="activeTab === 'build'" />

      <div v-if="activeTab === 'upgrades'" class="h-full overflow-auto">
        <UpgradesTab />
      </div>

      <div v-if="activeTab === 'research'" class="h-full overflow-hidden flex flex-col">
        <ResearchTab />
      </div>

      <div v-if="activeTab === 'prestige'" class="h-full flex items-center justify-center text-sm text-base-content/30 italic">
        Coming soon
      </div>
    </main>
    <Footer />
    <DevPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import MenuBar from '@/components/MenuBar.vue'
import type { TabId } from '@/components/MenuBar.vue'
import Footer from '@/components/Footer.vue'
import Desktop from '@/components/Desktop.vue'
import DevPanel from '@/components/DevPanel.vue'
import UpgradesTab from '@/components/UpgradesTab.vue'
import ResearchTab from '@/components/ResearchTab.vue'
import { useGameLoop } from '@/composables/useGameLoop'

const gameLoop = useGameLoop()
onMounted(() => gameLoop.start())

const activeTab = ref<TabId>('build')
</script>
