<template>
  <div class="flex flex-col w-full h-full">
    <Header />
    <main class="flex-1 overflow-hidden min-h-0">
      <Desktop />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Desktop from '@/components/Desktop.vue'
</script>
